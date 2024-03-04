"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[8592],{76090:(D,f,e)=>{e.d(f,{H:()=>x});var o=e(24006),d=e(65938),s=e(68745),c=e(35226),u=e.n(c),b=e(17489),t=e(94650),a=e(54041),n=e(89383),r=e(73555),i=e(4859),l=e(97392),m=e(59549),g=e(284),y=e(51572),C=e(36895);function I(v,P){1&v&&(t.\u0275\u0275elementStart(0,"div",16),t.\u0275\u0275element(1,"mat-spinner",17),t.\u0275\u0275elementEnd()),2&v&&(t.\u0275\u0275advance(1),t.\u0275\u0275property("diameter",100))}let x=(()=>{class v{constructor(E,_,p,O,T){this.fb=E,this.data=_,this.dialogRef=p,this.courseSequnceService=O,this.translate=T,this.subs=new s.Y,this.currentUser=null,this.isWaitingForResponse=!1}ngOnInit(){this.initForm(),this.data&&this.data._id&&this.patchValue()}initForm(){this.subject=this.fb.group({name:["",o.Validators.required],short_name:["",o.Validators.required],english_name:["",o.Validators.required]})}patchValue(){const E=b.cloneDeep(this.data);this.subject.patchValue(E),console.log("patchValue",this.subject.value)}checkFormValidity(){return!!this.subject.invalid&&(u().fire({type:"warning",title:this.translate.instant("FormSave_S1.TITLE"),html:this.translate.instant("FormSave_S1.TEXT"),confirmButtonText:this.translate.instant("FormSave_S1.BUTTON")}),this.subject.markAllAsTouched(),!0)}submitVerification(){if(this.checkFormValidity())return;this.isWaitingForResponse=!0;const E=b.cloneDeep(this.subject.value);this.subs.sink=this.data&&this.data._id?this.courseSequnceService.UpdateModule(this.data._id,E).subscribe(_=>{this.isWaitingForResponse=!1,u().fire({type:"success",title:this.translate.instant("Bravo!"),confirmButtonText:this.translate.instant("OK"),allowEnterKey:!1,allowEscapeKey:!1,allowOutsideClick:!1}).then(()=>{this.dialogRef.close(!this.data||"form"!==this.data.data||_)})},_=>{console.log("_message",_.message),this.isWaitingForResponse=!1,"GraphQL error: Module name already exist"===_.message?u().fire({title:this.translate.instant("Uniquename_S1.TITLE"),text:this.translate.instant("Uniquename_S1.TEXT"),type:"info",showConfirmButton:!0,confirmButtonText:this.translate.instant("Uniquename_S1.BUTTON 1")}):_&&_.message&&_.message.includes("Network error: Http failure response for")?u().fire({type:"warning",title:this.translate.instant("BAD_CONNECTION.Title"),html:this.translate.instant("BAD_CONNECTION.Text"),confirmButtonText:this.translate.instant("BAD_CONNECTION.Button"),allowOutsideClick:!1,allowEnterKey:!1,allowEscapeKey:!1}):u().fire({type:"info",title:this.translate.instant("SORRY"),text:_&&_.message?this.translate.instant(_.message.replaceAll("GraphQL error: ","")):_,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})}):this.courseSequnceService.CreateModule(E).subscribe(_=>{this.isWaitingForResponse=!1,u().fire({type:"success",title:this.translate.instant("Bravo!"),confirmButtonText:this.translate.instant("OK"),allowEnterKey:!1,allowEscapeKey:!1,allowOutsideClick:!1}).then(()=>{this.dialogRef.close(!this.data||"form"!==this.data.data||_)})},_=>{console.log("_message",_.message),this.isWaitingForResponse=!1,"GraphQL error: Module name already exist"===_.message?u().fire({title:this.translate.instant("Uniquename_S1.TITLE"),text:this.translate.instant("Uniquename_S1.TEXT"),type:"info",showConfirmButton:!0,confirmButtonText:this.translate.instant("Uniquename_S1.BUTTON 1")}):_&&_.message&&_.message.includes("Network error: Http failure response for")?u().fire({type:"warning",title:this.translate.instant("BAD_CONNECTION.Title"),html:this.translate.instant("BAD_CONNECTION.Text"),confirmButtonText:this.translate.instant("BAD_CONNECTION.Button"),allowOutsideClick:!1,allowEnterKey:!1,allowEscapeKey:!1}):u().fire({type:"info",title:this.translate.instant("SORRY"),text:_&&_.message?this.translate.instant(_.message.replaceAll("GraphQL error: ","")):_,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})})}ngOnDestroy(){this.subs.unsubscribe()}close(){this.dialogRef.close()}}return v.\u0275fac=function(E){return new(E||v)(t.\u0275\u0275directiveInject(o.UntypedFormBuilder),t.\u0275\u0275directiveInject(d.WI),t.\u0275\u0275directiveInject(d.so),t.\u0275\u0275directiveInject(a.z),t.\u0275\u0275directiveInject(n.sK))},v.\u0275cmp=t.\u0275\u0275defineComponent({type:v,selectors:[["ms-add-module-dialog"]],decls:39,vars:29,consts:[["cdkDrag","","cdkDragRootElement",".cdk-overlay-pane","cdkDragHandle","",1,"dialog-border"],[1,"header-dialog"],[1,"p-grid"],[1,"p-col-10","no-padding"],[1,"inline-block"],[1,"no-padding","p-col-2",2,"padding-right","10px !important"],["mat-icon-button","","tabindex","-1",1,"close-icon","float-right",3,"click"],["mat-dialog-content","",1,"dialog-body"],[3,"formGroup"],["matInput","","formControlName","name",3,"placeholder"],["matInput","","formControlName","short_name",3,"placeholder"],["matInput","","formControlName","english_name",3,"placeholder"],["align","right",1,"action-button"],["mat-raised-button","","type","button","color","warn","mat-dialog-close",""],["mat-raised-button","","color","accent",3,"click"],["class","loading-indicator",4,"ngIf"],[1,"loading-indicator"],["color","accent",3,"diameter"]],template:function(E,_){1&E&&(t.\u0275\u0275elementStart(0,"div",0)(1,"div",1)(2,"div",2)(3,"div",3)(4,"h3",4),t.\u0275\u0275text(5),t.\u0275\u0275pipe(6,"translate"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(7,"div",5)(8,"button",6),t.\u0275\u0275listener("click",function(){return _.close()}),t.\u0275\u0275elementStart(9,"mat-icon"),t.\u0275\u0275text(10,"close"),t.\u0275\u0275elementEnd()()()()()(),t.\u0275\u0275elementStart(11,"div",7)(12,"div",8)(13,"mat-form-field"),t.\u0275\u0275element(14,"input",9),t.\u0275\u0275pipe(15,"translate"),t.\u0275\u0275elementStart(16,"mat-error"),t.\u0275\u0275text(17),t.\u0275\u0275pipe(18,"translate"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(19,"mat-form-field"),t.\u0275\u0275element(20,"input",10),t.\u0275\u0275pipe(21,"translate"),t.\u0275\u0275elementStart(22,"mat-error"),t.\u0275\u0275text(23),t.\u0275\u0275pipe(24,"translate"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(25,"mat-form-field"),t.\u0275\u0275element(26,"input",11),t.\u0275\u0275pipe(27,"translate"),t.\u0275\u0275elementStart(28,"mat-error"),t.\u0275\u0275text(29),t.\u0275\u0275pipe(30,"translate"),t.\u0275\u0275elementEnd()()()(),t.\u0275\u0275elementStart(31,"mat-dialog-actions",12)(32,"button",13),t.\u0275\u0275text(33),t.\u0275\u0275pipe(34,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(35,"button",14),t.\u0275\u0275listener("click",function(){return _.submitVerification()}),t.\u0275\u0275text(36),t.\u0275\u0275pipe(37,"translate"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275template(38,I,2,1,"div",15)),2&E&&(t.\u0275\u0275advance(5),t.\u0275\u0275textInterpolate1(" ",t.\u0275\u0275pipeBind1(6,11,"add"===(null==_.data?null:_.data.type)?"course_sequence.Add module but with un":"course_sequence.Edit Module")," "),t.\u0275\u0275advance(7),t.\u0275\u0275property("formGroup",_.subject),t.\u0275\u0275advance(2),t.\u0275\u0275propertyInterpolate("placeholder",t.\u0275\u0275pipeBind1(15,13,"course_sequence.Name")),t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(18,15,"This field is required")),t.\u0275\u0275advance(3),t.\u0275\u0275propertyInterpolate("placeholder",t.\u0275\u0275pipeBind1(21,17,"course_sequence.Short name")),t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(24,19,"This field is required")),t.\u0275\u0275advance(3),t.\u0275\u0275propertyInterpolate("placeholder",t.\u0275\u0275pipeBind1(27,21,"course_sequence.English name")),t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(30,23,"This field is required")),t.\u0275\u0275advance(4),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(34,25,"CANCEL")),t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate1(" ",t.\u0275\u0275pipeBind1(37,27,"Validate")," "),t.\u0275\u0275advance(2),t.\u0275\u0275property("ngIf",_.isWaitingForResponse))},dependencies:[r.Zt,r.Bh,i.lW,d.ZT,d.xY,d.H8,l.Hw,m.TO,m.KE,g.Nt,y.Ou,o.DefaultValueAccessor,o.NgControlStatus,o.NgControlStatusGroup,o.FormGroupDirective,o.FormControlName,C.O5,n.X$],styles:[".dialog-border[_ngcontent-%COMP%]{border-bottom:1px solid black}.header-dialog[_ngcontent-%COMP%]{margin-top:15px;padding:0 5px 0 15px;color:#000}.inline-block[_ngcontent-%COMP%]{display:inline-block}.mat-dialog-content[_ngcontent-%COMP%]{margin-left:0;margin-right:0;margin-top:15px}.action-button[_ngcontent-%COMP%]{margin-right:20px;margin-bottom:10px}.mat-form-field-appearance-outline[_ngcontent-%COMP%]   .mat-form-field-infix[_ngcontent-%COMP%]{padding:.5em 0}"]}),v})()},11850:(D,f,e)=>{e.d(f,{Q:()=>v});var o=e(65938),d=e(24006),s=e(35226),c=e.n(s),u=e(68745),b=e(17489),t=e(94650),a=e(54041),n=e(89383),r=e(52688),i=e(73555),l=e(4859),m=e(97392),g=e(59549),y=e(284),C=e(36895);function I(P,E){1&P&&(t.\u0275\u0275elementStart(0,"mat-error"),t.\u0275\u0275text(1),t.\u0275\u0275pipe(2,"translate"),t.\u0275\u0275elementEnd()),2&P&&(t.\u0275\u0275advance(1),t.\u0275\u0275textInterpolate1(" ",t.\u0275\u0275pipeBind1(2,1,"Maximum 30 characters")," "))}function x(P,E){1&P&&(t.\u0275\u0275elementStart(0,"mat-error"),t.\u0275\u0275text(1),t.\u0275\u0275pipe(2,"translate"),t.\u0275\u0275elementEnd()),2&P&&(t.\u0275\u0275advance(1),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(2,1,"This field is required")))}let v=(()=>{class P{constructor(_,p,O,T,A,N){this.fb=_,this.data=p,this.dialogRef=O,this.courseSequnceService=T,this.translate=A,this.authService=N,this.subs=new u.Y,this.currentUser=null,this.isWaitingForResponse=!1}ngOnInit(){this.initForm(),this.data&&this.data._id&&this.patchValue()}initForm(){this.subject=this.fb.group({name:["",d.Validators.required],short_name:["",[d.Validators.required,d.Validators.maxLength(30)]],english_name:["",d.Validators.required]})}patchValue(){const _=b.cloneDeep(this.data);this.subject.patchValue(_)}checkFormValidity(){return!!this.subject.invalid&&(c().fire({type:"warning",title:this.translate.instant("FormSave_S1.TITLE"),html:this.translate.instant("FormSave_S1.TEXT"),confirmButtonText:this.translate.instant("FormSave_S1.BUTTON")}),this.subject.markAllAsTouched(),!0)}submitVerification(){if(this.checkFormValidity())return;this.isWaitingForResponse=!0;const _=b.cloneDeep(this.subject.value);this.subs.sink=this.data&&this.data._id?this.courseSequnceService.UpdateCourseSubject(this.data._id,_).subscribe(p=>{this.isWaitingForResponse=!1,c().fire({type:"success",title:this.translate.instant("Bravo!"),confirmButtonText:this.translate.instant("OK"),allowEnterKey:!1,allowEscapeKey:!1,allowOutsideClick:!1}).then(()=>{this.dialogRef.close(!0)})},p=>{this.authService.postErrorLog(p),this.isWaitingForResponse=!1,"GraphQL error: Subject name already exist"===p.message?c().fire({title:this.translate.instant("Uniquename_S1.TITLE"),text:this.translate.instant("Uniquename_S1.TEXT"),type:"info",showConfirmButton:!0,confirmButtonText:this.translate.instant("Uniquename_S1.BUTTON 1")}):p&&p.message&&p.message.includes("Network error: Http failure response for")?c().fire({type:"warning",title:this.translate.instant("BAD_CONNECTION.Title"),html:this.translate.instant("BAD_CONNECTION.Text"),confirmButtonText:this.translate.instant("BAD_CONNECTION.Button"),allowOutsideClick:!1,allowEnterKey:!1,allowEscapeKey:!1}):c().fire({type:"info",title:this.translate.instant("SORRY"),text:p&&p.message?this.translate.instant(p.message.replaceAll("GraphQL error: ","")):p,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})}):this.courseSequnceService.CreateCourseSubject(_).subscribe(p=>{this.isWaitingForResponse=!1,c().fire({type:"success",title:this.translate.instant("Bravo!"),confirmButtonText:this.translate.instant("OK"),allowEnterKey:!1,allowEscapeKey:!1,allowOutsideClick:!1}).then(()=>{this.dialogRef.close(!this.data||"form"!==this.data.data||p)})},p=>{this.authService.postErrorLog(p),this.isWaitingForResponse=!1,"GraphQL error: Subject name already exist"===p.message?c().fire({title:this.translate.instant("Uniquename_S1.TITLE"),text:this.translate.instant("Uniquename_S1.TEXT"),type:"info",showConfirmButton:!0,confirmButtonText:this.translate.instant("Uniquename_S1.BUTTON 1")}):p&&p.message&&p.message.includes("Network error: Http failure response for")?c().fire({type:"warning",title:this.translate.instant("BAD_CONNECTION.Title"),html:this.translate.instant("BAD_CONNECTION.Text"),confirmButtonText:this.translate.instant("BAD_CONNECTION.Button"),allowOutsideClick:!1,allowEnterKey:!1,allowEscapeKey:!1}):c().fire({type:"info",title:this.translate.instant("SORRY"),text:p&&p.message?this.translate.instant(p.message.replaceAll("GraphQL error: ","")):p,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})})}ngOnDestroy(){this.subs.unsubscribe()}close(){this.dialogRef.close()}}return P.\u0275fac=function(_){return new(_||P)(t.\u0275\u0275directiveInject(d.UntypedFormBuilder),t.\u0275\u0275directiveInject(o.WI),t.\u0275\u0275directiveInject(o.so),t.\u0275\u0275directiveInject(a.z),t.\u0275\u0275directiveInject(n.sK),t.\u0275\u0275directiveInject(r.e))},P.\u0275cmp=t.\u0275\u0275defineComponent({type:P,selectors:[["ms-add-subject-dialog"]],decls:37,vars:27,consts:[["cdkDrag","","cdkDragRootElement",".cdk-overlay-pane","cdkDragHandle","",1,"header-dialog"],[1,"dialog-border"],[1,"p-grid"],[1,"p-col-10","no-padding"],[1,"inline-block"],[1,"no-padding","p-col-2"],["mat-icon-button","","tabindex","-1",1,"close-icon","float-right",3,"click"],["mat-dialog-content","",1,"dialog-body"],[3,"formGroup"],["matInput","","formControlName","name",3,"placeholder"],["matInput","","formControlName","short_name",3,"placeholder"],[4,"ngIf"],["matInput","","formControlName","english_name",3,"placeholder"],["align","right",1,"action-button"],["mat-raised-button","","type","button","color","warn","mat-dialog-close",""],["mat-raised-button","","color","primary",3,"click"]],template:function(_,p){1&_&&(t.\u0275\u0275elementStart(0,"div",0)(1,"div",1)(2,"div",2)(3,"div",3)(4,"h3",4),t.\u0275\u0275text(5),t.\u0275\u0275pipe(6,"translate"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(7,"div",5)(8,"button",6),t.\u0275\u0275listener("click",function(){return p.close()}),t.\u0275\u0275elementStart(9,"mat-icon"),t.\u0275\u0275text(10,"close"),t.\u0275\u0275elementEnd()()()()()(),t.\u0275\u0275elementStart(11,"div",7)(12,"div",8)(13,"mat-form-field"),t.\u0275\u0275element(14,"input",9),t.\u0275\u0275pipe(15,"translate"),t.\u0275\u0275elementStart(16,"mat-error"),t.\u0275\u0275text(17),t.\u0275\u0275pipe(18,"translate"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(19,"mat-form-field"),t.\u0275\u0275element(20,"input",10),t.\u0275\u0275pipe(21,"translate"),t.\u0275\u0275template(22,I,3,3,"mat-error",11),t.\u0275\u0275template(23,x,3,3,"mat-error",11),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(24,"mat-form-field"),t.\u0275\u0275element(25,"input",12),t.\u0275\u0275pipe(26,"translate"),t.\u0275\u0275elementStart(27,"mat-error"),t.\u0275\u0275text(28),t.\u0275\u0275pipe(29,"translate"),t.\u0275\u0275elementEnd()()()(),t.\u0275\u0275elementStart(30,"mat-dialog-actions",13)(31,"button",14),t.\u0275\u0275text(32),t.\u0275\u0275pipe(33,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(34,"button",15),t.\u0275\u0275listener("click",function(){return p.submitVerification()}),t.\u0275\u0275text(35),t.\u0275\u0275pipe(36,"translate"),t.\u0275\u0275elementEnd()()),2&_&&(t.\u0275\u0275advance(5),t.\u0275\u0275textInterpolate1(" ",t.\u0275\u0275pipeBind1(6,11,"add"===(null==p.data?null:p.data.type)?"course_sequence.Add subject":"course_sequence.Edit Subject")," "),t.\u0275\u0275advance(7),t.\u0275\u0275property("formGroup",p.subject),t.\u0275\u0275advance(2),t.\u0275\u0275propertyInterpolate("placeholder",t.\u0275\u0275pipeBind1(15,13,"course_sequence.Name")),t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(18,15,"This field is required")),t.\u0275\u0275advance(3),t.\u0275\u0275propertyInterpolate("placeholder",t.\u0275\u0275pipeBind1(21,17,"course_sequence.Short name")),t.\u0275\u0275advance(2),t.\u0275\u0275property("ngIf",p.subject.controls.short_name.hasError("maxlength")),t.\u0275\u0275advance(1),t.\u0275\u0275property("ngIf",p.subject.controls.short_name.hasError("required")),t.\u0275\u0275advance(2),t.\u0275\u0275propertyInterpolate("placeholder",t.\u0275\u0275pipeBind1(26,19,"course_sequence.English name")),t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(29,21,"This field is required")),t.\u0275\u0275advance(4),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(33,23,"CANCEL")),t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate1(" ",t.\u0275\u0275pipeBind1(36,25,"Validate")," "))},dependencies:[i.Zt,i.Bh,l.lW,o.ZT,o.xY,o.H8,m.Hw,g.TO,g.KE,y.Nt,d.DefaultValueAccessor,d.NgControlStatus,d.NgControlStatusGroup,d.FormGroupDirective,d.FormControlName,C.O5,n.X$],styles:[".dialog-border[_ngcontent-%COMP%]{border-bottom:1px solid black}.header-dialog[_ngcontent-%COMP%]{margin-top:15px;padding:0 15px;color:#000}.inline-block[_ngcontent-%COMP%]{display:inline-block}.mat-dialog-content[_ngcontent-%COMP%]{margin-left:0;margin-right:0;margin-top:15px}.action-button[_ngcontent-%COMP%]{margin-right:20px;margin-bottom:10px}.mat-form-field-appearance-outline[_ngcontent-%COMP%]   .mat-form-field-infix[_ngcontent-%COMP%]{padding:.5em 0}"]}),P})()},47063:(D,f,e)=>{e.d(f,{Y:()=>b});var o=e(13125),d=e(591),s=e(24850),c=e(94650),u=e(18497);let b=(()=>{class h{constructor(a){this.apollo=a,this.userNewsConfigSubject=new d.X(null),this.userNewsConfig$=this.userNewsConfigSubject.asObservable(),this.userNewsDataSubject=new d.X(null),this.userNewsDataConfig$=this.userNewsDataSubject.asObservable(),this.resetFormSubject=new d.X(null),this.resetForm$=this.resetFormSubject.asObservable(),this.newsIdSubject=new d.X({}),this.newsId$=this.newsIdSubject.asObservable(),this.comparisonForm=new d.X({}),this.comparisonForm$=this.comparisonForm.asObservable(),this.GetAllNews=o.ZP`
    query GetAllNews($pagination: PaginationInput, $filter: NewsFilterInput, $sort: NewsSortingInput) {
      GetAllNews(pagination: $pagination, filter: $filter, sorting: $sort) {
        _id
        title
        description
        is_published
        created_by {
          _id
          first_name
          last_name
          civility
        }
        published_date {
          date
          time
        }
        count_document
      }
    }
  `,this.GetOneNews=o.ZP`
    query GetOneNews($_id: ID!) {
      GetOneNews(_id: $_id) {
        _id
        title
        description
        published_date {
          time
          date
        }
        created_by {
          _id
          first_name
          last_name
          civility
        }
        total_like
        is_current_user_like_the_news
      }
    }
  `}setComparisonForm(a){this.comparisonForm.next(a)}getCurrentFormStatus(){return this.comparisonForm.getValue()}getCurrentIdSubject(){return this.newsIdSubject.getValue()}updateUserNewsConfig(a){this.userNewsConfigSubject.next(a)}updateUserNewsDataConfig(a){const n=this.userNewsDataSubject.value;if(Array.isArray(n)){const r=[a,...n];this.userNewsDataSubject.next(r)}else console.error("currData is not iterable:",n),this.userNewsDataSubject.next("")}triggerFormReset(a){this.resetFormSubject.next(a)}updateNewsId(a){this.newsIdSubject.next(a)}getOneNews(a){return this.apollo.query({query:o.ZP`
          query GetOneNews($_id: ID!) {
            GetOneNews(_id: $_id) {
              _id
              title
              description
              published_date {
                time
                date
              }
              created_by {
                _id
                first_name
                last_name
                civility
              }
              is_published
              total_like
              is_current_user_like_the_news
            }
          }
        `,variables:{_id:a},fetchPolicy:"network-only"}).pipe((0,s.U)(n=>n.data.GetOneNews))}getAllNews(a,n,r){return this.apollo.query({query:o.ZP`
          query GetAllNews($pagination: PaginationInput, $filter: NewsFilterInput, $sort: NewsSortingInput) {
            GetAllNews(pagination: $pagination, filter: $filter, sorting: $sort) {
              _id
              title
              description
              is_published
              created_by {
                _id
                first_name
                last_name
                civility
              }
              published_date {
                date
                time
              }
              count_document
            }
          }
        `,variables:{pagination:a,filter:n,sort:r},fetchPolicy:"network-only"}).pipe((0,s.U)(i=>i.data.GetAllNews))}createNews(a){return this.apollo.mutate({mutation:o.ZP`
          mutation CreateNews($inputValue: NewsInput) {
            CreateNews(news_input: $inputValue) {
              _id
              title
              description
              is_published
              created_by {
                _id
                first_name
                last_name
                civility
              }
            }
          }
        `,variables:{inputValue:a}}).pipe((0,s.U)(n=>n.data.CreateNews))}updateNews(a,n){return this.apollo.mutate({mutation:o.ZP`
          mutation UpdateNews($_id: ID!, $news_input: NewsInput) {
            UpdateNews(_id: $_id, news_input: $news_input) {
              _id
              title
              description
              is_published
            }
          }
        `,variables:{_id:a,news_input:n}}).pipe((0,s.U)(r=>r.data.UpdateNews))}publishNews(a){return this.apollo.mutate({mutation:o.ZP`
          mutation PublishNews($_id: ID!) {
            PublishNews(_id: $_id) {
              _id
              is_published
            }
          }
        `,variables:{_id:a}}).pipe((0,s.U)(n=>n.data.PublishNews))}unPublishNews(a){return this.apollo.mutate({mutation:o.ZP`
          mutation UnpublishNews($_id: ID!) {
            UnpublishNews(_id: $_id) {
              _id
              title
            }
          }
        `,variables:{_id:a}}).pipe((0,s.U)(n=>n.data.UnpublishNews))}deleteNews(a){return this.apollo.mutate({mutation:o.ZP`
          mutation DeleteNews($_id: ID!) {
            DeleteNews(_id: $_id) {
              _id
              title
            }
          }
        `,variables:{_id:a}}).pipe((0,s.U)(n=>n.data.DeleteNews))}getAllNewsDiscussion(a,n){return this.apollo.query({query:o.ZP`
        query GetAllNewsDiscussion($pagination: PaginationInput, $filter: NewsDiscussionFilterInput){
          GetAllNewsDiscussion(pagination: $pagination, filter: $filter){
            _id
            comment
            created_by{
              first_name
              last_name
              civility
              profile_picture
            }
            news_id{
              _id
            }
            created_at
            count_document
          }
        }
      `,variables:{pagination:a,filter:n},fetchPolicy:"network-only"}).pipe((0,s.U)(r=>r.data.GetAllNewsDiscussion))}createNewsDiscussion(a){return this.apollo.mutate({mutation:o.ZP`
        mutation CreateNewsDiscussion($news_discussion_input: NewsDiscussionInput){
          CreateNewsDiscussion(news_discussion_input: $news_discussion_input){
            _id
          }
        }
      `,variables:{news_discussion_input:a}}).pipe((0,s.U)(n=>n.data.CreateNewsDiscussion))}likeNews(a){return this.apollo.mutate({mutation:o.ZP`
        mutation LikeNews($_id:ID!){
          LikeNews(_id:$_id){
            title
          }
        }
      `,variables:{_id:a}}).pipe((0,s.U)(n=>n.data.LikeNews))}unLikeNews(a){return this.apollo.mutate({mutation:o.ZP`
      mutation UnlikeNews($_id:ID!){
        UnlikeNews(_id:$_id){
          title
        }
      }
      `,variables:{_id:a}}).pipe((0,s.U)(n=>n.data.UnlikeNews))}}return h.\u0275fac=function(a){return new(a||h)(c.\u0275\u0275inject(u._M))},h.\u0275prov=c.\u0275\u0275defineInjectable({token:h,factory:h.\u0275fac,providedIn:"root"}),h})()},36224:(D,f,e)=>{e.d(f,{g:()=>d});var o=e(94650);let d=(()=>{class s{constructor(){}canDeactivate(u){return!u.canDeactivate||u.canDeactivate()}}return s.\u0275fac=function(u){return new(u||s)},s.\u0275prov=o.\u0275\u0275defineInjectable({token:s,factory:s.\u0275fac,providedIn:"root"}),s})()},24528:(D,f,e)=>{e.d(f,{C:()=>a});var o=e(13125),d=e(591),s=e(24850),c=e(94650),u=e(18497),b=e(80529),h=e(87343),t=e(89383);let a=(()=>{class n{constructor(i,l,m,g){this.apollo=i,this.httpClient=l,this.translate=g,this.areChildrenFormValid=!1,this.companyIdOnEdit=new d.X(null),this.indexStep=new d.X(null),this.schoolData=new d.X(null)}setIndexStep(i){this.indexStep.next(i)}pushSelectedSchool(i){this.schoolData.next(i)}get childrenFormStatus(){return this.areChildrenFormValid}set childrenFormStatus(i){this.areChildrenFormValid=i}getJSON(){return this.httpClient.get("assets/data/settingCondition.json")}getAllInternships(i,l,m,g){return this.apollo.watchQuery({query:o.ZP`
          query GetAllInternships(
            $pagination: PaginationInput
            $filter: InternshipFilterInput
            $sorting: InternshipSortingInput
            $searching: InternshipSearchingInput
          ) {
            GetAllInternships(pagination: $pagination, filter: $filter, sorting: $sorting, searching: $searching) {
              _id
              internship_creation_step
              date_agreement_asked
              mentor_id {
                _id
                first_name
                last_name
                civility
              }
              student_id {
                _id
                civility
                first_name
                last_name
                candidate_school{
                  _id
                  short_name
                }
                candidate_campus{
                  _id
                  name
                }
                email
              }
              company_relation_member_id {
                _id
                first_name
                last_name
                civility
              }
              is_published
              internship_status
              agreement_status
              company_branch_id {
                _id
                company_name
              }
              internship_date {
                date_to
                date_from
                duration_in_weeks
              }
              internship_status
              is_company_manager_already_sign
              is_mentor_already_sign
              is_student_already_sign
              count_document
              pdf_file_name
            }
          }
        `,variables:{pagination:i,filter:l||null,sorting:m||null,searching:g||null},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(y=>y.data.GetAllInternships))}getAllAgreementConditionsTable(i){return this.apollo.watchQuery({query:o.ZP`
          query GetAllAgreementConditions($filter: AgreementConditionFilter) {
            GetAllAgreementConditions(filter: $filter) {
              _id
              scholar_season_id {
                _id
                scholar_season
              }
              schools_id {
                _id
                short_name
              }
              campuses
              levels
              condition_agreement
            }
          }
        `,variables:{filter:i||null},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(l=>l.data.GetAllAgreementConditions))}getOneInternship(i){return this.apollo.watchQuery({query:o.ZP`
          query GetOneInternship($_id: ID!) {
            GetOneInternship(_id: $_id) {
              _id
              internship_creation_step
              internship_name
              commentaries
              internship_status
              salary
              currency
              student_sign_status
              mentor_sign_status
              company_manager_sign_status
              company_relation_member_sign_status
              agreement_status
              company_branch_id {
                _id
                country
                company_entity_id {
                  _id
                }
                status
                company_name
                company_logo
                description
                brand
                type_of_company
                type_of_industry
                no_RC
                mentor_ids {
                  _id
                }
                school_ids {
                  _id
                  short_name
                }
                company_addresses {
                  address
                  city
                  country
                  is_main_address
                  postal_code
                  region
                  department
                }
                count_document
                images {
                  s3_file_name
                }
                company_logo
                banner
                activity
                twitter_link
                instagram_link
                facebook_link
                youtube_link
                video_link
                website_link
              }
              company_manager_id {
                _id
                first_name
                last_name
                civility
                email
                position
              }
              internship_date {
                date_from
                date_to
                time_from
                time_to
                duration_in_weeks
                duration_in_months
              }
              is_student_already_sign
              is_mentor_already_sign
              is_company_relation_member_already_sign
              is_company_manager_already_sign
              company_member_signs {
                _id
                is_already_sign
                company_member_id {
                  _id
                  first_name
                  last_name
                  civility
                }
              }
              is_published
              status
              amendments {
                _id
                amendment_type
                date_from
                time_from
                date_to
                time_to
                is_student_already_sign
                is_HR_already_sign
                is_BR_already_sign
              }
              mentor_id {
                _id
                first_name
                last_name
                civility
                email
                position
                portable_phone
              }
              company_members {
                is_should_sign_aggreement
                company_member_id {
                  _id
                  first_name
                  last_name
                  civility
                  email
                  position
                }
              }
              company_relation_member_id {
                _id
                first_name
                last_name
                civility
                email
                position
                portable_phone
              }
              student_id {
                _id
                civility
                first_name
                last_name
                photo
                sex
                date_of_birth
                is_photo_in_s3
                place_of_birth
                status
                candidate_id {
                  intake_channel
                }
                student_title_status
                photo_s3_path
                candidate_school
                candidate_level
                candidate_campus
                student_address {
                  address
                  additional_address
                  postal_code
                  city
                  country
                  is_main_address
                  city_of_birth
                  country_of_birth
                  post_code_of_birth
                }
                nationality
                nationality_second
                last_name_used
                first_name_used
                email
                tele_phone
                home_telephone
                date_of_birth
                companies {
                  status
                  is_active
                  internship_id {
                    _id
                    internship_name
                    internship_date {
                      date_from
                      date_to
                      duration_in_weeks
                      duration_in_months
                    }
                    volume_hours
                    job_description
                  }
                  company {
                    _id
                    country
                    company_entity_id {
                      _id
                    }
                    status
                    company_name
                    company_logo
                    description
                    brand
                    type_of_company
                    type_of_industry
                    no_RC
                    mentor_ids {
                      _id
                    }
                    school_ids {
                      _id
                      short_name
                    }
                    company_addresses {
                      address
                      city
                      country
                      is_main_address
                      postal_code
                      region
                      department
                    }
                    count_document
                    images {
                      s3_file_name
                    }
                    company_logo
                    banner
                    activity
                    twitter_link
                    instagram_link
                    facebook_link
                    youtube_link
                    video_link
                    website_link
                  }
                }
                school {
                  _id
                  logo
                  short_name
                  long_name
                  tele_phone
                  school_address {
                    address1
                    address2
                    postal_code
                    city
                    region
                    department
                    country
                    is_main_address
                  }
                }
              }
              is_published
              pdf_file_name
              department
              is_work_from_home
              volume_hours
              job_description
              internship_address {
                address
                postal_code
                city
              }
              internship_aboard {
                address
                postal_code
                city
              }
              company_manager_id {
                _id
                entities {
                  entity_name
                }
                first_name
                last_name
                civility
                position
                email
                portable_phone
              }
            }
          }
        `,variables:{_id:i},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(l=>l.data.GetOneInternship))}getOneInternshipStatus(i){return this.apollo.watchQuery({query:o.ZP`
          query GetOneInternship($_id: ID!) {
            GetOneInternship(_id: $_id) {
              _id
              internship_creation_step
              internship_name
              commentaries
              internship_status
              agreement_status
              is_published
              status
              pdf_file_name
            }
          }
        `,variables:{_id:i},fetchPolicy:"network-only"}).valueChanges.pipe((0,s.U)(l=>l.data.GetOneInternship))}updateInternship(i,l){return this.apollo.mutate({mutation:o.ZP`
          mutation UpdateInternship($_id: ID!, $internship_input: CreateInternshipInput!) {
            UpdateInternship(_id: $_id, internship_input: $internship_input) {
              _id
              internship_creation_step
            }
          }
        `,variables:{internship_input:l,_id:i}}).pipe((0,s.U)(m=>m.data.UpdateInternship))}createAmendment(i,l){return this.apollo.mutate({mutation:o.ZP`
          mutation CreateAmendment($_id: ID!, $amendments: AmendmentInput!) {
            CreateAmendment(_id: $_id, amendments: $amendments) {
              _id
              internship_creation_step
            }
          }
        `,variables:{amendments:l,_id:i}}).pipe((0,s.U)(m=>m.data.CreateAmendment))}generateAgreementPDF(i,l){return this.apollo.mutate({mutation:o.ZP`
          mutation GenerateAgreementPDF($internship_id: ID, $is_CRM: Boolean) {
            GenerateAgreementPDF(internship_id: $internship_id, is_CRM: $is_CRM)
          }
        `,variables:{internship_id:i,is_CRM:l}}).pipe((0,s.U)(m=>m.data.GenerateAgreementPDF))}triggerNotificationINTERNSHIP_N8(i,l,m,g){return this.apollo.mutate({mutation:o.ZP`
          mutation TriggerNotificationINTERNSHIP_N8(
            $internship_id: ID
            $reason_input: String
            $lang: String
            $user_ask_id: ID
            $is_student: Boolean
          ) {
            TriggerNotificationINTERNSHIP_N8(
              internship_id: $internship_id
              reason_input: $reason_input
              lang: $lang
              user_ask_id: $user_ask_id
              is_student: $is_student
            )
          }
        `,variables:{internship_id:i,reason_input:l,user_ask_id:m,is_student:g,lang:this.translate.currentLang}}).pipe((0,s.U)(y=>y.data.TriggerNotificationINTERNSHIP_N8))}getAllScholarSeasons(i){return this.apollo.watchQuery({query:o.ZP`
          query GetAllScholarSeasons($filter: ScholarSeasonFilterInput) {
            GetAllScholarSeasons(filter: $filter) {
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
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:i||null}}).valueChanges.pipe((0,s.U)(l=>l.data.GetAllScholarSeasons))}CreateAgreementCondition(i){return this.apollo.mutate({mutation:o.ZP`
          mutation CreateAgreementCondition($agreement_condition_input: AgreementConditionInput) {
            CreateAgreementCondition(agreement_condition_input: $agreement_condition_input) {
              _id
            }
          }
        `,variables:{agreement_condition_input:i||null}}).pipe((0,s.U)(l=>l.data.CreateAgreementCondition))}UpdateAgreementCondition(i,l){return this.apollo.mutate({mutation:o.ZP`
          mutation UpdateAgreementCondition($_id: ID!, $agreement_condition_input: AgreementConditionInput) {
            UpdateAgreementCondition(_id: $_id,agreement_condition_input: $agreement_condition_input) {
              _id
            }
          }
        `,variables:{_id:i,agreement_condition_input:l||null}}).pipe((0,s.U)(m=>m.data.UpdateAgreementCondition))}}return n.\u0275fac=function(i){return new(i||n)(c.\u0275\u0275inject(u._M),c.\u0275\u0275inject(b.eN),c.\u0275\u0275inject(h.uG),c.\u0275\u0275inject(t.sK))},n.\u0275prov=c.\u0275\u0275defineInjectable({token:n,factory:n.\u0275fac,providedIn:"root"}),n})()},58579:(D,f,e)=>{e.d(f,{b:()=>h});var o=e(13125),d=e(24850),s=e(94650),c=e(80529),u=e(18497),b=e(89383);let h=(()=>{class t{constructor(n,r,i){this.httpClient=n,this.apollo=r,this.translate=i}createPromoExternal(n){return this.apollo.mutate({mutation:o.ZP`
          mutation CreatePromoExternal($promo_external_input: PromoExternalInput) {
            CreatePromoExternal(promo_external_input: $promo_external_input) {
              ref_id
              module
              title
              sub_title
              story
              school
              campus
              levels
              gender
              region
              hobbies
              job
              activity
              integration
              insertion
              program
              video_link
              image_upload
              generic
              is_published
            }
          }
        `,variables:{promo_external_input:n}}).pipe((0,d.U)(r=>r.data.PromoExternal))}deletePromoExternal(n){return this.apollo.mutate({mutation:o.ZP`
          mutation DeletePromoExternal($_id: ID!) {
            DeletePromoExternal(_id: $_id) {
              _id
            }
          }
        `,variables:{_id:n}}).pipe((0,d.U)(r=>r.data.DeletePromoExternal))}updatePromoExternal(n,r){return this.apollo.mutate({mutation:o.ZP`
          mutation UpdatePromoExternal($_id: ID!, $promo_external_input: PromoExternalInput) {
            UpdatePromoExternal(_id: $_id, promo_external_input: $promo_external_input) {
              ref_id
              module
              title
              sub_title
              story
              school
              campus
              levels
              gender
              region
              hobbies
              job
              activity
              integration
              insertion
              program
              video_link
              image_upload
              generic
              is_published
            }
          }
        `,variables:{_id:n,promo_external_input:r}}).pipe((0,d.U)(i=>i.data.PromoExternal))}getAllCandidateSchool(n,r,i){return this.apollo.watchQuery({query:o.ZP`
          query GetAllCandidateSchool($pagination: PaginationInput, $filter: CandidateSchoolFilterInput, $user_type_id: ID) {
            GetAllCandidateSchool(pagination: $pagination, filter: $filter, user_type_id: $user_type_id) {
              short_name
              long_name
              campuses {
                name
              }
              levels {
                name
                code
              }
              specialities {
                name
              }
            }
          }
        `,variables:{pagination:n,filter:r||{},user_type_id:i||null},fetchPolicy:"network-only"}).valueChanges.pipe((0,d.U)(l=>l.data.GetAllCandidateSchool))}getAllPromoExternals(n,r,i){return this.apollo.watchQuery({query:o.ZP`
          query GetAllPromoExternals($pagination: PaginationInput, $sort: PromoExternalSortingInput) {
            GetAllPromoExternals(pagination: $pagination, sorting: $sort, ${i}) {
              _id
              ref_id
              module
              title
              sub_title
              story
              school
              campus
              gender
              levels
              region
              hobbies
              job
              activity
              integration
              insertion
              program
              video_link
              image_upload
              generic
              is_published
              count_document
            }
          }
        `,variables:{pagination:n,sort:r||{}},fetchPolicy:"network-only"}).valueChanges.pipe((0,d.U)(l=>l.data.GetAllPromoExternals))}getAllPromoExternalsForDisplay(n){return this.apollo.watchQuery({query:o.ZP`
          query GetPromoAllExternalsForDisplay  {
            GetPromoAllExternalsForDisplay(${n}) {
              _id
              ref_id
              module
              title
              sub_title
              story
              school
              campus
              gender 
              levels
              region
              hobbies
              job
              activity
              integration
              insertion
              program
              video_link
              image_upload
              generic
              is_published
            }
          }
        `,variables:{},fetchPolicy:"network-only"}).valueChanges.pipe((0,d.U)(r=>r.data.PromoExternal))}getPromoExternal(){return this.httpClient.get("assets/data/promo-external.json")}}return t.\u0275fac=function(n){return new(n||t)(s.\u0275\u0275inject(c.eN),s.\u0275\u0275inject(u._M),s.\u0275\u0275inject(b.sK))},t.\u0275prov=s.\u0275\u0275defineInjectable({token:t,factory:t.\u0275fac,providedIn:"root"}),t})()},34018:(D,f,e)=>{e.d(f,{m:()=>b});var o=e(13125),d=e(24850),s=e(94650),c=e(80529),u=e(18497);let b=(()=>{class h{constructor(a,n){this.httpClient=a,this.apollo=n}getAllPromosi(a,n,r){return this.apollo.query({query:o.ZP`
          query GetAllPromos($pagination: PaginationInput, $sorting: PromoSorting) {
            GetAllPromos(pagination: $pagination, sorting: $sorting, ${r}) {
              _id
              ref
              title
              sub_title
              description
              for_login_page
              for_set_password_page
              for_forgot_password_page
              image_url
              status
              count_document
            }
          }
        `,variables:{pagination:a,sorting:n},fetchPolicy:"network-only"}).pipe((0,d.U)(i=>i.data.GetAllPromos))}getAllPromo(){return this.apollo.query({query:o.ZP`
          query {
            GetAllPromos {
              _id
              ref
              title
              sub_title
              description
              for_login_page
              for_set_password_page
              for_forgot_password_page
              image_url
              status
              count_document
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,d.U)(a=>a.data.GetAllPromos))}getOnePromo(a){return this.apollo.query({query:o.ZP`
          query {
            GetOnePromo(_id: "${a}") {
              _id
              ref
              title
              sub_title
              description
              for_login_page
              for_set_password_page
              for_forgot_password_page
              image_url
              status
              count_document
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,d.U)(n=>n.data.GetOnePromo))}deletePromo(a){return this.apollo.mutate({mutation:o.ZP`
        mutation DeletePromo{
          DeletePromo(_id: "${a}") {
              _id
              title
            }
          }
        `,errorPolicy:"all"}).pipe((0,d.U)(n=>n.data.DeletePromo))}createPromo(a){return this.apollo.mutate({mutation:o.ZP`
          mutation CreatePromo($promo_input: PromoInput) {
            CreatePromo(promo_input: $promo_input) {
              _id
              title
            }
          }
        `,variables:{promo_input:a},errorPolicy:"all"}).pipe((0,d.U)(n=>n.data.CreatePromo))}updatePromo(a,n){return this.apollo.mutate({mutation:o.ZP`
        mutation UpdatePromo($promo_input: PromoInput) {
          UpdatePromo(_id: "${a}", promo_input: $promo_input) {
              _id
              title
            }
          }
        `,variables:{promo_input:n},errorPolicy:"all"}).pipe((0,d.U)(r=>r.data.UpdatePromo))}}return h.\u0275fac=function(a){return new(a||h)(s.\u0275\u0275inject(c.eN),s.\u0275\u0275inject(u._M))},h.\u0275prov=s.\u0275\u0275defineInjectable({token:h,factory:h.\u0275fac,providedIn:"root"}),h})()},23673:(D,f,e)=>{e.d(f,{L:()=>a});var o=e(24742),d=e(92340),s=e(13125),c=e(24850),u=e(94650),b=e(80529),h=e(18497);class a{constructor(r,i){this.httpClient=r,this.apollo=i}getTranscriptData(){return this.httpClient.get("assets/data/transcript-builder.json")}generatePdf(r,i,l){return this.httpClient.post(`${d.N.PDF_SERVER_URL}admtc/generate-pdf/`,{html:r,autoMargin:!0,landscape:l,filename:i})}generatePdfDynamic(r,i,l,m){return this.httpClient.post(`${d.N.PDF_SERVER_URL}admtc/generate-pdf/`,{html:r,autoMargin:m,landscape:l,filename:i})}generateJobDescPDF(r,i){return this.apollo.mutate({mutation:s.ZP`
          mutation GenerateJobDescPDF($job_desc_id: ID!, $student_id: ID!) {
            GenerateJobDescPDF(job_desc_id: $job_desc_id, student_id: $student_id)
          }
        `,variables:{job_desc_id:r,student_id:i}}).pipe((0,c.U)(l=>l.data.GenerateJobDescPDF))}generateProblematicPDF(r,i){return this.apollo.mutate({mutation:s.ZP`
          mutation GenerateProblematicPDF($problematic_id: ID!, $student_id: ID!) {
            GenerateProblematicPDF(problematic_id: $problematic_id, student_id: $student_id)
          }
        `,variables:{problematic_id:r,student_id:i}}).pipe((0,c.U)(l=>l.data.GenerateProblematicPDF))}}a.\u0275fac=function(r){return new(r||a)(u.\u0275\u0275inject(b.eN),u.\u0275\u0275inject(h._M))},a.\u0275prov=u.\u0275\u0275defineInjectable({token:a,factory:a.\u0275fac,providedIn:"root"}),function(n,r,i,l){var y,m=arguments.length,g=m<3?r:null===l?l=Object.getOwnPropertyDescriptor(r,i):l;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)g=Reflect.decorate(n,r,i,l);else for(var C=n.length-1;C>=0;C--)(y=n[C])&&(g=(m<3?y(g):m>3?y(r,i,g):y(r,i))||g);m>3&&g&&Object.defineProperty(r,i,g)}([(0,o.q)()],a.prototype,"getTranscriptData",null)},54066:(D,f,e)=>{e.d(f,{B:()=>o});const o="\n<style>\n.pdf-container {\n  font-size: 12px !important;\n  background-color: #ffffff;\n  color: #000000;\n  padding: 10px;\n}\n.document-parent {\n  -webkit-print-color-adjust: exact;\n  white-space: normal;\n}\n.title-terms {\n  text-align: center;\n  width: 100% !important;\n  margin-top: 5px;\n  font-weight: 700;\n  margin-bottom: 10px;\n  color: black;\n}\n.content-terms {\n  text-align: justify;\n}\n.p-grid {\n  display: flex;\n  flex-wrap: wrap;\n  margin-right: unset !important;\n  margin-left: unset !important;\n  margin-top: unset !important;\n}\n.title-section {\n  margin-bottom: 30px;\n}\n.p-col-12 {\n  width: 100%;\n  font-size: 12px;\n}\n.pad-y-none {\n  padding-top: 0 !important;\n  padding-bottom: 0 !important;\n}\n.text-center {\n  text-align: center !important;\n}\n.font-bold {\n  font-weight: 700!important;\n  font-size: 12px;\n}\n.outline-border-grey {\n  border: 1px solid black;\n  background: #d6d6d6;\n  color: black;\n}\n.border-outline-bottom {\n  border-bottom: 2px solid black;\n  background: #ffffff;\n  color: black;\n  width: 100%;\n}\n.outline-border-white {\n  border: 1px solid black;\n  background: white;\n  color: black;\n}\n.outline-border-x-none {\n  border-left: 0px !important;\n  border-right: 0px !important;\n}\n.outline-border-bottom-none {\n  border-bottom: 0px !important;\n}\n.outline-border-dot {\n  border-bottom: 1px dotted black;\n  border-top: 1px dotted black;\n  border-right: 1px solid black;\n  border-left: 1px solid black;\n  background: white;\n  color: black;\n}\n.outline-border-dot-top {\n  border-top: 1px dotted black;\n  background: white;\n  color: black;\n}\n.outline-border-dashed {\n  border-style: dashed solid dashed solid;\n  border-width: 1px;\n  border-color: black;\n  background: white;\n  color: black;\n}\n.p-col-6 {\n  width: 50%;\n  font-size: 12px;\n}\n.p-col-2 {\n  width: 16.6667%;\n  font-size: 12px;\n}\n.text-right {\n  text-align: right !important;\n}\n.pad-t-md,\n.pad-y-md {\n  padding-top: 1rem !important;\n}\n.mat-card:hover {\n  box-shadow: none !important;\n}\n.pdf-card {\n  margin: 1rem;\n  border-radius: 2px;\n  padding: 8px;\n  background-color: #607d8b !important;\n  -webkit-print-color-adjust: exact;\n}\n\n\n.doc-title {\n  text-align: center;\n  font-weight: 700;\n  display: block;\n}\n\n.doc-table {\n  border-collapse: collapse;\n  width: 100%;\n  margin: 30px auto;\n}\n\ntbody {\n  display: table-row-group;\n  vertical-align: middle;\n  border-color: inherit;\n}\n\n.table-row-border {\n  border: 2px solid #000;\n}\n\n.table-row-side-border {\n  border-right: 2px solid #000;\n  border-left: 2px solid #000;\n  border-bottom: 2px solid #000;\n}\n\n.gray-bg {\n  background-color: #d6d6d6;\n  -webkit-print-color-adjust: exact;\n  padding: 3px 5px;\n}\n\n.blue-bg {\n  background-color: #ecf3ff;\n  -webkit-print-color-adjust: exact;\n  padding: 3px 5px;\n}\n\n.white-bg {\n  background-color: #ffffff;\n  -webkit-print-color-adjust: exact;\n  padding: 3px 5px;\n}\n\n.placeholder-text {\n  color: transparent;\n}\n\n.footer {\n  left: 0;\n  bottom: 0;\n  font-weight: 700;\n  margin-top: 450px;\n  text-align: center;\n}\n\n.block-fieldset-spacing {\n  margin-bottom: 0.5rem;\n}\n\n.page-break-title {\n  justify-content: center;\n  display: flex;\n  align-items: center;\n}\n\n.placeholder-text {\n  color: transparent;\n}\n\n.cert-preview {\n  background-color: #ffffff;\n  color: #000000;\n}\n\n.card-row {\n  margin: 1em 0 !important;\n  padding: 8px;\n}\n\n.title-cert-text {\n  display: block;\n  text-align: center;\n  font-weight: 700;\n}\n\n.message-cert-text {\n  margin-top: 10px;\n  font-size: 12px;\n}\n\n</style>\n"}}]);