"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[3338],{33338:(S,a,n)=>{n.r(a),n.d(a,{ExportDownloaderModule:()=>D});var s=n(36895),r=n(610),d=n(68745),p=n(35226),c=n.n(p),f=n(92340),o=n(94650),h=n(24850),u=n(13125),m=n(18497);let E=(()=>{class e{constructor(t){this.apollo=t}checkFileExpirationTokenForExport(t){return this.apollo.query({query:u.ZP`
          query checkFileExpirationTokenForExport($token: String!) {
            CheckFileExpirationToken(token: $token)
          }
        `,variables:{token:t},fetchPolicy:"network-only",errorPolicy:"all"}).pipe((0,h.U)(l=>l.data.CheckFileExpirationToken))}}return e.\u0275fac=function(t){return new(t||e)(o.\u0275\u0275inject(m._M))},e.\u0275prov=o.\u0275\u0275defineInjectable({token:e,factory:e.\u0275fac,providedIn:"root"}),e})();var v=n(89383),x=n(51572);function T(e,i){1&e&&(o.\u0275\u0275elementStart(0,"div",1),o.\u0275\u0275element(1,"mat-spinner",2),o.\u0275\u0275elementEnd()),2&e&&(o.\u0275\u0275advance(1),o.\u0275\u0275property("diameter",100))}const w=[{path:":fileName/:fileToken",component:(()=>{class e{constructor(t,l,g,F){this.router=t,this.exportDownloaderService=l,this.translate=g,this.route=F,this.isLoading=!0,this.fileName="",this.fileToken="",this.subs=new d.Y}ngOnInit(){this.router.params.subscribe(t=>{this.fileName=t?.fileName?t?.fileName:"",this.fileToken=t?.fileToken?t?.fileToken:"",this.fileName&&this.fileToken?this.checkFileTokenValidity():this.swalExpiredFileToken()})}checkFileTokenValidity(){this.fileToken&&(this.subs.sink=this.exportDownloaderService.checkFileExpirationTokenForExport(this.fileToken).subscribe(t=>{this.isLoading=!1,"file token still active"===t?this.downloadFile():this.swalExpiredFileToken()}))}downloadFile(){const t=document.createElement("a");t.setAttribute("type","hidden"),t.href=`${f.N.apiUrl}/fileuploads/${this.fileName}?download=true`.replace("/graphql",""),t.target="_blank",t.click(),t.remove(),this.swalSuccess()}swalSuccess(){c().fire({type:"success",title:this.translate.instant("Bravo!"),confirmButtonText:this.translate.instant("OK"),allowEnterKey:!1,allowEscapeKey:!1,allowOutsideClick:!1}).then(()=>{this.route.navigate(["/mailbox"])})}swalExpiredFileToken(){c().fire({type:"warning",title:this.translate.instant("EXPORT_DOWNLOADER_S1.TITLE"),html:this.translate.instant("EXPORT_DOWNLOADER_S1.TEXT"),confirmButtonText:this.translate.instant("EXPORT_DOWNLOADER_S1.BUTTON 1"),allowEnterKey:!1,allowEscapeKey:!1,allowOutsideClick:!1}).then(()=>{this.route.navigate(["/mailbox"])})}ngOnDestroy(){this.subs.unsubscribe()}}return e.\u0275fac=function(t){return new(t||e)(o.\u0275\u0275directiveInject(r.gz),o.\u0275\u0275directiveInject(E),o.\u0275\u0275directiveInject(v.sK),o.\u0275\u0275directiveInject(r.F0))},e.\u0275cmp=o.\u0275\u0275defineComponent({type:e,selectors:[["ms-export-downloader-screen"]],decls:1,vars:1,consts:[["class","loading-indicator",4,"ngIf"],[1,"loading-indicator"],["color","accent",3,"diameter"]],template:function(t,l){1&t&&o.\u0275\u0275template(0,T,2,1,"div",0),2&t&&o.\u0275\u0275property("ngIf",l.isLoading)},dependencies:[s.O5,x.Ou]}),e})(),pathMatch:"full"}];let k=(()=>{class e{}return e.\u0275fac=function(t){return new(t||e)},e.\u0275mod=o.\u0275\u0275defineNgModule({type:e}),e.\u0275inj=o.\u0275\u0275defineInjector({imports:[r.Bz.forChild(w),r.Bz]}),e})();var y=n(93730);let D=(()=>{class e{}return e.\u0275fac=function(t){return new(t||e)},e.\u0275mod=o.\u0275\u0275defineNgModule({type:e}),e.\u0275inj=o.\u0275\u0275defineInjector({imports:[s.ez,y.m,k]}),e})()}}]);