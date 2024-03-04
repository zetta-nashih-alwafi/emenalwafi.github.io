(self.webpackChunkGene=self.webpackChunkGene||[]).push([[179],{58084:(on,ot,l)=>{"use strict";l.d(ot,{Bs:()=>J,IR:()=>r,Ot:()=>St,QI:()=>Je,RK:()=>lt,WU:()=>C,g5:()=>x,iR:()=>ke,wY:()=>T,yB:()=>en});var i=l(94650),a=l(36895),m=l(8929),S=l(591),d=l(56498),N=l(36787),q=l(92198),b=l(22868);const A={provide:i.APP_BOOTSTRAP_LISTENER,useFactory:function P(Lt,nn){return()=>{if((0,a.NF)(nn)){const qe=Array.from(Lt.querySelectorAll(`[class*=${$}]`)),vt=/\bflex-layout-.+?\b/g;qe.forEach(it=>{it.classList.contains(`${$}ssr`)&&it.parentNode?it.parentNode.removeChild(it):it.className.replace(vt,"")})}}},deps:[a.K0,i.PLATFORM_ID],multi:!0},$="flex-layout-";let r=(()=>{class Lt{}return Lt.\u0275fac=function(qe){return new(qe||Lt)},Lt.\u0275mod=i.\u0275\u0275defineNgModule({type:Lt}),Lt.\u0275inj=i.\u0275\u0275defineInjector({providers:[A]}),Lt})();class B{constructor(nn=!1,qe="all",vt="",it="",ct=0){this.matches=nn,this.mediaQuery=qe,this.mqAlias=vt,this.suffix=it,this.priority=ct,this.property=""}clone(){return new B(this.matches,this.mediaQuery,this.mqAlias,this.suffix)}}let K=(()=>{class Lt{constructor(){this.stylesheet=new Map}addStyleToElement(qe,vt,it){const ct=this.stylesheet.get(qe);ct?ct.set(vt,it):this.stylesheet.set(qe,new Map([[vt,it]]))}clearStyles(){this.stylesheet.clear()}getStyleForElement(qe,vt){const it=this.stylesheet.get(qe);let ct="";if(it){const mt=it.get(vt);("number"==typeof mt||"string"==typeof mt)&&(ct=mt+"")}return ct}}return Lt.\u0275fac=function(qe){return new(qe||Lt)},Lt.\u0275prov=(0,i.\u0275\u0275defineInjectable)({factory:function(){return new Lt},token:Lt,providedIn:"root"}),Lt})();const x={addFlexToParent:!0,addOrientationBps:!1,disableDefaultBps:!1,disableVendorPrefixes:!1,serverLoaded:!1,useColumnBasisZero:!0,printWithBreakpoints:[],mediaTriggerAutoRestore:!0,ssrObserveBreakpoints:[]},C=new i.InjectionToken("Flex Layout token, config options for the library",{providedIn:"root",factory:()=>x}),T=new i.InjectionToken("FlexLayoutServerLoaded",{providedIn:"root",factory:()=>!1}),J=new i.InjectionToken("Flex Layout token, collect all breakpoints into one provider",{providedIn:"root",factory:()=>null});function Me(Lt,nn){return Lt=Lt?Lt.clone():new B,nn&&(Lt.mqAlias=nn.alias,Lt.mediaQuery=nn.mediaQuery,Lt.suffix=nn.suffix,Lt.priority=nn.priority),Lt}const Ve="inline",Ee=["row","column","row-reverse","column-reverse"];function be(Lt){if(Lt)switch(Lt.toLowerCase()){case"reverse":case"wrap-reverse":case"reverse-wrap":Lt="wrap-reverse";break;case"no":case"none":case"nowrap":Lt="nowrap";break;default:Lt="wrap"}return Lt}let ke=(()=>{class Lt{constructor(qe,vt,it,ct){this.elementRef=qe,this.styleBuilder=vt,this.styler=it,this.marshal=ct,this.DIRECTIVE_KEY="",this.inputs=[],this.mru={},this.destroySubject=new m.xQ,this.styleCache=new Map}get parentElement(){return this.elementRef.nativeElement.parentElement}get nativeElement(){return this.elementRef.nativeElement}get activatedValue(){return this.marshal.getValue(this.nativeElement,this.DIRECTIVE_KEY)}set activatedValue(qe){this.marshal.setValue(this.nativeElement,this.DIRECTIVE_KEY,qe,this.marshal.activatedAlias)}ngOnChanges(qe){Object.keys(qe).forEach(vt=>{if(-1!==this.inputs.indexOf(vt)){const it=vt.split(".").slice(1).join(".");this.setValue(qe[vt].currentValue,it)}})}ngOnDestroy(){this.destroySubject.next(),this.destroySubject.complete(),this.marshal.releaseElement(this.nativeElement)}init(qe=[]){this.marshal.init(this.elementRef.nativeElement,this.DIRECTIVE_KEY,this.updateWithValue.bind(this),this.clearStyles.bind(this),qe)}addStyles(qe,vt){const it=this.styleBuilder,ct=it.shouldCache;let mt=this.styleCache.get(qe);(!mt||!ct)&&(mt=it.buildStyles(qe,vt),ct&&this.styleCache.set(qe,mt)),this.mru=Object.assign({},mt),this.applyStyleToElement(mt),it.sideEffect(qe,mt,vt)}clearStyles(){Object.keys(this.mru).forEach(qe=>{this.mru[qe]=""}),this.applyStyleToElement(this.mru),this.mru={}}triggerUpdate(){this.marshal.triggerUpdate(this.nativeElement,this.DIRECTIVE_KEY)}getFlexFlowDirection(qe,vt=!1){if(qe){const[it,ct]=this.styler.getFlowDirection(qe);if(!ct&&vt){const mt=function we(Lt){let[nn,qe,vt]=function ye(Lt){Lt=Lt?Lt.toLowerCase():"";let[nn,qe,vt]=Lt.split(" ");return Ee.find(it=>it===nn)||(nn=Ee[0]),qe===Ve&&(qe=vt!==Ve?vt:"",vt=Ve),[nn,be(qe),!!vt]}(Lt);return function f(Lt,nn=null,qe=!1){return{display:qe?"inline-flex":"flex","box-sizing":"border-box","flex-direction":Lt,"flex-wrap":nn||null}}(nn,qe,vt)}(it);this.styler.applyStyleToElements(mt,[qe])}return it.trim()}return"row"}hasWrap(qe){return this.styler.hasWrap(qe)}applyStyleToElement(qe,vt,it=this.nativeElement){this.styler.applyStyleToElement(it,qe,vt)}setValue(qe,vt){this.marshal.setValue(this.nativeElement,this.DIRECTIVE_KEY,qe,vt)}updateWithValue(qe){this.currentValue!==qe&&(this.addStyles(qe),this.currentValue=qe)}}return Lt.\u0275fac=function(qe){i.\u0275\u0275invalidFactory()},Lt.\u0275dir=i.\u0275\u0275defineDirective({type:Lt,features:[i.\u0275\u0275NgOnChangesFeature]}),Lt})();const ve=[{alias:"xs",mediaQuery:"screen and (min-width: 0px) and (max-width: 599.9px)",priority:1e3},{alias:"sm",mediaQuery:"screen and (min-width: 600px) and (max-width: 959.9px)",priority:900},{alias:"md",mediaQuery:"screen and (min-width: 960px) and (max-width: 1279.9px)",priority:800},{alias:"lg",mediaQuery:"screen and (min-width: 1280px) and (max-width: 1919.9px)",priority:700},{alias:"xl",mediaQuery:"screen and (min-width: 1920px) and (max-width: 4999.9px)",priority:600},{alias:"lt-sm",overlapping:!0,mediaQuery:"screen and (max-width: 599.9px)",priority:950},{alias:"lt-md",overlapping:!0,mediaQuery:"screen and (max-width: 959.9px)",priority:850},{alias:"lt-lg",overlapping:!0,mediaQuery:"screen and (max-width: 1279.9px)",priority:750},{alias:"lt-xl",overlapping:!0,priority:650,mediaQuery:"screen and (max-width: 1919.9px)"},{alias:"gt-xs",overlapping:!0,mediaQuery:"screen and (min-width: 600px)",priority:-950},{alias:"gt-sm",overlapping:!0,mediaQuery:"screen and (min-width: 960px)",priority:-850},{alias:"gt-md",overlapping:!0,mediaQuery:"screen and (min-width: 1280px)",priority:-750},{alias:"gt-lg",overlapping:!0,mediaQuery:"screen and (min-width: 1920px)",priority:-650}],te="(orientation: portrait) and (max-width: 599.9px)",Se="(orientation: landscape) and (max-width: 959.9px)",at="(orientation: portrait) and (min-width: 600px) and (max-width: 839.9px)",ht="(orientation: landscape) and (min-width: 960px) and (max-width: 1279.9px)",cn="(orientation: portrait) and (min-width: 840px)",yt="(orientation: landscape) and (min-width: 1280px)",bt={HANDSET:`${te}, ${Se}`,TABLET:`${at} , ${ht}`,WEB:`${cn}, ${yt} `,HANDSET_PORTRAIT:`${te}`,TABLET_PORTRAIT:`${at} `,WEB_PORTRAIT:`${cn}`,HANDSET_LANDSCAPE:`${Se}`,TABLET_LANDSCAPE:`${ht}`,WEB_LANDSCAPE:`${yt}`},je=[{alias:"handset",priority:2e3,mediaQuery:bt.HANDSET},{alias:"handset.landscape",priority:2e3,mediaQuery:bt.HANDSET_LANDSCAPE},{alias:"handset.portrait",priority:2e3,mediaQuery:bt.HANDSET_PORTRAIT},{alias:"tablet",priority:2100,mediaQuery:bt.TABLET},{alias:"tablet.landscape",priority:2100,mediaQuery:bt.TABLET_LANDSCAPE},{alias:"tablet.portrait",priority:2100,mediaQuery:bt.TABLET_PORTRAIT},{alias:"web",priority:2200,mediaQuery:bt.WEB,overlapping:!0},{alias:"web.landscape",priority:2200,mediaQuery:bt.WEB_LANDSCAPE,overlapping:!0},{alias:"web.portrait",priority:2200,mediaQuery:bt.WEB_PORTRAIT,overlapping:!0}],L=/(\.|-|_)/g;function Z(Lt){let nn=Lt.length>0?Lt.charAt(0):"",qe=Lt.length>1?Lt.slice(1):"";return nn.toUpperCase()+qe}function xe(Lt,nn=[]){const qe={};return Lt.forEach(vt=>{qe[vt.alias]=vt}),nn.forEach(vt=>{qe[vt.alias]?function ue(Lt,...nn){if(null==Lt)throw TypeError("Cannot convert undefined or null to object");for(let qe of nn)if(null!=qe)for(let vt in qe)qe.hasOwnProperty(vt)&&(Lt[vt]=qe[vt])}(qe[vt.alias],vt):qe[vt.alias]=vt}),function oe(Lt){return Lt.forEach(nn=>{nn.suffix||(nn.suffix=function F(Lt){return Lt.replace(L,"|").split("|").map(Z).join("")}(nn.alias),nn.overlapping=!!nn.overlapping)}),Lt}(Object.keys(qe).map(vt=>qe[vt]))}const Ye=new i.InjectionToken("Token (@angular/flex-layout) Breakpoints",{providedIn:"root",factory:()=>{const Lt=(0,i.inject)(J),nn=(0,i.inject)(C),qe=[].concat.apply([],(Lt||[]).map(it=>Array.isArray(it)?it:[it]));return xe((nn.disableDefaultBps?[]:ve).concat(nn.addOrientationBps?je:[]),qe)}});function Le(Lt,nn){return(nn&&nn.priority||0)-(Lt&&Lt.priority||0)}function At(Lt,nn){return(Lt.priority||0)-(nn.priority||0)}let Ot=(()=>{class Lt{constructor(qe){this.findByMap=new Map,this.items=[...qe].sort(At)}findByAlias(qe){return qe?this.findWithPredicate(qe,vt=>vt.alias==qe):null}findByQuery(qe){return this.findWithPredicate(qe,vt=>vt.mediaQuery==qe)}get overlappings(){return this.items.filter(qe=>1==qe.overlapping)}get aliases(){return this.items.map(qe=>qe.alias)}get suffixes(){return this.items.map(qe=>qe.suffix?qe.suffix:"")}findWithPredicate(qe,vt){let it=this.findByMap.get(qe);return it||(it=this.items.find(vt)||null,this.findByMap.set(qe,it)),it||null}}return Lt.\u0275fac=function(qe){return new(qe||Lt)(i.\u0275\u0275inject(Ye))},Lt.\u0275prov=(0,i.\u0275\u0275defineInjectable)({factory:function(){return new Lt((0,i.\u0275\u0275inject)(Ye))},token:Lt,providedIn:"root"}),Lt})(),Te=(()=>{class Lt{constructor(qe,vt,it){this._zone=qe,this._platformId=vt,this._document=it,this.source=new S.X(new B(!0)),this.registry=new Map,this.pendingRemoveListenerFns=[],this._observable$=this.source.asObservable()}get activations(){const qe=[];return this.registry.forEach((vt,it)=>{vt.matches&&qe.push(it)}),qe}isActive(qe){const vt=this.registry.get(qe);return vt?vt.matches:this.registerQuery(qe).some(it=>it.matches)}observe(qe,vt=!1){if(qe&&qe.length){const it=this._observable$.pipe((0,q.h)(mt=>!vt||qe.indexOf(mt.mediaQuery)>-1)),ct=new d.y(mt=>{const nt=this.registerQuery(qe);if(nt.length){const kt=nt.pop();nt.forEach(Ct=>{mt.next(Ct)}),this.source.next(kt)}mt.complete()});return(0,N.T)(ct,it)}return this._observable$}registerQuery(qe){const vt=Array.isArray(qe)?qe:[qe],it=[];return function de(Lt,nn){const qe=Lt.filter(vt=>!Re[vt]);if(qe.length>0){const vt=qe.join(", ");try{const it=nn.createElement("style");it.setAttribute("type","text/css"),it.styleSheet||it.appendChild(nn.createTextNode(`\n/*\n  @angular/flex-layout - workaround for possible browser quirk with mediaQuery listeners\n  see http://bit.ly/2sd4HMP\n*/\n@media ${vt} {.fx-query-test{ }}\n`)),nn.head.appendChild(it),qe.forEach(ct=>Re[ct]=it)}catch(it){console.error(it)}}}(vt,this._document),vt.forEach(ct=>{const mt=kt=>{this._zone.run(()=>this.source.next(new B(kt.matches,ct)))};let nt=this.registry.get(ct);nt||(nt=this.buildMQL(ct),nt.addListener(mt),this.pendingRemoveListenerFns.push(()=>nt.removeListener(mt)),this.registry.set(ct,nt)),nt.matches&&it.push(new B(!0,ct))}),it}ngOnDestroy(){let qe;for(;qe=this.pendingRemoveListenerFns.pop();)qe()}buildMQL(qe){return function _t(Lt,nn){return nn&&window.matchMedia("all").addListener?window.matchMedia(Lt):{matches:"all"===Lt||""===Lt,media:Lt,addListener:()=>{},removeListener:()=>{},onchange:null,addEventListener(){},removeEventListener(){},dispatchEvent:()=>!1}}(qe,(0,a.NF)(this._platformId))}}return Lt.\u0275fac=function(qe){return new(qe||Lt)(i.\u0275\u0275inject(i.NgZone),i.\u0275\u0275inject(i.PLATFORM_ID),i.\u0275\u0275inject(a.K0))},Lt.\u0275prov=(0,i.\u0275\u0275defineInjectable)({factory:function(){return new Lt((0,i.\u0275\u0275inject)(i.NgZone),(0,i.\u0275\u0275inject)(i.PLATFORM_ID),(0,i.\u0275\u0275inject)(a.K0))},token:Lt,providedIn:"root"}),Lt})();const Re={},vn="print",Cn={alias:vn,mediaQuery:vn,priority:1e3};let Pt=(()=>{class Lt{constructor(qe,vt,it){this.breakpoints=qe,this.layoutConfig=vt,this._document=it,this.registeredBeforeAfterPrintHooks=!1,this.isPrintingBeforeAfterEvent=!1,this.beforePrintEventListeners=[],this.afterPrintEventListeners=[],this.isPrinting=!1,this.queue=new st,this.deactivations=[]}withPrintQuery(qe){return[...qe,vn]}isPrintEvent(qe){return qe.mediaQuery.startsWith(vn)}get printAlias(){return this.layoutConfig.printWithBreakpoints||[]}get printBreakPoints(){return this.printAlias.map(qe=>this.breakpoints.findByAlias(qe)).filter(qe=>null!==qe)}getEventBreakpoints({mediaQuery:qe}){const vt=this.breakpoints.findByQuery(qe);return(vt?[...this.printBreakPoints,vt]:this.printBreakPoints).sort(Le)}updateEvent(qe){let vt=this.breakpoints.findByQuery(qe.mediaQuery);return this.isPrintEvent(qe)&&(vt=this.getEventBreakpoints(qe)[0],qe.mediaQuery=vt?vt.mediaQuery:""),Me(qe,vt)}registerBeforeAfterPrintHooks(qe){if(!this._document.defaultView||this.registeredBeforeAfterPrintHooks)return;this.registeredBeforeAfterPrintHooks=!0;const vt=()=>{this.isPrinting||(this.isPrintingBeforeAfterEvent=!0,this.startPrinting(qe,this.getEventBreakpoints(new B(!0,vn))),qe.updateStyles())},it=()=>{this.isPrintingBeforeAfterEvent=!1,this.isPrinting&&(this.stopPrinting(qe),qe.updateStyles())};this._document.defaultView.addEventListener("beforeprint",vt),this._document.defaultView.addEventListener("afterprint",it),this.beforePrintEventListeners.push(vt),this.afterPrintEventListeners.push(it)}interceptEvents(qe){return this.registerBeforeAfterPrintHooks(qe),vt=>{this.isPrintEvent(vt)?vt.matches&&!this.isPrinting?(this.startPrinting(qe,this.getEventBreakpoints(vt)),qe.updateStyles()):!vt.matches&&this.isPrinting&&!this.isPrintingBeforeAfterEvent&&(this.stopPrinting(qe),qe.updateStyles()):this.collectActivations(vt)}}blockPropagation(){return qe=>!(this.isPrinting||this.isPrintEvent(qe))}startPrinting(qe,vt){this.isPrinting=!0,qe.activatedBreakpoints=this.queue.addPrintBreakpoints(vt)}stopPrinting(qe){qe.activatedBreakpoints=this.deactivations,this.deactivations=[],this.queue.clear(),this.isPrinting=!1}collectActivations(qe){if(!this.isPrinting||this.isPrintingBeforeAfterEvent)if(qe.matches)this.isPrintingBeforeAfterEvent||(this.deactivations=[]);else{const vt=this.breakpoints.findByQuery(qe.mediaQuery);vt&&(this.deactivations.push(vt),this.deactivations.sort(Le))}}ngOnDestroy(){this.beforePrintEventListeners.forEach(qe=>this._document.defaultView.removeEventListener("beforeprint",qe)),this.afterPrintEventListeners.forEach(qe=>this._document.defaultView.removeEventListener("afterprint",qe))}}return Lt.\u0275fac=function(qe){return new(qe||Lt)(i.\u0275\u0275inject(Ot),i.\u0275\u0275inject(C),i.\u0275\u0275inject(a.K0))},Lt.\u0275prov=(0,i.\u0275\u0275defineInjectable)({factory:function(){return new Lt((0,i.\u0275\u0275inject)(Ot),(0,i.\u0275\u0275inject)(C),(0,i.\u0275\u0275inject)(a.K0))},token:Lt,providedIn:"root"}),Lt})();class st{constructor(){this.printBreakpoints=[]}addPrintBreakpoints(nn){return nn.push(Cn),nn.sort(Le),nn.forEach(qe=>this.addBreakpoint(qe)),this.printBreakpoints}addBreakpoint(nn){nn&&void 0===this.printBreakpoints.find(vt=>vt.mediaQuery===nn.mediaQuery)&&(this.printBreakpoints=function Ie(Lt){return!!Lt&&Lt.mediaQuery.startsWith(vn)}(nn)?[nn,...this.printBreakpoints]:[...this.printBreakpoints,nn])}clear(){this.printBreakpoints=[]}}function Ce(Lt){for(let nn in Lt){let qe=Lt[nn]||"";switch(nn){case"display":Lt.display="flex"===qe?["-webkit-flex","flex"]:"inline-flex"===qe?["-webkit-inline-flex","inline-flex"]:qe;break;case"align-items":case"align-self":case"align-content":case"flex":case"flex-basis":case"flex-flow":case"flex-grow":case"flex-shrink":case"flex-wrap":case"justify-content":Lt["-webkit-"+nn]=qe;break;case"flex-direction":qe=qe||"row",Lt["-webkit-flex-direction"]=qe,Lt["flex-direction"]=qe;break;case"order":Lt.order=Lt["-webkit-"+nn]=isNaN(+qe)?"0":qe}}return Lt}let lt=(()=>{class Lt{constructor(qe,vt,it,ct){this._serverStylesheet=qe,this._serverModuleLoaded=vt,this._platformId=it,this.layoutConfig=ct}applyStyleToElement(qe,vt,it=null){let ct={};"string"==typeof vt&&(ct[vt]=it,vt=ct),ct=this.layoutConfig.disableVendorPrefixes?vt:Ce(vt),this._applyMultiValueStyleToElement(ct,qe)}applyStyleToElements(qe,vt=[]){const it=this.layoutConfig.disableVendorPrefixes?qe:Ce(qe);vt.forEach(ct=>{this._applyMultiValueStyleToElement(it,ct)})}getFlowDirection(qe){const vt="flex-direction";let it=this.lookupStyle(qe,vt);return[it||"row",this.lookupInlineStyle(qe,vt)||(0,a.PM)(this._platformId)&&this._serverModuleLoaded?it:""]}hasWrap(qe){return"wrap"===this.lookupStyle(qe,"flex-wrap")}lookupAttributeValue(qe,vt){return qe.getAttribute(vt)||""}lookupInlineStyle(qe,vt){return(0,a.NF)(this._platformId)?qe.style.getPropertyValue(vt):this._getServerStyle(qe,vt)}lookupStyle(qe,vt,it=!1){let ct="";return qe&&((ct=this.lookupInlineStyle(qe,vt))||((0,a.NF)(this._platformId)?it||(ct=getComputedStyle(qe).getPropertyValue(vt)):this._serverModuleLoaded&&(ct=this._serverStylesheet.getStyleForElement(qe,vt)))),ct?ct.trim():""}_applyMultiValueStyleToElement(qe,vt){Object.keys(qe).sort().forEach(it=>{const ct=qe[it],mt=Array.isArray(ct)?ct:[ct];mt.sort();for(let nt of mt)nt=nt?nt+"":"",(0,a.NF)(this._platformId)||!this._serverModuleLoaded?(0,a.NF)(this._platformId)?vt.style.setProperty(it,nt):this._setServerStyle(vt,it,nt):this._serverStylesheet.addStyleToElement(vt,it,nt)})}_setServerStyle(qe,vt,it){vt=vt.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase();const ct=this._readStyleAttribute(qe);ct[vt]=it||"",this._writeStyleAttribute(qe,ct)}_getServerStyle(qe,vt){return this._readStyleAttribute(qe)[vt]||""}_readStyleAttribute(qe){const vt={},it=qe.getAttribute("style");if(it){const ct=it.split(/;+/g);for(let mt=0;mt<ct.length;mt++){const nt=ct[mt].trim();if(nt.length>0){const kt=nt.indexOf(":");if(-1===kt)throw new Error(`Invalid CSS style: ${nt}`);vt[nt.substr(0,kt).trim()]=nt.substr(kt+1).trim()}}}return vt}_writeStyleAttribute(qe,vt){let it="";for(const ct in vt)vt[ct]&&(it+=ct+":"+vt[ct]+";");qe.setAttribute("style",it)}}return Lt.\u0275fac=function(qe){return new(qe||Lt)(i.\u0275\u0275inject(K),i.\u0275\u0275inject(T),i.\u0275\u0275inject(i.PLATFORM_ID),i.\u0275\u0275inject(C))},Lt.\u0275prov=(0,i.\u0275\u0275defineInjectable)({factory:function(){return new Lt((0,i.\u0275\u0275inject)(K),(0,i.\u0275\u0275inject)(T),(0,i.\u0275\u0275inject)(i.PLATFORM_ID),(0,i.\u0275\u0275inject)(C))},token:Lt,providedIn:"root"}),Lt})();class Je{constructor(){this.shouldCache=!0}sideEffect(nn,qe,vt){}}function St(Lt,nn="1",qe="1"){let vt=[nn,qe,Lt],it=Lt.indexOf("calc");if(it>0){vt[2]=Et(Lt.substring(it).trim());let ct=Lt.substr(0,it).trim().split(" ");2==ct.length&&(vt[0]=ct[0],vt[1]=ct[1])}else if(0==it)vt[2]=Et(Lt.trim());else{let ct=Lt.split(" ");vt=3===ct.length?ct:[nn,qe,Lt]}return vt}function Et(Lt){return Lt.replace(/[\s]/g,"").replace(/[\/\*\+\-]/g," $& ")}let en=(()=>{class Lt{constructor(qe,vt,it){this.matchMedia=qe,this.breakpoints=vt,this.hook=it,this.activatedBreakpoints=[],this.elementMap=new Map,this.elementKeyMap=new WeakMap,this.watcherMap=new WeakMap,this.updateMap=new WeakMap,this.clearMap=new WeakMap,this.subject=new m.xQ,this.observeActivations()}get activatedAlias(){return this.activatedBreakpoints[0]?this.activatedBreakpoints[0].alias:""}onMediaChange(qe){const vt=this.findByQuery(qe.mediaQuery);vt&&((qe=Me(qe,vt)).matches&&-1===this.activatedBreakpoints.indexOf(vt)?(this.activatedBreakpoints.push(vt),this.activatedBreakpoints.sort(Le),this.updateStyles()):!qe.matches&&-1!==this.activatedBreakpoints.indexOf(vt)&&(this.activatedBreakpoints.splice(this.activatedBreakpoints.indexOf(vt),1),this.activatedBreakpoints.sort(Le),this.updateStyles()))}init(qe,vt,it,ct,mt=[]){Yt(this.updateMap,qe,vt,it),Yt(this.clearMap,qe,vt,ct),this.buildElementKeyMap(qe,vt),this.watchExtraTriggers(qe,vt,mt)}getValue(qe,vt,it){const ct=this.elementMap.get(qe);if(ct){const mt=void 0!==it?ct.get(it):this.getActivatedValues(ct,vt);if(mt)return mt.get(vt)}}hasValue(qe,vt){const it=this.elementMap.get(qe);if(it){const ct=this.getActivatedValues(it,vt);if(ct)return void 0!==ct.get(vt)||!1}return!1}setValue(qe,vt,it,ct){let mt=this.elementMap.get(qe);if(mt){const kt=(mt.get(ct)||new Map).set(vt,it);mt.set(ct,kt),this.elementMap.set(qe,mt)}else mt=(new Map).set(ct,(new Map).set(vt,it)),this.elementMap.set(qe,mt);const nt=this.getValue(qe,vt);void 0!==nt&&this.updateElement(qe,vt,nt)}trackValue(qe,vt){return this.subject.asObservable().pipe((0,q.h)(it=>it.element===qe&&it.key===vt))}updateStyles(){this.elementMap.forEach((qe,vt)=>{const it=new Set(this.elementKeyMap.get(vt));let ct=this.getActivatedValues(qe);ct&&ct.forEach((mt,nt)=>{this.updateElement(vt,nt,mt),it.delete(nt)}),it.forEach(mt=>{if(ct=this.getActivatedValues(qe,mt),ct){const nt=ct.get(mt);this.updateElement(vt,mt,nt)}else this.clearElement(vt,mt)})})}clearElement(qe,vt){const it=this.clearMap.get(qe);if(it){const ct=it.get(vt);ct&&(ct(),this.subject.next({element:qe,key:vt,value:""}))}}updateElement(qe,vt,it){const ct=this.updateMap.get(qe);if(ct){const mt=ct.get(vt);mt&&(mt(it),this.subject.next({element:qe,key:vt,value:it}))}}releaseElement(qe){const vt=this.watcherMap.get(qe);vt&&(vt.forEach(ct=>ct.unsubscribe()),this.watcherMap.delete(qe));const it=this.elementMap.get(qe);it&&(it.forEach((ct,mt)=>it.delete(mt)),this.elementMap.delete(qe))}triggerUpdate(qe,vt){const it=this.elementMap.get(qe);if(it){const ct=this.getActivatedValues(it,vt);ct&&(vt?this.updateElement(qe,vt,ct.get(vt)):ct.forEach((mt,nt)=>this.updateElement(qe,nt,mt)))}}buildElementKeyMap(qe,vt){let it=this.elementKeyMap.get(qe);it||(it=new Set,this.elementKeyMap.set(qe,it)),it.add(vt)}watchExtraTriggers(qe,vt,it){if(it&&it.length){let ct=this.watcherMap.get(qe);if(ct||(ct=new Map,this.watcherMap.set(qe,ct)),!ct.get(vt)){const nt=(0,N.T)(...it).subscribe(()=>{const kt=this.getValue(qe,vt);this.updateElement(qe,vt,kt)});ct.set(vt,nt)}}}findByQuery(qe){return this.breakpoints.findByQuery(qe)}getActivatedValues(qe,vt){for(let ct=0;ct<this.activatedBreakpoints.length;ct++){const nt=qe.get(this.activatedBreakpoints[ct].alias);if(nt&&(void 0===vt||nt.has(vt)&&null!=nt.get(vt)))return nt}const it=qe.get("");return void 0===vt||it&&it.has(vt)?it:void 0}observeActivations(){const vt=this.breakpoints.items.map(it=>it.mediaQuery);this.matchMedia.observe(this.hook.withPrintQuery(vt)).pipe((0,b.b)(this.hook.interceptEvents(this)),(0,q.h)(this.hook.blockPropagation())).subscribe(this.onMediaChange.bind(this))}}return Lt.\u0275fac=function(qe){return new(qe||Lt)(i.\u0275\u0275inject(Te),i.\u0275\u0275inject(Ot),i.\u0275\u0275inject(Pt))},Lt.\u0275prov=(0,i.\u0275\u0275defineInjectable)({factory:function(){return new Lt((0,i.\u0275\u0275inject)(Te),(0,i.\u0275\u0275inject)(Ot),(0,i.\u0275\u0275inject)(Pt))},token:Lt,providedIn:"root"}),Lt})();function Yt(Lt,nn,qe,vt){if(void 0!==vt){let it=Lt.get(nn);it||(it=new Map,Lt.set(nn,it)),it.set(qe,vt)}}},24784:(on,ot,l)=>{"use strict";l.d(ot,{Zl:()=>yt,aT:()=>ue,b8:()=>we,oO:()=>C});var i=l(94650),a=l(36895),m=l(58084),S=l(21281),d=l(7625),N=l(11481);let B=(()=>{class L extends m.iR{constructor(F,oe,xe,Ye,Le,At,Ot){super(F,null,oe,xe),this.ngClassInstance=Ot,this.DIRECTIVE_KEY="ngClass",this.ngClassInstance||(this.ngClassInstance=new a.mk(Ye,Le,F,At)),this.init(),this.setValue("","")}set klass(F){this.ngClassInstance.klass=F,this.setValue(F,"")}updateWithValue(F){this.ngClassInstance.ngClass=F,this.ngClassInstance.ngDoCheck()}ngDoCheck(){this.ngClassInstance.ngDoCheck()}}return L.\u0275fac=function(F){return new(F||L)(i.\u0275\u0275directiveInject(i.ElementRef),i.\u0275\u0275directiveInject(m.RK),i.\u0275\u0275directiveInject(m.yB),i.\u0275\u0275directiveInject(i.IterableDiffers),i.\u0275\u0275directiveInject(i.KeyValueDiffers),i.\u0275\u0275directiveInject(i.Renderer2),i.\u0275\u0275directiveInject(a.mk,10))},L.\u0275dir=i.\u0275\u0275defineDirective({type:L,inputs:{klass:["class","klass"]},features:[i.\u0275\u0275InheritDefinitionFeature]}),L})();const K=["ngClass","ngClass.xs","ngClass.sm","ngClass.md","ngClass.lg","ngClass.xl","ngClass.lt-sm","ngClass.lt-md","ngClass.lt-lg","ngClass.lt-xl","ngClass.gt-xs","ngClass.gt-sm","ngClass.gt-md","ngClass.gt-lg"];let C=(()=>{class L extends B{constructor(){super(...arguments),this.inputs=K}}return L.\u0275fac=function(){let Z;return function(oe){return(Z||(Z=i.\u0275\u0275getInheritedFactory(L)))(oe||L)}}(),L.\u0275dir=i.\u0275\u0275defineDirective({type:L,selectors:[["","ngClass",""],["","ngClass.xs",""],["","ngClass.sm",""],["","ngClass.md",""],["","ngClass.lg",""],["","ngClass.xl",""],["","ngClass.lt-sm",""],["","ngClass.lt-md",""],["","ngClass.lt-lg",""],["","ngClass.lt-xl",""],["","ngClass.gt-xs",""],["","ngClass.gt-sm",""],["","ngClass.gt-md",""],["","ngClass.gt-lg",""]],inputs:{ngClass:"ngClass","ngClass.xs":"ngClass.xs","ngClass.sm":"ngClass.sm","ngClass.md":"ngClass.md","ngClass.lg":"ngClass.lg","ngClass.xl":"ngClass.xl","ngClass.lt-sm":"ngClass.lt-sm","ngClass.lt-md":"ngClass.lt-md","ngClass.lt-lg":"ngClass.lt-lg","ngClass.lt-xl":"ngClass.lt-xl","ngClass.gt-xs":"ngClass.gt-xs","ngClass.gt-sm":"ngClass.gt-sm","ngClass.gt-md":"ngClass.gt-md","ngClass.gt-lg":"ngClass.gt-lg"},features:[i.\u0275\u0275InheritDefinitionFeature]}),L})(),T=(()=>{class L extends m.QI{buildStyles(F,oe){return{display:"true"===F?oe.display||(oe.isServer?"initial":""):"none"}}}return L.\u0275fac=function(){let Z;return function(oe){return(Z||(Z=i.\u0275\u0275getInheritedFactory(L)))(oe||L)}}(),L.\u0275prov=(0,i.\u0275\u0275defineInjectable)({factory:function(){return new L},token:L,providedIn:"root"}),L})(),J=(()=>{class L extends m.iR{constructor(F,oe,xe,Ye,Le,At,Ot){super(F,oe,xe,Ye),this.layoutConfig=Le,this.platformId=At,this.serverModuleLoaded=Ot,this.DIRECTIVE_KEY="show-hide",this.display="",this.hasLayout=!1,this.hasFlexChild=!1}ngAfterViewInit(){this.trackExtraTriggers();const F=Array.from(this.nativeElement.children);for(let xe=0;xe<F.length;xe++)if(this.marshal.hasValue(F[xe],"flex")){this.hasFlexChild=!0;break}Me.has(this.nativeElement)?this.display=Me.get(this.nativeElement):(this.display=this.getDisplayStyle(),Me.set(this.nativeElement,this.display)),this.init();const oe=this.marshal.getValue(this.nativeElement,this.DIRECTIVE_KEY,"");void 0===oe||""===oe?this.setValue(!0,""):this.triggerUpdate()}ngOnChanges(F){Object.keys(F).forEach(oe=>{if(-1!==this.inputs.indexOf(oe)){const xe=oe.split("."),Ye=xe.slice(1).join("."),Le=F[oe].currentValue;let At=""===Le||0!==Le&&(0,S.Ig)(Le);"fxHide"===xe[0]&&(At=!At),this.setValue(At,Ye)}})}trackExtraTriggers(){this.hasLayout=this.marshal.hasValue(this.nativeElement,"layout"),["layout","layout-align"].forEach(F=>{this.marshal.trackValue(this.nativeElement,F).pipe((0,d.R)(this.destroySubject)).subscribe(this.triggerUpdate.bind(this))})}getDisplayStyle(){return this.hasLayout||this.hasFlexChild&&this.layoutConfig.addFlexToParent?"flex":this.styler.lookupStyle(this.nativeElement,"display",!0)}updateWithValue(F=!0){if(""===F)return;const oe=(0,a.PM)(this.platformId);this.addStyles(F?"true":"false",{display:this.display,isServer:oe}),oe&&this.serverModuleLoaded&&this.nativeElement.style.setProperty("display",""),this.marshal.triggerUpdate(this.parentElement,"layout-gap")}}return L.\u0275fac=function(F){return new(F||L)(i.\u0275\u0275directiveInject(i.ElementRef),i.\u0275\u0275directiveInject(T),i.\u0275\u0275directiveInject(m.RK),i.\u0275\u0275directiveInject(m.yB),i.\u0275\u0275directiveInject(m.WU),i.\u0275\u0275directiveInject(i.PLATFORM_ID),i.\u0275\u0275directiveInject(m.wY))},L.\u0275dir=i.\u0275\u0275defineDirective({type:L,features:[i.\u0275\u0275InheritDefinitionFeature,i.\u0275\u0275NgOnChangesFeature]}),L})();const Me=new WeakMap,Ve=["fxShow","fxShow.print","fxShow.xs","fxShow.sm","fxShow.md","fxShow.lg","fxShow.xl","fxShow.lt-sm","fxShow.lt-md","fxShow.lt-lg","fxShow.lt-xl","fxShow.gt-xs","fxShow.gt-sm","fxShow.gt-md","fxShow.gt-lg","fxHide","fxHide.print","fxHide.xs","fxHide.sm","fxHide.md","fxHide.lg","fxHide.xl","fxHide.lt-sm","fxHide.lt-md","fxHide.lt-lg","fxHide.lt-xl","fxHide.gt-xs","fxHide.gt-sm","fxHide.gt-md","fxHide.gt-lg"];let we=(()=>{class L extends J{constructor(){super(...arguments),this.inputs=Ve}}return L.\u0275fac=function(){let Z;return function(oe){return(Z||(Z=i.\u0275\u0275getInheritedFactory(L)))(oe||L)}}(),L.\u0275dir=i.\u0275\u0275defineDirective({type:L,selectors:[["","fxShow",""],["","fxShow.print",""],["","fxShow.xs",""],["","fxShow.sm",""],["","fxShow.md",""],["","fxShow.lg",""],["","fxShow.xl",""],["","fxShow.lt-sm",""],["","fxShow.lt-md",""],["","fxShow.lt-lg",""],["","fxShow.lt-xl",""],["","fxShow.gt-xs",""],["","fxShow.gt-sm",""],["","fxShow.gt-md",""],["","fxShow.gt-lg",""],["","fxHide",""],["","fxHide.print",""],["","fxHide.xs",""],["","fxHide.sm",""],["","fxHide.md",""],["","fxHide.lg",""],["","fxHide.xl",""],["","fxHide.lt-sm",""],["","fxHide.lt-md",""],["","fxHide.lt-lg",""],["","fxHide.lt-xl",""],["","fxHide.gt-xs",""],["","fxHide.gt-sm",""],["","fxHide.gt-md",""],["","fxHide.gt-lg",""]],inputs:{fxShow:"fxShow","fxShow.print":"fxShow.print","fxShow.xs":"fxShow.xs","fxShow.sm":"fxShow.sm","fxShow.md":"fxShow.md","fxShow.lg":"fxShow.lg","fxShow.xl":"fxShow.xl","fxShow.lt-sm":"fxShow.lt-sm","fxShow.lt-md":"fxShow.lt-md","fxShow.lt-lg":"fxShow.lt-lg","fxShow.lt-xl":"fxShow.lt-xl","fxShow.gt-xs":"fxShow.gt-xs","fxShow.gt-sm":"fxShow.gt-sm","fxShow.gt-md":"fxShow.gt-md","fxShow.gt-lg":"fxShow.gt-lg",fxHide:"fxHide","fxHide.print":"fxHide.print","fxHide.xs":"fxHide.xs","fxHide.sm":"fxHide.sm","fxHide.md":"fxHide.md","fxHide.lg":"fxHide.lg","fxHide.xl":"fxHide.xl","fxHide.lt-sm":"fxHide.lt-sm","fxHide.lt-md":"fxHide.lt-md","fxHide.lt-lg":"fxHide.lt-lg","fxHide.lt-xl":"fxHide.lt-xl","fxHide.gt-xs":"fxHide.gt-xs","fxHide.gt-sm":"fxHide.gt-sm","fxHide.gt-md":"fxHide.gt-md","fxHide.gt-lg":"fxHide.gt-lg"},features:[i.\u0275\u0275InheritDefinitionFeature]}),L})();class ye{constructor(Z,F,oe=!0){this.key=Z,this.value=F,this.key=oe?Z.replace(/['"]/g,"").trim():Z.trim(),this.value=oe?F.replace(/['"]/g,"").trim():F.trim(),this.value=this.value.replace(/;/,"")}}function be(L){let Z=typeof L;return"object"===Z?L.constructor===Array?"array":L.constructor===Set?"set":"object":Z}function te(L){const[Z,...F]=L.split(":");return new ye(Z,F.join(":"))}function Se(L,Z){return Z.key&&(L[Z.key]=Z.value),L}let at=(()=>{class L extends m.iR{constructor(F,oe,xe,Ye,Le,At,Ot,Te,Re){super(F,null,oe,xe),this.sanitizer=Ye,this.ngStyleInstance=Ot,this.DIRECTIVE_KEY="ngStyle",this.ngStyleInstance||(this.ngStyleInstance=new a.PC(F,Le,At)),this.init();const de=this.nativeElement.getAttribute("style")||"";this.fallbackStyles=this.buildStyleMap(de),this.isServer=Te&&(0,a.PM)(Re)}updateWithValue(F){const oe=this.buildStyleMap(F);this.ngStyleInstance.ngStyle=Object.assign(Object.assign({},this.fallbackStyles),oe),this.isServer&&this.applyStyleToElement(oe),this.ngStyleInstance.ngDoCheck()}clearStyles(){this.ngStyleInstance.ngStyle=this.fallbackStyles,this.ngStyleInstance.ngDoCheck()}buildStyleMap(F){const oe=xe=>this.sanitizer.sanitize(i.SecurityContext.STYLE,xe)||"";if(F)switch(be(F)){case"string":return bt(function f(L,Z=";"){return String(L).trim().split(Z).map(F=>F.trim()).filter(F=>""!==F)}(F),oe);case"array":return bt(F,oe);default:return function ve(L,Z){let F=[];return"set"===be(L)?L.forEach(oe=>F.push(oe)):Object.keys(L).forEach(oe=>{F.push(`${oe}:${L[oe]}`)}),function ke(L,Z){return L.map(te).filter(oe=>!!oe).map(oe=>(Z&&(oe.value=Z(oe.value)),oe)).reduce(Se,{})}(F,Z)}(F,oe)}return{}}ngDoCheck(){this.ngStyleInstance.ngDoCheck()}}return L.\u0275fac=function(F){return new(F||L)(i.\u0275\u0275directiveInject(i.ElementRef),i.\u0275\u0275directiveInject(m.RK),i.\u0275\u0275directiveInject(m.yB),i.\u0275\u0275directiveInject(N.H7),i.\u0275\u0275directiveInject(i.KeyValueDiffers),i.\u0275\u0275directiveInject(i.Renderer2),i.\u0275\u0275directiveInject(a.PC,10),i.\u0275\u0275directiveInject(m.wY),i.\u0275\u0275directiveInject(i.PLATFORM_ID))},L.\u0275dir=i.\u0275\u0275defineDirective({type:L,features:[i.\u0275\u0275InheritDefinitionFeature]}),L})();const ht=["ngStyle","ngStyle.xs","ngStyle.sm","ngStyle.md","ngStyle.lg","ngStyle.xl","ngStyle.lt-sm","ngStyle.lt-md","ngStyle.lt-lg","ngStyle.lt-xl","ngStyle.gt-xs","ngStyle.gt-sm","ngStyle.gt-md","ngStyle.gt-lg"];let yt=(()=>{class L extends at{constructor(){super(...arguments),this.inputs=ht}}return L.\u0275fac=function(){let Z;return function(oe){return(Z||(Z=i.\u0275\u0275getInheritedFactory(L)))(oe||L)}}(),L.\u0275dir=i.\u0275\u0275defineDirective({type:L,selectors:[["","ngStyle",""],["","ngStyle.xs",""],["","ngStyle.sm",""],["","ngStyle.md",""],["","ngStyle.lg",""],["","ngStyle.xl",""],["","ngStyle.lt-sm",""],["","ngStyle.lt-md",""],["","ngStyle.lt-lg",""],["","ngStyle.lt-xl",""],["","ngStyle.gt-xs",""],["","ngStyle.gt-sm",""],["","ngStyle.gt-md",""],["","ngStyle.gt-lg",""]],inputs:{ngStyle:"ngStyle","ngStyle.xs":"ngStyle.xs","ngStyle.sm":"ngStyle.sm","ngStyle.md":"ngStyle.md","ngStyle.lg":"ngStyle.lg","ngStyle.xl":"ngStyle.xl","ngStyle.lt-sm":"ngStyle.lt-sm","ngStyle.lt-md":"ngStyle.lt-md","ngStyle.lt-lg":"ngStyle.lt-lg","ngStyle.lt-xl":"ngStyle.lt-xl","ngStyle.gt-xs":"ngStyle.gt-xs","ngStyle.gt-sm":"ngStyle.gt-sm","ngStyle.gt-md":"ngStyle.gt-md","ngStyle.gt-lg":"ngStyle.gt-lg"},features:[i.\u0275\u0275InheritDefinitionFeature]}),L})();function bt(L,Z){return L.map(te).filter(oe=>!!oe).map(oe=>(Z&&(oe.value=Z(oe.value)),oe)).reduce(Se,{})}let ue=(()=>{class L{}return L.\u0275fac=function(F){return new(F||L)},L.\u0275mod=i.\u0275\u0275defineNgModule({type:L}),L.\u0275inj=i.\u0275\u0275defineInjector({imports:[m.IR]}),L})()},61620:(on,ot,l)=>{"use strict";l.d(ot,{o9:()=>ni});var i=l(94650),a=l(36895),m=l(58084),S=l(24784),d=l(30277);l(21281);let zn=(()=>{class Rt{}return Rt.\u0275fac=function(z){return new(z||Rt)},Rt.\u0275mod=i.\u0275\u0275defineNgModule({type:Rt}),Rt.\u0275inj=i.\u0275\u0275defineInjector({imports:[m.IR]}),Rt})(),ni=(()=>{class Rt{constructor(z,_){(0,a.PM)(_)&&!z&&console.warn("Warning: Flex Layout loaded on the server without FlexLayoutServerModule")}static withConfig(z,_=[]){return{ngModule:Rt,providers:z.serverLoaded?[{provide:m.WU,useValue:Object.assign(Object.assign({},m.g5),z)},{provide:m.Bs,useValue:_,multi:!0},{provide:m.wY,useValue:!0}]:[{provide:m.WU,useValue:Object.assign(Object.assign({},m.g5),z)},{provide:m.Bs,useValue:_,multi:!0}]}}}return Rt.\u0275fac=function(z){return new(z||Rt)(i.\u0275\u0275inject(m.wY),i.\u0275\u0275inject(i.PLATFORM_ID))},Rt.\u0275mod=i.\u0275\u0275defineNgModule({type:Rt}),Rt.\u0275inj=i.\u0275\u0275defineInjector({imports:[d.ae,S.aT,zn,d.ae,S.aT,zn]}),Rt})()},30277:(on,ot,l)=>{"use strict";l.d(ot,{SQ:()=>be,Wh:()=>vt,ae:()=>ae,xw:()=>T,yH:()=>F});var i=l(94650),a=l(58084),m=l(40445),S=l(8929),d=l(7625);const N="inline",q=["row","column","row-reverse","column-reverse"];function P(I){I=I?I.toLowerCase():"";let[w,g,R]=I.split(" ");return q.find(ee=>ee===w)||(w=q[0]),g===N&&(g=R!==N?R:"",R=N),[w,$(g),!!R]}function A(I){let[w]=P(I);return w.indexOf("row")>-1}function $(I){if(I)switch(I.toLowerCase()){case"reverse":case"wrap-reverse":case"reverse-wrap":I="wrap-reverse";break;case"no":case"none":case"nowrap":I="nowrap";break;default:I="wrap"}return I}let B=(()=>{class I extends a.QI{buildStyles(g){return function b(I){let[w,g,R]=P(I);return function r(I,w=null,g=!1){return{display:g?"inline-flex":"flex","box-sizing":"border-box","flex-direction":I,"flex-wrap":w||null}}(w,g,R)}(g)}}return I.\u0275fac=function(){let w;return function(R){return(w||(w=i.\u0275\u0275getInheritedFactory(I)))(R||I)}}(),I.\u0275prov=(0,i.\u0275\u0275defineInjectable)({factory:function(){return new I},token:I,providedIn:"root"}),I})();const K=["fxLayout","fxLayout.xs","fxLayout.sm","fxLayout.md","fxLayout.lg","fxLayout.xl","fxLayout.lt-sm","fxLayout.lt-md","fxLayout.lt-lg","fxLayout.lt-xl","fxLayout.gt-xs","fxLayout.gt-sm","fxLayout.gt-md","fxLayout.gt-lg"];let C=(()=>{class I extends a.iR{constructor(g,R,ee,Ue){super(g,ee,R,Ue),this.DIRECTIVE_KEY="layout",this.styleCache=J,this.init()}}return I.\u0275fac=function(g){return new(g||I)(i.\u0275\u0275directiveInject(i.ElementRef),i.\u0275\u0275directiveInject(a.RK),i.\u0275\u0275directiveInject(B),i.\u0275\u0275directiveInject(a.yB))},I.\u0275dir=i.\u0275\u0275defineDirective({type:I,features:[i.\u0275\u0275InheritDefinitionFeature]}),I})(),T=(()=>{class I extends C{constructor(){super(...arguments),this.inputs=K}}return I.\u0275fac=function(){let w;return function(R){return(w||(w=i.\u0275\u0275getInheritedFactory(I)))(R||I)}}(),I.\u0275dir=i.\u0275\u0275defineDirective({type:I,selectors:[["","fxLayout",""],["","fxLayout.xs",""],["","fxLayout.sm",""],["","fxLayout.md",""],["","fxLayout.lg",""],["","fxLayout.xl",""],["","fxLayout.lt-sm",""],["","fxLayout.lt-md",""],["","fxLayout.lt-lg",""],["","fxLayout.lt-xl",""],["","fxLayout.gt-xs",""],["","fxLayout.gt-sm",""],["","fxLayout.gt-md",""],["","fxLayout.gt-lg",""]],inputs:{fxLayout:"fxLayout","fxLayout.xs":"fxLayout.xs","fxLayout.sm":"fxLayout.sm","fxLayout.md":"fxLayout.md","fxLayout.lg":"fxLayout.lg","fxLayout.xl":"fxLayout.xl","fxLayout.lt-sm":"fxLayout.lt-sm","fxLayout.lt-md":"fxLayout.lt-md","fxLayout.lt-lg":"fxLayout.lt-lg","fxLayout.lt-xl":"fxLayout.lt-xl","fxLayout.gt-xs":"fxLayout.gt-xs","fxLayout.gt-sm":"fxLayout.gt-sm","fxLayout.gt-md":"fxLayout.gt-md","fxLayout.gt-lg":"fxLayout.gt-lg"},features:[i.\u0275\u0275InheritDefinitionFeature]}),I})();const J=new Map,Me={"margin-left":null,"margin-right":null,"margin-top":null,"margin-bottom":null};let Ve=(()=>{class I extends a.QI{constructor(g){super(),this._styler=g}buildStyles(g,R){return g.endsWith(Se)?function ht(I,w){const[g,R]=I.split(" "),Ue=et=>`-${et}`;let Gt="0px",Dt=Ue(R||g),$e="0px";return"rtl"===w?$e=Ue(g):Gt=Ue(g),{margin:`0px ${Gt} ${Dt} ${$e}`}}(g=g.slice(0,g.indexOf(Se)),R.directionality):{}}sideEffect(g,R,ee){const Ue=ee.items;if(g.endsWith(Se)){const Gt=function at(I,w){const[g,R]=I.split(" ");let Ue="0px",Dt="0px";return"rtl"===w?Dt=g:Ue=g,{padding:`0px ${Ue} ${R||g} ${Dt}`}}(g=g.slice(0,g.indexOf(Se)),ee.directionality);this._styler.applyStyleToElements(Gt,ee.items)}else{const Gt=Ue.pop(),Dt=function yt(I,w){const g=cn(w.directionality,w.layout),R=Object.assign({},Me);return R[g]=I,R}(g,ee);this._styler.applyStyleToElements(Dt,Ue),this._styler.applyStyleToElements(Me,[Gt])}}}return I.\u0275fac=function(g){return new(g||I)(i.\u0275\u0275inject(a.RK))},I.\u0275prov=(0,i.\u0275\u0275defineInjectable)({factory:function(){return new I((0,i.\u0275\u0275inject)(a.RK))},token:I,providedIn:"root"}),I})();const Ee=["fxLayoutGap","fxLayoutGap.xs","fxLayoutGap.sm","fxLayoutGap.md","fxLayoutGap.lg","fxLayoutGap.xl","fxLayoutGap.lt-sm","fxLayoutGap.lt-md","fxLayoutGap.lt-lg","fxLayoutGap.lt-xl","fxLayoutGap.gt-xs","fxLayoutGap.gt-sm","fxLayoutGap.gt-md","fxLayoutGap.gt-lg"];let ye=(()=>{class I extends a.iR{constructor(g,R,ee,Ue,Gt,Dt){super(g,Gt,Ue,Dt),this.zone=R,this.directionality=ee,this.styleUtils=Ue,this.layout="row",this.DIRECTIVE_KEY="layout-gap",this.observerSubject=new S.xQ;const $e=[this.directionality.change,this.observerSubject.asObservable()];this.init($e),this.marshal.trackValue(this.nativeElement,"layout").pipe((0,d.R)(this.destroySubject)).subscribe(this.onLayoutChange.bind(this))}get childrenNodes(){const g=this.nativeElement.children,R=[];for(let ee=g.length;ee--;)R[ee]=g[ee];return R}ngAfterContentInit(){this.buildChildObservable(),this.triggerUpdate()}ngOnDestroy(){super.ngOnDestroy(),this.observer&&this.observer.disconnect()}onLayoutChange(g){const ee=g.value.split(" ");this.layout=ee[0],q.find(Ue=>Ue===this.layout)||(this.layout="row"),this.triggerUpdate()}updateWithValue(g){const R=this.childrenNodes.filter(ee=>1===ee.nodeType&&this.willDisplay(ee)).sort((ee,Ue)=>{const Gt=+this.styler.lookupStyle(ee,"order"),Dt=+this.styler.lookupStyle(Ue,"order");return isNaN(Gt)||isNaN(Dt)||Gt===Dt?0:Gt>Dt?1:-1});if(R.length>0){const ee=this.directionality.value,Ue=this.layout;"row"===Ue&&"rtl"===ee?this.styleCache=f:"row"===Ue&&"rtl"!==ee?this.styleCache=ve:"column"===Ue&&"rtl"===ee?this.styleCache=ke:"column"===Ue&&"rtl"!==ee&&(this.styleCache=te),this.addStyles(g,{directionality:ee,items:R,layout:Ue})}}clearStyles(){const g=Object.keys(this.mru).length>0,R=g?"padding":cn(this.directionality.value,this.layout);g&&super.clearStyles(),this.styleUtils.applyStyleToElements({[R]:""},this.childrenNodes)}willDisplay(g){const R=this.marshal.getValue(g,"show-hide");return!0===R||void 0===R&&"none"!==this.styleUtils.lookupStyle(g,"display")}buildChildObservable(){this.zone.runOutsideAngular(()=>{typeof MutationObserver<"u"&&(this.observer=new MutationObserver(g=>{g.some(ee=>ee.addedNodes&&ee.addedNodes.length>0||ee.removedNodes&&ee.removedNodes.length>0)&&this.observerSubject.next()}),this.observer.observe(this.nativeElement,{childList:!0}))})}}return I.\u0275fac=function(g){return new(g||I)(i.\u0275\u0275directiveInject(i.ElementRef),i.\u0275\u0275directiveInject(i.NgZone),i.\u0275\u0275directiveInject(m.Is),i.\u0275\u0275directiveInject(a.RK),i.\u0275\u0275directiveInject(Ve),i.\u0275\u0275directiveInject(a.yB))},I.\u0275dir=i.\u0275\u0275defineDirective({type:I,features:[i.\u0275\u0275InheritDefinitionFeature]}),I})(),be=(()=>{class I extends ye{constructor(){super(...arguments),this.inputs=Ee}}return I.\u0275fac=function(){let w;return function(R){return(w||(w=i.\u0275\u0275getInheritedFactory(I)))(R||I)}}(),I.\u0275dir=i.\u0275\u0275defineDirective({type:I,selectors:[["","fxLayoutGap",""],["","fxLayoutGap.xs",""],["","fxLayoutGap.sm",""],["","fxLayoutGap.md",""],["","fxLayoutGap.lg",""],["","fxLayoutGap.xl",""],["","fxLayoutGap.lt-sm",""],["","fxLayoutGap.lt-md",""],["","fxLayoutGap.lt-lg",""],["","fxLayoutGap.lt-xl",""],["","fxLayoutGap.gt-xs",""],["","fxLayoutGap.gt-sm",""],["","fxLayoutGap.gt-md",""],["","fxLayoutGap.gt-lg",""]],inputs:{fxLayoutGap:"fxLayoutGap","fxLayoutGap.xs":"fxLayoutGap.xs","fxLayoutGap.sm":"fxLayoutGap.sm","fxLayoutGap.md":"fxLayoutGap.md","fxLayoutGap.lg":"fxLayoutGap.lg","fxLayoutGap.xl":"fxLayoutGap.xl","fxLayoutGap.lt-sm":"fxLayoutGap.lt-sm","fxLayoutGap.lt-md":"fxLayoutGap.lt-md","fxLayoutGap.lt-lg":"fxLayoutGap.lt-lg","fxLayoutGap.lt-xl":"fxLayoutGap.lt-xl","fxLayoutGap.gt-xs":"fxLayoutGap.gt-xs","fxLayoutGap.gt-sm":"fxLayoutGap.gt-sm","fxLayoutGap.gt-md":"fxLayoutGap.gt-md","fxLayoutGap.gt-lg":"fxLayoutGap.gt-lg"},features:[i.\u0275\u0275InheritDefinitionFeature]}),I})();const f=new Map,ke=new Map,ve=new Map,te=new Map,Se=" grid";function cn(I,w){switch(w){case"column":return"margin-bottom";case"column-reverse":return"margin-top";case"row":default:return"rtl"===I?"margin-left":"margin-right";case"row-reverse":return"rtl"===I?"margin-right":"margin-left"}}function bt(I,...w){if(null==I)throw TypeError("Cannot convert undefined or null to object");for(let g of w)if(null!=g)for(let R in g)g.hasOwnProperty(R)&&(I[R]=g[R]);return I}let je=(()=>{class I extends a.QI{constructor(g){super(),this.layoutConfig=g}buildStyles(g,R){let[ee,Ue,...Gt]=g.split(" "),Dt=Gt.join(" ");const $e=R.direction.indexOf("column")>-1?"column":"row",et=A($e)?"max-width":"max-height",He=A($e)?"min-width":"min-height",jt=String(Dt).indexOf("calc")>-1,fn=jt||"auto"===Dt,wn=String(Dt).indexOf("%")>-1&&!jt,Hn=String(Dt).indexOf("px")>-1||String(Dt).indexOf("rem")>-1||String(Dt).indexOf("em")>-1||String(Dt).indexOf("vw")>-1||String(Dt).indexOf("vh")>-1;let Rn=jt||Hn;ee="0"==ee?0:ee,Ue="0"==Ue?0:Ue;const Nn=!ee&&!Ue;let zn={};const An={"max-width":null,"max-height":null,"min-width":null,"min-height":null};switch(Dt||""){case"":const ni=!1!==this.layoutConfig.useColumnBasisZero;Dt="row"===$e?"0%":ni?"0.000000001px":"auto";break;case"initial":case"nogrow":ee=0,Dt="auto";break;case"grow":Dt="100%";break;case"noshrink":Ue=0,Dt="auto";break;case"auto":break;case"none":ee=0,Ue=0,Dt="auto";break;default:!Rn&&!wn&&!isNaN(Dt)&&(Dt+="%"),"0%"===Dt&&(Rn=!0),"0px"===Dt&&(Dt="0%"),zn=bt(An,jt?{"flex-grow":ee,"flex-shrink":Ue,"flex-basis":Rn?Dt:"100%"}:{flex:`${ee} ${Ue} ${Rn?Dt:"100%"}`})}return zn.flex||zn["flex-grow"]||(zn=bt(An,jt?{"flex-grow":ee,"flex-shrink":Ue,"flex-basis":Dt}:{flex:`${ee} ${Ue} ${Dt}`})),"0%"!==Dt&&"0px"!==Dt&&"0.000000001px"!==Dt&&"auto"!==Dt&&(zn[He]=Nn||Rn&&ee?Dt:null,zn[et]=Nn||!fn&&Ue?Dt:null),zn[He]||zn[et]?R.hasWrap&&(zn[jt?"flex-basis":"flex"]=zn[et]?jt?zn[et]:`${ee} ${Ue} ${zn[et]}`:jt?zn[He]:`${ee} ${Ue} ${zn[He]}`):zn=bt(An,jt?{"flex-grow":ee,"flex-shrink":Ue,"flex-basis":Dt}:{flex:`${ee} ${Ue} ${Dt}`}),bt(zn,{"box-sizing":"border-box"})}}return I.\u0275fac=function(g){return new(g||I)(i.\u0275\u0275inject(a.WU))},I.\u0275prov=(0,i.\u0275\u0275defineInjectable)({factory:function(){return new I((0,i.\u0275\u0275inject)(a.WU))},token:I,providedIn:"root"}),I})();const ue=["fxFlex","fxFlex.xs","fxFlex.sm","fxFlex.md","fxFlex.lg","fxFlex.xl","fxFlex.lt-sm","fxFlex.lt-md","fxFlex.lt-lg","fxFlex.lt-xl","fxFlex.gt-xs","fxFlex.gt-sm","fxFlex.gt-md","fxFlex.gt-lg"];let Z=(()=>{class I extends a.iR{constructor(g,R,ee,Ue,Gt){super(g,Ue,R,Gt),this.layoutConfig=ee,this.marshal=Gt,this.DIRECTIVE_KEY="flex",this.direction=void 0,this.wrap=void 0,this.flexGrow="1",this.flexShrink="1",this.init()}get shrink(){return this.flexShrink}set shrink(g){this.flexShrink=g||"1",this.triggerReflow()}get grow(){return this.flexGrow}set grow(g){this.flexGrow=g||"1",this.triggerReflow()}ngOnInit(){this.parentElement&&(this.marshal.trackValue(this.parentElement,"layout").pipe((0,d.R)(this.destroySubject)).subscribe(this.onLayoutChange.bind(this)),this.marshal.trackValue(this.nativeElement,"layout-align").pipe((0,d.R)(this.destroySubject)).subscribe(this.triggerReflow.bind(this)))}onLayoutChange(g){const ee=g.value.split(" ");this.direction=ee[0],this.wrap=void 0!==ee[1]&&"wrap"===ee[1],this.triggerUpdate()}updateWithValue(g){void 0===this.direction&&(this.direction=this.getFlexFlowDirection(this.parentElement,!1!==this.layoutConfig.addFlexToParent)),void 0===this.wrap&&(this.wrap=this.hasWrap(this.parentElement));const ee=this.direction,Ue=ee.startsWith("row"),Gt=this.wrap;Ue&&Gt?this.styleCache=Ye:Ue&&!Gt?this.styleCache=oe:!Ue&&Gt?this.styleCache=Le:!Ue&&!Gt&&(this.styleCache=xe);const Dt=String(g).replace(";",""),$e=(0,a.Ot)(Dt,this.flexGrow,this.flexShrink);this.addStyles($e.join(" "),{direction:ee,hasWrap:Gt})}triggerReflow(){const g=this.activatedValue;if(void 0!==g){const R=(0,a.Ot)(g+"",this.flexGrow,this.flexShrink);this.marshal.updateElement(this.nativeElement,this.DIRECTIVE_KEY,R.join(" "))}}}return I.\u0275fac=function(g){return new(g||I)(i.\u0275\u0275directiveInject(i.ElementRef),i.\u0275\u0275directiveInject(a.RK),i.\u0275\u0275directiveInject(a.WU),i.\u0275\u0275directiveInject(je),i.\u0275\u0275directiveInject(a.yB))},I.\u0275dir=i.\u0275\u0275defineDirective({type:I,inputs:{shrink:["fxShrink","shrink"],grow:["fxGrow","grow"]},features:[i.\u0275\u0275InheritDefinitionFeature]}),I})(),F=(()=>{class I extends Z{constructor(){super(...arguments),this.inputs=ue}}return I.\u0275fac=function(){let w;return function(R){return(w||(w=i.\u0275\u0275getInheritedFactory(I)))(R||I)}}(),I.\u0275dir=i.\u0275\u0275defineDirective({type:I,selectors:[["","fxFlex",""],["","fxFlex.xs",""],["","fxFlex.sm",""],["","fxFlex.md",""],["","fxFlex.lg",""],["","fxFlex.xl",""],["","fxFlex.lt-sm",""],["","fxFlex.lt-md",""],["","fxFlex.lt-lg",""],["","fxFlex.lt-xl",""],["","fxFlex.gt-xs",""],["","fxFlex.gt-sm",""],["","fxFlex.gt-md",""],["","fxFlex.gt-lg",""]],inputs:{fxFlex:"fxFlex","fxFlex.xs":"fxFlex.xs","fxFlex.sm":"fxFlex.sm","fxFlex.md":"fxFlex.md","fxFlex.lg":"fxFlex.lg","fxFlex.xl":"fxFlex.xl","fxFlex.lt-sm":"fxFlex.lt-sm","fxFlex.lt-md":"fxFlex.lt-md","fxFlex.lt-lg":"fxFlex.lt-lg","fxFlex.lt-xl":"fxFlex.lt-xl","fxFlex.gt-xs":"fxFlex.gt-xs","fxFlex.gt-sm":"fxFlex.gt-sm","fxFlex.gt-md":"fxFlex.gt-md","fxFlex.gt-lg":"fxFlex.gt-lg"},features:[i.\u0275\u0275InheritDefinitionFeature]}),I})();const oe=new Map,xe=new Map,Ye=new Map,Le=new Map;let Yt=(()=>{class I extends a.QI{buildStyles(g,R){const ee={},[Ue,Gt]=g.split(" ");switch(Ue){case"center":ee["justify-content"]="center";break;case"space-around":ee["justify-content"]="space-around";break;case"space-between":ee["justify-content"]="space-between";break;case"space-evenly":ee["justify-content"]="space-evenly";break;case"end":case"flex-end":ee["justify-content"]="flex-end";break;default:ee["justify-content"]="flex-start"}switch(Gt){case"start":case"flex-start":ee["align-items"]=ee["align-content"]="flex-start";break;case"center":ee["align-items"]=ee["align-content"]="center";break;case"end":case"flex-end":ee["align-items"]=ee["align-content"]="flex-end";break;case"space-between":ee["align-content"]="space-between",ee["align-items"]="stretch";break;case"space-around":ee["align-content"]="space-around",ee["align-items"]="stretch";break;case"baseline":ee["align-content"]="stretch",ee["align-items"]="baseline";break;default:ee["align-items"]=ee["align-content"]="stretch"}return bt(ee,{display:R.inline?"inline-flex":"flex","flex-direction":R.layout,"box-sizing":"border-box","max-width":"stretch"===Gt?A(R.layout)?null:"100%":null,"max-height":"stretch"===Gt&&A(R.layout)?"100%":null})}}return I.\u0275fac=function(){let w;return function(R){return(w||(w=i.\u0275\u0275getInheritedFactory(I)))(R||I)}}(),I.\u0275prov=(0,i.\u0275\u0275defineInjectable)({factory:function(){return new I},token:I,providedIn:"root"}),I})();const Lt=["fxLayoutAlign","fxLayoutAlign.xs","fxLayoutAlign.sm","fxLayoutAlign.md","fxLayoutAlign.lg","fxLayoutAlign.xl","fxLayoutAlign.lt-sm","fxLayoutAlign.lt-md","fxLayoutAlign.lt-lg","fxLayoutAlign.lt-xl","fxLayoutAlign.gt-xs","fxLayoutAlign.gt-sm","fxLayoutAlign.gt-md","fxLayoutAlign.gt-lg"];let qe=(()=>{class I extends a.iR{constructor(g,R,ee,Ue){super(g,ee,R,Ue),this.DIRECTIVE_KEY="layout-align",this.layout="row",this.inline=!1,this.init(),this.marshal.trackValue(this.nativeElement,"layout").pipe((0,d.R)(this.destroySubject)).subscribe(this.onLayoutChange.bind(this))}updateWithValue(g){const R=this.layout||"row",ee=this.inline;"row"===R&&ee?this.styleCache=kt:"row"!==R||ee?"row-reverse"===R&&ee?this.styleCache=an:"row-reverse"!==R||ee?"column"===R&&ee?this.styleCache=Ct:"column"!==R||ee?"column-reverse"===R&&ee?this.styleCache=yn:"column-reverse"===R&&!ee&&(this.styleCache=nt):this.styleCache=ct:this.styleCache=mt:this.styleCache=it,this.addStyles(g,{layout:R,inline:ee})}onLayoutChange(g){const R=g.value.split(" ");this.layout=R[0],this.inline=g.value.includes("inline"),q.find(ee=>ee===this.layout)||(this.layout="row"),this.triggerUpdate()}}return I.\u0275fac=function(g){return new(g||I)(i.\u0275\u0275directiveInject(i.ElementRef),i.\u0275\u0275directiveInject(a.RK),i.\u0275\u0275directiveInject(Yt),i.\u0275\u0275directiveInject(a.yB))},I.\u0275dir=i.\u0275\u0275defineDirective({type:I,features:[i.\u0275\u0275InheritDefinitionFeature]}),I})(),vt=(()=>{class I extends qe{constructor(){super(...arguments),this.inputs=Lt}}return I.\u0275fac=function(){let w;return function(R){return(w||(w=i.\u0275\u0275getInheritedFactory(I)))(R||I)}}(),I.\u0275dir=i.\u0275\u0275defineDirective({type:I,selectors:[["","fxLayoutAlign",""],["","fxLayoutAlign.xs",""],["","fxLayoutAlign.sm",""],["","fxLayoutAlign.md",""],["","fxLayoutAlign.lg",""],["","fxLayoutAlign.xl",""],["","fxLayoutAlign.lt-sm",""],["","fxLayoutAlign.lt-md",""],["","fxLayoutAlign.lt-lg",""],["","fxLayoutAlign.lt-xl",""],["","fxLayoutAlign.gt-xs",""],["","fxLayoutAlign.gt-sm",""],["","fxLayoutAlign.gt-md",""],["","fxLayoutAlign.gt-lg",""]],inputs:{fxLayoutAlign:"fxLayoutAlign","fxLayoutAlign.xs":"fxLayoutAlign.xs","fxLayoutAlign.sm":"fxLayoutAlign.sm","fxLayoutAlign.md":"fxLayoutAlign.md","fxLayoutAlign.lg":"fxLayoutAlign.lg","fxLayoutAlign.xl":"fxLayoutAlign.xl","fxLayoutAlign.lt-sm":"fxLayoutAlign.lt-sm","fxLayoutAlign.lt-md":"fxLayoutAlign.lt-md","fxLayoutAlign.lt-lg":"fxLayoutAlign.lt-lg","fxLayoutAlign.lt-xl":"fxLayoutAlign.lt-xl","fxLayoutAlign.gt-xs":"fxLayoutAlign.gt-xs","fxLayoutAlign.gt-sm":"fxLayoutAlign.gt-sm","fxLayoutAlign.gt-md":"fxLayoutAlign.gt-md","fxLayoutAlign.gt-lg":"fxLayoutAlign.gt-lg"},features:[i.\u0275\u0275InheritDefinitionFeature]}),I})();const it=new Map,ct=new Map,mt=new Map,nt=new Map,kt=new Map,Ct=new Map,an=new Map,yn=new Map;let ae=(()=>{class I{}return I.\u0275fac=function(g){return new(g||I)},I.\u0275mod=i.\u0275\u0275defineNgModule({type:I}),I.\u0275inj=i.\u0275\u0275defineInjector({imports:[a.IR,m.vT]}),I})()},74970:(on,ot,l)=>{"use strict";l.d(ot,{s:()=>m});var i=l(94650);const a=[{state:"candidates",name:"Admissions",type:"sub",icon:"candidates",permissions:"candidate.show_perm",children:[{state:"candidates",name:"NAV.Follow up FI",icon:"candidates",permissions:"candidate.show_perm"},{state:"candidates-fc",name:"NAV.Follow up FC",icon:"candidates",permissions:"candidate.follow_up_continuous.show_perm"},{state:"contract-follow-up",name:"Follow up Contract/Convention",icon:"candidates",permissions:"candidate.follow_up_contract.show_perm"},{state:"oscar-campus",name:"NAV.CRM Oscar Campus",icon:"account-settings",permissions:"candidate.oscar_campus.show_perm"},{state:"hubspot",name:"NAV.CRM Hubspot",icon:"account-settings",permissions:"candidate.hubspot.show_perm"},{state:"dashboard-register",name:"NAV.DASHBOARDS.General",icon:"dashboard",permissions:"candidate.candidate_dashboard.show_perm"}]},{state:"assignment",name:"NAV.Re-Admission",type:"sub",icon:"readmission",permissions:"readmission.show_perm",children:[{state:"assignment",name:"NAV.Assignment",icon:"pencil-ruler",permissions:"readmission.assignment.show_perm"},{state:"follow-up",name:"NAV.Follow up",icon:"candidates",permissions:"readmission.follow_up.show_perm"}]},{state:"students-table",name:"NAV.Students",type:"sub",icon:"school",permissions:"students.show_perm",children:[{state:"students-table",name:"NAV.STUDENT.Registered",icon:"account-arrow-right",permissions:"students.follow_up.show_perm"},{state:"all-students",name:"NAV.STUDENT.All students",icon:"groups",permissions:"students.all_students.show_perm"},{state:"students-trombinoscope",name:"NAV.STUDENT.Trombinoscope",icon:"account-box",permissions:"students.trombinoscope.show_perm"}]},{state:"finance-follow-up",name:"Finance",type:"sub",icon:"euro",permissions:"finance.show_perm",children:[{state:"finance-follow-up",name:"NAV.FINANCE.Follow Up",icon:"euro",permissions:"finance.follow_up.show_perm"},{state:"finance-follow-up-organization",name:"NAV.FINANCE.Follow Up Organization",icon:"euro",permissions:"finance.follow_up_organization.show_perm"},{state:"operation-lines",name:"NAV.FINANCE.Operations Lines",icon:"operation-lines",permissions:"finance.operation_lines.show_perm"},{state:"unbalanced-balance",name:"NAV.FINANCE.Unbalanced Balance",icon:"unbalanced-balance",permissions:"finance.unbalanced_balance.show_perm"},{state:"finance-import",name:"NAV.FINANCE.Reconciliation and Lettrage",icon:"export",permissions:"finance.reconciliation_letterage.show_perm"},{state:"cheque-transaction",name:"NAV.FINANCE.Check",icon:"euro",permissions:"finance.cheque.show_perm"},{state:"timeline-template",name:"NAV.FINANCE.Timeline template",icon:"event_busy",permissions:"finance.timeline_template.show_perm"},{state:"transaction-report",name:"NAV.Transaction",icon:"euro",permissions:"finance.transaction_report.show_perm"},{state:"master-transaction",name:"NAV.Master Transaction",icon:"euro",permissions:"finance.master_table_transaction.show_perm"},{state:"balance-report",name:"NAV.Balance Report",icon:"euro",permissions:"finance.balance_report.show_perm"}]},{state:"teacher-management",name:"NAV.Teacher Management",type:"sub",icon:"teacher-management",permissions:"teacher_management.show_perm",children:[{state:"teacher-management/follow-up",name:"NAV.Follow up",icon:"teacher-management",permissions:"teacher_management.teacher_follow_up.show_perm"},{state:"teacher-management/teachers",name:"NAV.Teachers",icon:"teacher-management",permissions:"teacher_management.teachers_table.show_perm"},{state:"teacher-contract/contract-management",name:"NAV.TEACHER_CONTRACT.CONTRACT_MANAGEMENT",icon:"text-box-check",permissions:"teacher_management.contract_process.show_perm"}]},{state:"my-internships",name:"My Internships",type:"link",icon:"my-internships",permissions:"my_internship.show_perm"},{state:"alumni-follow-up",name:"Alumni",type:"sub",icon:"group",permissions:"alumni.show_perm",children:[{state:"alumni-follow-up",name:"NAV.alumni-follow-up",icon:"group",permissions:"alumni.follow_up.show_perm"},{state:"alumni-cards",name:"NAV.alumni-cards",icon:"group",permissions:"alumni.card.show_perm"}]},{state:"rncpTitles",name:"NAV.RNCP_TITLES",type:"link",icon:"import_contacts",permissions:"rncp_title.show_perm"},{state:"school-group",name:"NAV.RNCP_TITLES",type:"link",icon:"import_contacts",permissions:"chief_group_school.show_perm"},{state:"my-file",name:"NAV.myFile",type:"link",icon:"library",permissions:"my_file.show_perm"},{state:"academic-journeys",name:"NAV.Academic Journeys",type:"sub",icon:"AcademicJourneys",permissions:"academic_journeys.show_perm",children:[{state:"academic-journeys/summary",name:"NAV.Summary",icon:"AcademicJourneys",permissions:"academic_journeys.show_perm"},{state:"academic-journeys/my-profile",name:"NAV.My Profile",icon:"my_profile",permissions:"academic_journeys.show_perm"},{state:"academic-journeys/my-diploma",name:"NAV.My Diploma",icon:"my_diploma",permissions:"academic_journeys.show_perm"},{state:"academic-journeys/my-experience",name:"NAV.My Experience",icon:"my_experience",permissions:"academic_journeys.show_perm"},{state:"academic-journeys/my-skill",name:"NAV.My Skill",icon:"my_skill",permissions:"academic_journeys.show_perm"},{state:"academic-journeys/my-language",name:"NAV.My Language",icon:"my_language",permissions:"academic_journeys.show_perm"},{state:"academic-journeys/my-interest",name:"NAV.My Interest",icon:"my_interest",permissions:"academic_journeys.show_perm"}]},{state:"school",name:"NAV.SCHOOLS",type:"sub",icon:"account_balance",permissions:"schools.group_of_schools.show_perm",children:[{state:"school",name:"NAV.List of School",icon:"account_balance",permissions:"schools.list_of_schools.show_perm"},{state:"group-of-schools",name:"NAV.Group of School",icon:"account_balance",permissions:"schools.group_of_schools.show_perm"}]},{state:"school-detail",name:"NAV.SCHOOLS",type:"link",icon:"account_balance",permissions:"schools.list_of_schools.show_perm"},{state:"students",name:"NAV.STUDENTS",type:"sub",icon:"school",permissions:"students.active_students.show_perm",children:[{state:"students",name:"NAV.Active Student",icon:"school",permissions:"students.active_students.show_perm"},{state:"completed-students",name:"NAV.Completed Student",icon:"school",permissions:"students.completed_students.show_perm"},{state:"deactivated-students",name:"NAV.Deactivated Student",icon:"school",permissions:"students.deactivated_students.show_perm"},{state:"suspended-students",name:"NAV.Suspended Student",icon:"school",permissions:"students.suspended_students.show_perm"}]},{state:"students-card",name:"NAV.STUDENTS",type:"link",icon:"school",permissions:"company_student.show_perm"},{state:"students",name:"NAV.STUDENTS",type:"link",icon:"school",permissions:"students.student_detail.show_perm"},{state:"companies",name:"NAV.COMPANIES",type:"sub",icon:"business",permissions:"companies.show_perm",children:[{state:"companies/entities",name:"NAV.Companies Entity",icon:"companies",permissions:"companies.company_entity.show_perm"},{state:"companies/branches",name:"NAV.Companies Branches",icon:"companies",permissions:"companies.company_branch.show_perm"},{state:"organization",name:"NAV.Organization",icon:"database-marker-outline",permissions:"companies.organization.show_perm"}]},{state:"form-follow-up",name:"NAV.Form Follow Up",icon:"content_paste_search",type:"sub",permissions:"form_follow_up.show_perm",children:[{state:"form-follow-up/general-form-follow-up",name:"NAV.General Form Follow Up",icon:"content_paste_search",permissions:"form_follow_up.general_form_follow_up.show_perm"}]},{state:"task",name:"NAV.MYTASKS",type:"link",icon:"task",permissions:"tasks.show_perm"},{state:"404",name:"NAV.Registration form",type:"link",icon:"key-variant",permissions:"candidate_registration_form.show_perm"},{state:"mailbox",name:"NAV.MAILBOX",type:"link",icon:"mail",permissions:"mailbox.show_perm"},{state:"parameters",name:"NAV.PARAMETERS.NAME",type:"sub",icon:"settings",permissions:"parameters.rncp_title_management.show_perm",children:[{state:"platform",name:"NAV.PARAMETERS.PLATFORM",icon:"tune",permissions:"parameters.platform.show_perm"},{state:"title-rncp",name:"NAV.TITLE_MANAGEMENT",icon:"titles",permissions:"parameters.rncp_title_management.show_perm"}]},{state:"export",name:"NAV.EXPORT.NAME",type:"sub",icon:"export",permissions:"export.show_perm",children:[{state:"groups",name:"NAV.EXPORT.GROUPS",icon:"groups",permissions:"export.groups.show_perm"},{state:"status-update",name:"NAV.EXPORT.STATUS_UPDATE",icon:"assignment_turned_in",permissions:"export.status_update.show_perm"}]},{state:"history",name:"NAV.HISTORY.NAME",type:"sub",icon:"format_list_bulleted",permissions:"history.show_perm",children:[{state:"notifications",name:"NAV.HISTORY.NOTIFICATIONS",icon:"notifications",permissions:"history.notifications.show_perm"}]},{state:"messages",name:"NAV.MESSAGES.NAME",type:"sub",icon:"send",permissions:"messages.show_perm",children:[{state:"urgent-message",name:"NAV.MESSAGES.URGENT_MESSAGE",icon:"flash_on",permissions:"messages.urgent_message.show_perm"},{state:"group-mailing",name:"NAV.MESSAGES.GROUP_MAILING",icon:"send",permissions:"messages.group_mailing.show_perm"},{state:"alert-functionality",name:"NAV.MESSAGES.FUNCTIONALITY_ALERT",icon:"functionality-alert",permissions:"messages.alert_func.show_perm"}]},{state:"certification",name:"NAV.CERTIFICATION.NAME",type:"sub",icon:"certification",permissions:"certifications.show_perm",children:[{state:"jury-organization",name:"NAV.CERTIFICATION.JURY_ORGANIZATION",icon:"jury-organization",permissions:"certifications.jury_organization.show_perm"},{state:"global-jury-organization/all-jury-schedule",name:"NAV.CERTIFICATION.ALL_JURY_SCHEDULE",icon:"calender-acount",permissions:"certifications.jury_schedule.show_perm"},{state:"final-retake",name:"NAV.CERTIFICATION.FINAL_RETAKE",icon:"cached",permissions:"certifications.final_retake.show_perm"},{state:"certidegree",name:"NAV.CERTIFICATION.CERTIDEGREE",icon:"certidegree",permissions:"certifications.certidegree.show_perm"},{state:"transcript-process",name:"NAV.CERTIFICATION.TRANSCRIPT_PROCESS",icon:"final-transcript",permissions:"certifications.final_transcript.show_perm"},{state:"transcript-builder",name:"NAV.TRANSCRIPT-BUILDER",icon:"tutorial",permissions:"transcript_builder.show_perm"},{state:"test-status",name:"NAV.CERTIFICATION.TEST_STATUS",icon:"final-transcript",permissions:"certifications.test_status.show_perm"}]},{state:"template-sequences",name:"course_sequence.Courses & Sequences",type:"sub",icon:"login",permissions:"courses_sequences.show_perm",children:[{state:"template-sequences",name:"course_sequence.Template",icon:"pencil-ruler",permissions:"courses_sequences.template.show_perm"},{state:"sequences",name:"course_sequence.Sequences",icon:"clipboard-list-outline",permissions:"courses_sequences.sequence.show_perm"},{state:"modules",name:"course_sequence.Modules",icon:"clipboard-list-outline",permissions:"courses_sequences.module.show_perm"},{state:"subjects",name:"course_sequence.Subjects",icon:"clipboard-list-outline",permissions:"courses_sequences.subject.show_perm"}]},{state:"users",name:"NAV.USERS",type:"link",icon:"person",permissions:"users.show_perm"},{state:"schools",name:"NAV.INTAKE_CHANNEL.Intake channel",type:"sub",icon:"login",permissions:"intake_channel.show_perm",children:[{state:"scholar-season",name:"NAV.INTAKE_CHANNEL.Scholar season",icon:"scholar-season",permissions:"intake_channel.scholar_season.show_perm"},{state:"schools",name:"NAV.INTAKE_CHANNEL.Schools",icon:"account_balance",permissions:"intake_channel.school.show_perm"},{state:"campus",name:"NAV.INTAKE_CHANNEL.Campus",icon:"campus",permissions:"intake_channel.campus.show_perm"},{state:"level",name:"NAV.INTAKE_CHANNEL.Level",icon:"level",permissions:"intake_channel.level.show_perm"},{state:"sector",name:"NAV.INTAKE_CHANNEL.Sector",icon:"sector",permissions:"intake_channel.sector.show_perm"},{state:"speciality",name:"NAV.INTAKE_CHANNEL.Speciality",icon:"speciality",permissions:"intake_channel.speciality.show_perm"},{state:"site",name:"NAV.INTAKE_CHANNEL.Sites",icon:"location_on",permissions:"intake_channel.site.show_perm"},{state:"settings",name:"NAV.INTAKE_CHANNEL.Settings",icon:"settings",permissions:"intake_channel.setting.show_perm"}]},{state:"import-register",name:"NAV.SETTINGS.Settings",type:"sub",icon:"settings",permissions:"setting.show_perm",children:[{state:"import-register",name:"NAV.SETTINGS.Import of Registration Objectives",icon:"export",permissions:"setting.import_objective.show_perm"},{state:"import-finance",name:"NAV.SETTINGS.Import of financial objectives",icon:"export",permissions:"setting.import_objective_finance.show_perm"},{state:"import-previous-finance",name:"NAV.SETTINGS.Import of financial N - 1",icon:"export",permissions:"setting.import_finance_n1.show_perm"},{state:"promo-external",name:"NAV.SETTINGS.External promotions",icon:"promo-external",permissions:"setting.external_promotion.show_perm"},{state:"step-validation-message",name:"NAV.SETTINGS.Messages Steps",icon:"step-validation",permissions:"setting.message_step.show_perm"},{state:"notification-management",name:"NAV.PROCESS.NOTIFICATION_MANAGEMENT",icon:"clipboard-flow",permissions:"setting.notification_management.show_perm"},{state:"user-permission",name:"NAV.SETTINGS.USER_PERMISSION",icon:"settings",permissions:"setting.user_permission.show_perm"},{state:"country-nationality",name:"NAV.SETTINGS.COUNTRY_NATIONALITY",icon:"flag"}]},{state:"process",name:"NAV.PROCESS.NAME",type:"sub",icon:"process",permissions:"process.show_perm",children:[{state:"form-builder",name:"NAV.PROCESS.FORM_BUILDER",icon:"pencil-ruler",permissions:"process.form_builder.show_perm"},{state:"document-builder",name:"Documents",icon:"Doc-builder",permissions:"process.document.show_perm"}]},{state:"transcript-builder",name:"NAV.TRANSCRIPT-BUILDER",type:"link",icon:"tutorial",permissions:"transcript_builder.show_perm"},{state:"previous-course",name:"NAV.Previous Course",type:"link",icon:"PreviousCourse",permissions:"previous_course.show_perm"},{state:"ideas",name:"NAV.IDEAS",type:"link",icon:"ideas",permissions:"ideas.show_perm"},{state:"tutorial-app",name:"InApp Tutorials",type:"link",icon:"tutorial",permissions:"candidate_dashboard.show_perm"},{state:"tutorial",name:"NAV.TUTORIALS",type:"link",icon:"tutorial",permissions:"tutorials.tutorial_table"},{state:"tutorial-app",name:"InApp Tutorials",type:"link",icon:"tutorial",permissions:"tutorials.inapp_tutorials.show_perm"},{state:"promo",name:"Promo",type:"link",icon:"horizontal_split",permissions:"promos.show_perm"},{state:"news",name:"NAV.News",type:"sub",icon:"script-text-outline",permissions:"",children:[{state:"",name:"NAV.All News",icon:"clipboard-text-outline",permissions:""},{state:"manage-news",name:"NAV.Manage News",icon:"hammer-wrench",permissions:""}]}];let m=(()=>{class S{getAll(){return a}add(N){a.push(N)}}return S.\u0275fac=function(N){return new(N||S)},S.\u0275prov=i.\u0275\u0275defineInjectable({token:S,factory:S.\u0275fac}),S})()},83113:(on,ot,l)=>{"use strict";l.d(ot,{H:()=>a});var i=l(94650);let a=(()=>{class m{}return m.\u0275fac=function(d){return new(d||m)},m.\u0275mod=i.\u0275\u0275defineNgModule({type:m}),m.\u0275inj=i.\u0275\u0275defineInjector({}),m})()},67154:(on,ot,l)=>{"use strict";l.d(ot,{Z:()=>m});var i=l(591),a=l(94650);let m=(()=>{class S{constructor(){this.title=new i.X(null),this.message=new i.X(null),this.messageFinance=new i.X(null),this.icon=new i.X(null)}setTitle(N){this.title.next(N)}setIcon(N){this.icon.next(N)}setMessage(N){this.message.next(N)}setMessageFinance(N){this.messageFinance.next(N)}}return S.\u0275fac=function(N){return new(N||S)},S.\u0275prov=a.\u0275\u0275defineInjectable({token:S,factory:S.\u0275fac}),S})()},2586:(on,ot,l)=>{"use strict";l.d(ot,{g:()=>d,h:()=>S});var i=l(36895),a=l(3238),m=l(94650);const S={parse:{dateInput:{month:"short",year:"numeric",day:"numeric"}},display:{dateInput:"customInput",monthYearLabel:{year:"numeric",month:"short"},dateA11yLabel:{year:"numeric",month:"long",day:"numeric"},monthYearA11yLabel:{year:"numeric",month:"long"}}};let d=(()=>{class N extends a.LF{parse(b){if("string"==typeof b&&b.indexOf(".")>-1){const A=b.split(".");return A.length<2||isNaN(+A[0])||isNaN(+A[1])||isNaN(+A[2])?null:new Date(Number(A[2]),Number(A[1])-1,Number(A[0]))}const P="number"==typeof b?b:Date.parse(b);return isNaN(P)?null:new Date(P)}format(b,P){return"customInput"===P?new i.uU(this.locale).transform(b,"shortDate"):new i.uU(this.locale).transform(b,"MMM yyyy")}}return N.\u0275fac=function(){let q;return function(P){return(q||(q=m.\u0275\u0275getInheritedFactory(N)))(P||N)}}(),N.\u0275prov=m.\u0275\u0275defineInjectable({token:N,factory:N.\u0275fac}),N})()},52688:(on,ot,l)=>{"use strict";l.d(ot,{e:()=>T});var i=l(49671),a=l(591),m=l(13125),S=l(24850),d=l(92340),N=l(7206),b=l(35226),P=l.n(b),A=l(68745),$=l(94650),r=l(610),B=l(18497),K=l(44758),x=l(89383),C=l(80529);let T=(()=>{class J{constructor(Ve,Ee,we,ye,be,f){this.router=Ve,this.apollo=Ee,this.permissionService=we,this.translate=ye,this.ngZone=be,this.httpClient=f,this.isLoggedIn=!1,this.subs=new A.Y,this.isConnectAsUserSource=new a.X(!1),this.isConnectAsUser$=this.isConnectAsUserSource.asObservable()}getLocalStorageUser(){return this.userData=JSON.parse(localStorage.getItem("userProfile")),this.isLoggedIn=!!this.userData,this.isLoginAsOther()?this.isConnectAsUserSource.next(!0):this.isConnectAsUserSource.next(!1),this.userData}getCurrentUser(){return this.userData}handlerSessionExpired(){this.logOut()}loginUser(Ve,Ee){return this.apollo.mutate({mutation:m.ZP`
          mutation Login($email: String, $password: String) {
            Login(email: $email, password: $password) {
              token
              user {
                _id
                civility
                first_name
                last_name
                email
                student_id {
                  _id
                }
                position
                office_phone
                direct_line
                portable_phone
                profile_picture
                homepage_configuration_id {
                  _id
                }
                entities {
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
                  programs {
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
                  }
                  entity_name
                  school_type
                  group_of_schools {
                    _id
                    short_name
                  }
                  group_of_school {
                    _id
                    headquarter {
                      _id
                      short_name
                    }
                    school_members {
                      _id
                      short_name
                    }
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
                          actions {
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
                          actions {
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
                          actions {
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
                          actions {
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
                          actions {
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
                            actions {
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
                          legal {
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
                          admission {
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
                          course_sequence {
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
                          type_of_formation {
                            actions {
                              btn_reset
                              btn_export_csv
                              btn_add_type_of_formation
                              btn_edit_type_of_formation
                              btn_delete_type_of_formation
                            }
                          }
                          payment_mode {
                            actions {
                              btn_reset
                              btn_export_csv
                              btn_add_payment_mode
                              btn_edit_payment_mode
                              btn_delete_payment_mode
                            }
                          }
                          registration_profile {
                            actions {
                              btn_reset
                              btn_add_registration_profile
                              btn_edit
                              btn_delete
                              btn_add_export
                            }
                          }
                          legal_entities {
                            actions {
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
                        timeline_template {
                          show_perm
                          create_timeline_template {
                            show_perm
                          }
                          edit_timeline_template {
                            show_perm
                          }
                          delete_timeline_template {
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
                          actions {
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
                        template {
                          create_perm
                          edit_perm
                          show_perm
                          export_perm
                          actions {
                            btn_reset
                            btn_delete
                            btn_duplicate
                          }
                        }
                        sequence {
                          create_perm
                          edit_perm
                          show_perm
                          export_perm
                          actions {
                            btn_reset
                            btn_delete
                            btn_duplicate
                          }
                        }
                        module {
                          create_perm
                          edit_perm
                          show_perm
                          export_perm
                          actions {
                            btn_reset
                            btn_delete
                            btn_template_import
                            btn_import_module
                          }
                        }
                        subject {
                          create_perm
                          edit_perm
                          show_perm
                          export_perm
                          actions {
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
                        contract_process {
                          show_perm
                          actions {
                            btn_add_type_of_intervention
                            btn_export
                            btn_edit
                            btn_delete
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
                    }
                  }
                }
              }
            }
          }
        `,variables:{email:Ve,password:Ee}}).pipe((0,S.U)(we=>we))}resetPasswordV2(Ve){const Ee=m.ZP`
      mutation RequestForgotPassword{
        RequestForgotPassword(lang: "${Ve.lang}", email: "${Ve.email}") {
          message
		      school
        }
      }
    `;return this.apollo.mutate({mutation:Ee,errorPolicy:"all"}).pipe((0,S.U)(we=>we))}logOut(){this.removeLocalUserProfile(),localStorage.removeItem("version"),this.router.navigate(["/session/login"]),this.isConnectAsUserSource.next(!1)}setLocalUserProfileAndToken(Ve){localStorage.setItem("userProfile",JSON.stringify(Ve.user)),localStorage.setItem(d.N.tokenKey,JSON.stringify(Ve.token)),this.permissionService.resetServiceData(),this.isLoggedIn=!0}backupLocalUserProfileAndToken(){const Ve=JSON.parse(localStorage.getItem("userProfile")),Ee=JSON.parse(localStorage.getItem("templateTable")),we=JSON.parse(localStorage.getItem("admtc-token-encryption"));localStorage.removeItem("templateTable"),localStorage.setItem("backupUser",JSON.stringify(Ve)),localStorage.setItem("backupToken",JSON.stringify(we)),localStorage.setItem("backupTemplateTable",JSON.stringify(Ee)),this.isConnectAsUserSource.next(!0)}connectAsStudent(Ve,Ee,we){const be=window.btoa(we||"connect"),f=window.btoa(JSON.stringify({token:Ve?.token,user:{civility:Ve?.user?.civility,direct_line:Ve?.user?.direct_line,email:Ve?.user?.email,entities:Ve?.user?.entities.map(ve=>({type:{_id:ve?.type?._id}})),first_name:Ve?.user?.first_name,last_name:Ve?.user?.last_name,office_phone:Ve?.user?.office_phone,portable_phone:Ve?.user?.portable_phone,position:Ve?.user?.position,profile_picture:Ve?.user?.profile_picture,student_id:{_id:Ve?.user?.student_id?._id},_id:Ve?.user?._id}})),ke=window.btoa(Ee);window.open(d.N.studentEnvironment+`?a=${be}&u=${f}&p=${ke}`,"_blank")}connectAsStudentFromLoginPage(Ve,Ee,we){return(0,i.Z)(function*(){const be=window.btoa(we||"login"),f=window.btoa(JSON.stringify({token:Ve?.token,user:{civility:Ve?.user?.civility,direct_line:Ve?.user?.direct_line,email:Ve?.user?.email,entities:Ve?.user?.entities.map(ve=>({type:{_id:ve?.type?._id}})),first_name:Ve?.user?.first_name,last_name:Ve?.user?.last_name,office_phone:Ve?.user?.office_phone,portable_phone:Ve?.user?.portable_phone,position:Ve?.user?.position,profile_picture:Ve?.user?.profile_picture,student_id:{_id:Ve?.user?.student_id?._id},_id:Ve?.user?._id}})),ke=window.btoa(Ee);window.open(d.N.studentEnvironment+`?a=${be}&u=${f}&p=${ke}`,"_self")})()}isLoginAsOther(){return!!(localStorage.getItem("backupUser")&&JSON.parse(localStorage.getItem("backupUser"))&&localStorage.getItem("backupToken")&&JSON.parse(localStorage.getItem("backupToken")))}loginAsPreviousUser(){const Ve=JSON.parse(localStorage.getItem("backupUser")),Ee=JSON.parse(localStorage.getItem("backupToken")),we=JSON.parse(localStorage.getItem("backupTemplateTable"));console.log("backup data",Ve),localStorage.setItem("userProfile",JSON.stringify(Ve)),localStorage.setItem("templateTable",JSON.stringify(we)),localStorage.setItem(d.N.tokenKey,JSON.stringify(Ee)),localStorage.removeItem("backupUser"),localStorage.removeItem("backupToken"),localStorage.removeItem("backupTemplateTable"),this.isLoggedIn=!0,this.permissionService.resetServiceData(),this.isConnectAsUserSource.next(!1)}setLocalUserProfile(Ve){localStorage.setItem("userProfile",JSON.stringify(Ve))}setPermission(Ve){const Ee=N.AES.encrypt(JSON.stringify(Ve),"Key").toString();console.log("conversionEncryptOutput : ",Ee,Ve),localStorage.setItem("permissions",Ee)}getPermission(){if(!localStorage.getItem("permissions"))return[];const Ve=N.AES.decrypt(localStorage.getItem("permissions"),"Key").toString(N.enc.Utf8);return JSON.parse(Ve)}removeLocalUserProfile(){localStorage.removeItem("userProfile"),localStorage.removeItem(d.N.tokenKey),localStorage.removeItem("permissions"),localStorage.removeItem("backupUser"),localStorage.removeItem("backupToken"),localStorage.removeItem("backupTemplateTable"),localStorage.removeItem("templateTable"),this.isLoggedIn=!1}setPassword(Ve,Ee){return this.apollo.mutate({mutation:m.ZP`
          mutation SetPassword{
            SetPassword(token: "${Ve}", password: "${Ee}") {
              email
            }
          }
        `}).pipe((0,S.U)(we=>we.data))}getUserById(Ve){return this.apollo.query({query:m.ZP`query GetOneUser{
         GetOneUser(_id:"${Ve}"){
            _id
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
              school{
                _id
                short_name
              }
              campus{
                _id
                name
              }
              level{
                _id
                name
              }
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
              programs {
                school {
                  _id
                  short_name
                }
              }
            }
          }
      }`,fetchPolicy:"network-only"}).pipe((0,S.U)(Ee=>Ee.data.GetOneUser))}getUserForDashboard(Ve){return this.apollo.query({query:m.ZP`query getUserForDashboard {
         GetOneUser(_id:"${Ve}"){
            _id
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
              school{
                _id
                short_name
              }
              campus{
                _id
                name
              }
              level{
                _id
                name
              }
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
        }`,fetchPolicy:"network-only"}).pipe((0,S.U)(Ee=>Ee.data.GetOneUser))}verifRecaptcha(Ve){return this.apollo.query({query:m.ZP`
          query VerifyRecaptcha{
          VerifyRecaptcha (token: "${Ve}"){
              success
              challenge_ts
              hostname
              score
              action
          }
      }`,fetchPolicy:"network-only"}).pipe((0,S.U)(Ee=>Ee.data.VerifyRecaptcha))}loginAsUser(Ve,Ee){return this.apollo.mutate({mutation:m.ZP`
      mutation LoginAsUserIncognito{
        loginAsUserIncognito(logged_in_user: "${Ve}", user_to_login: "${Ee}") {
          token
          user {
            _id
            civility
            first_name
            last_name
            email
            student_id {
              _id
            }
            position
            office_phone
            direct_line
            portable_phone
            profile_picture
            student_id {
              _id
            }
            homepage_configuration_id {
              _id
            }
            entities {
              school{
                _id
                short_name
              }
              campus{
                _id
                name
              }
              level{
                _id
                name
              }
              programs {
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
              }
              entity_name
              school_type
              group_of_schools {
                _id
                short_name
              }
              group_of_school{
                _id
                headquarter {
                  _id
                  short_name
                }
                school_members {
                  _id
                  short_name
                }
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
                    contract_process {
                      show_perm
                      actions {
                        btn_add_type_of_intervention
                        btn_export
                        btn_edit
                        btn_delete
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
                }
              }
            }
          }
        }
      }
      `}).pipe((0,S.U)(we=>we.data.loginAsUserIncognito))}autoLoginFromAuth(Ve){return this.apollo.query({query:m.ZP`
        query AutoLoginFromAuth{
        GetOneUser(email: "${Ve}") {
          _id
          civility
          first_name
          last_name
          email
          position
          office_phone
          direct_line
          portable_phone
          profile_picture
          student_id {
            _id
          }
          homepage_configuration_id {
            _id
          }
          entities {
            school{
              _id
              short_name
            }
            campus{
              _id
              name
            }
            level{
              _id
              name
            }
            programs {
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
            }
            entity_name
            school_type
            group_of_schools {
              _id
              short_name
            }
            group_of_school{
              _id
              headquarter {
                _id
                short_name
              }
              school_members {
                _id
                short_name
              }
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
      `}).pipe((0,S.U)(Ee=>Ee.data.GetOneUser))}GetUserTableColumnSettings(Ve){return this.apollo.watchQuery({query:m.ZP`
          query GetUserTableColumnSettings($user_id: ID!) {
            GetUserTableColumnSettings(user_id: $user_id) {
              table_name
              display_column {
                column_name
              }
              filter_column
            }
          }
        `,variables:{user_id:Ve},fetchPolicy:"network-only"}).valueChanges.pipe((0,S.U)(Ee=>Ee.data.GetUserTableColumnSettings))}CreateOrUpdateUserTableColumnSettings(Ve,Ee){return this.apollo.mutate({mutation:m.ZP`
          mutation CreateOrUpdateUserTableColumnSettings($input_table_setting: InputTableSetting, $user_id: ID) {
            CreateOrUpdateUserTableColumnSettings(user_id: $user_id, input_table_setting: $input_table_setting) {
              table_name
              display_column {
                column_name
              }
              filter_column
            }
          }
        `,variables:{user_id:Ve,input_table_setting:Ee}}).pipe((0,S.U)(we=>we.data.CreateOrUpdateUserTableColumnSettings))}refreshTemplateTables(Ve){this.subs.sink=this.GetUserTableColumnSettings(Ve).subscribe(Ee=>{Ee&&Ee?.length&&localStorage.setItem("templateTable",JSON.stringify(Ee))},Ee=>{P().fire({type:"info",title:"Warning",text:Ee&&Ee.message?this.translate.instant(Ee.message.replaceAll("GraphQL error: ","")):Ee,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})})}isUserOPERATORAdmin(){const Ve=JSON.parse(localStorage.getItem("userProfile"));let Ee=!1;if(Ve&&Ve.entities&&Ve.entities.length)for(const we of Ve.entities)if(console.log(we),we&&we.type&&"operator_admin"===we.type.name){Ee=!0;break}return Ee}getUserEntity(){const Ve=JSON.parse(localStorage.getItem("userProfile"));let Ee="";if(Ve&&Ve.entities&&Ve.entities.length)for(const we of Ve.entities){Ee=we.entity_name;break}return Ee}checkLinkStatus(Ve){return this.apollo.mutate({mutation:m.ZP`
      mutation CheckLinkStatus{
          CheckLinkStatus(token: "${Ve}")
          }
        `,errorPolicy:"all"}).pipe((0,S.U)(Ee=>Ee))}postErrorLog(Ve){const Ee=["0 Unknown Error","Password Not Valid","Invalid Password","invalid signature","jwt expired","Authorization header is missing","str & salt required","UnAuthenticated","salt"];let we=!1;if(Ve=JSON.stringify(Ve))for(const ye of Ee)if(Ve.includes(ye)){we=!0;break}if(console.log("cek postErrorlog",we),!we){let ye=localStorage.getItem("userProfile")?JSON.parse(localStorage.getItem("userProfile")):null;const be=l(4147);ye=ye&&ye._id?ye:null;const f={environment:d.N.apiUrl,first_name:ye?ye.first_name:"",last_name:ye?ye.last_name:"",civility:ye?ye.civility:"",email:ye?ye.email:"",operating_system:OSNameADMTC,browser_name:browserNameADMTC,version:be.version,url:locationUrl,error_message:Ve};console.log("==================================| Error |=================================="),console.log("postErrorLog",f),"https://api.erp-edh.com/graphql"===d.N.apiUrl&&this.httpClient.post("https://zetta-track.click/saveErrorLogEDH",f).subscribe(ke=>{console.log("resp postErrorLog",ke)}),console.log("==================================| Error |==================================")}}}return J.\u0275fac=function(Ve){return new(Ve||J)($.\u0275\u0275inject(r.F0),$.\u0275\u0275inject(B._M),$.\u0275\u0275inject(K.$),$.\u0275\u0275inject(x.sK),$.\u0275\u0275inject($.NgZone),$.\u0275\u0275inject(C.eN))},J.\u0275prov=$.\u0275\u0275defineInjectable({token:J,factory:J.\u0275fac,providedIn:"root"}),J})()},25360:(on,ot,l)=>{"use strict";l.d(ot,{n:()=>K});var i=l(17489),m=l(68745),S=l(35226),d=l.n(S),N=l(92340),q=l(94650),b=l(610),P=l(84130),A=l(44758),$=l(52688),r=l(84075),B=l(89383);let K=(()=>{class x{constructor(T,J,Me,Ve,Ee,we,ye){this.router=T,this.activatedRoute=J,this.permissions=Me,this.permissionService=Ve,this.authService=Ee,this.utilService=we,this.translate=ye,this.subs=new m.Y}canActivate(T,J){if(!localStorage.getItem(N.N.tokenKey)||!localStorage.getItem("permissions")||!localStorage.getItem("userProfile"))return this.router.createUrlTree(["/session/login"],{queryParams:{returnUrl:J.url}});const Me=T.data.permission;if(Me){let ve=this.permissionService.showMenu(Me);console.log("permission",Me,ve),this.permissions.getPermission("Chief Group Academic")&&"rncp_title.show_perm"===Me&&(ve=this.permissionService.showMenu("rncp_title.show_chief_group_perm")),(this.permissions.getPermission("Mentor")||this.permissions.getPermission("HR"))&&"schools.show_perm"===Me&&(ve=!0);const te=this.permissions.getPermissions();ve||(this.permissions.getPermission("Mentor")||this.permissions.getPermission("HR")?this.router.navigate(["/students-card"]):this.permissions.getPermission("Chief Group Academic")||this.permissions.getPermission("Chief Group Academic")?this.router.navigate(["/school-group"]):this.permissions.getPermission("Student")?this.router.navigate(["/my-file"]):this.permissions.getPermission("Candidate")?this.router.navigate(["/mailbox/inbox"]):this.permissions.getPermission("Alumni")?this.router.navigate(["/alumni-trombinoscope"]):this.permissions.getPermission("Director of Admissions")?this.router.navigate(["/dashboard-register"]):te.constructor===Object&&0===Object.keys(te).length||!this.permissionService.getEntityPermission()?this.authService.logOut():(this.permissionService.showMenu("rncp_title.show_perm"),this.router.navigate(["/task"])))}const Ve=JSON.parse(localStorage.getItem("userProfile"));let Ee=!1,we=!1;if(Ve)return Ee=!0,Ve.is_password_set&&(we=!0),!0;let ye="",be="",f="",ke="";return console.log(T.queryParamMap.keys),T.queryParams.hasOwnProperty("userId")&&(ye=T.queryParams.userId),T.queryParams.hasOwnProperty("setPasswordToken")&&!Ee&&!we&&(be=T.queryParams.setPasswordToken),T.queryParams.hasOwnProperty("email")&&(f=T.queryParams.email),T.queryParams.hasOwnProperty("token")&&(ke=T.queryParams.token),f&&ke?(console.log(J.url),void this.autoLogin(f,ke,J.url)):(""!==ye&&""!==be?this.router.navigate([`/session/setPassword/${ye}`],{queryParams:{returnUrl:J.url,token:be}}):this.router.navigate(["/session/login"],{queryParams:{returnUrl:J.url}}),!1)}autoLogin(T,J,Me){this.subs.unsubscribe(),this.subs.sink=this.authService.autoLoginFromAuth(T.toLowerCase()).subscribe(Ve=>{if(Ve){console.log(Ve);const Ee=Ve;console.log(Ve),this.getUserTableColumnSettings(Ee,Ve,Ve?._id,Me,J),console.log(Ee)}else this.authService.logOut()},Ve=>{Ve&&Ve.message&&(Ve.message.includes("jwt expired")||Ve.message.includes("str & salt required")||Ve.message.includes("Authorization header is missing")||Ve.message.includes("salt"))?this.authService.handlerSessionExpired():(this.authService.logOut(),d().fire({type:"info",title:this.translate.instant("SORRY"),text:Ve&&Ve.message?this.translate.instant(Ve.message.replaceAll("GraphQL error: ","")):Ve,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")}))})}getUserTableColumnSettings(T,J,Me,Ve,Ee){if(Me)this.subs.sink=this.authService.GetUserTableColumnSettings(Me).subscribe(we=>{we&&we?.length&&localStorage.setItem("templateTable",JSON.stringify(we));const ye=this.utilService.setDataProgram(T.entities);T.entities=this.utilService.mergeHierarchyPermission(i.cloneDeep(T.entities));const be=this.utilService.sortEntitiesByHierarchy(T.entities),f=[],ke=[];be&&be.length>0&&be.forEach(te=>{console.log("UserType name : ",te.type.name),f.push(te.type.name),ke.push(te.type._id)});const ve=T;if(ve.entities=be,ve.app_data=ye,localStorage.setItem("userProfile",JSON.stringify(ve)),f&&f.length){this.authService.setLocalUserProfileAndToken({token:Ee,user:J}),this.authService.setPermission(f),this.permissions.flushPermissions(),this.permissions.loadPermissions(f),console.log("permissions (UserType): ",f);const te=Ve.split("?")[0];this.router.navigateByUrl(te)}else this.authService.logOut()},we=>{d().fire({type:"info",title:this.translate.instant("SORRY"),text:we&&we.message?this.translate.instant(we.message.replaceAll("GraphQL error: ","")):we,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})});else{const we=this.utilService.setDataProgram(T.entities);T.entities=this.utilService.mergeHierarchyPermission(i.cloneDeep(T.entities));const ye=this.utilService.sortEntitiesByHierarchy(T.entities),be=[],f=[];ye&&ye.length>0&&ye.forEach(ve=>{console.log("UserType name : ",ve.type.name),be.push(ve.type.name),f.push(ve.type._id)});const ke=T;if(ke.entities=ye,ke.app_data=we,localStorage.setItem("userProfile",JSON.stringify(ke)),be&&be.length){this.authService.setLocalUserProfileAndToken({token:Ee,user:J}),this.authService.setPermission(be),this.permissions.flushPermissions(),this.permissions.loadPermissions(be),console.log("permissions (UserType): ",be);const ve=Ve.split("?")[0];this.router.navigateByUrl(ve)}else this.authService.logOut()}}}return x.\u0275fac=function(T){return new(T||x)(q.\u0275\u0275inject(b.F0),q.\u0275\u0275inject(b.gz),q.\u0275\u0275inject(P.YI),q.\u0275\u0275inject(A.$),q.\u0275\u0275inject($.e),q.\u0275\u0275inject(r.t),q.\u0275\u0275inject(B.sK))},x.\u0275prov=q.\u0275\u0275defineInjectable({token:x,factory:x.\u0275fac,providedIn:"root"}),x})()},91013:(on,ot,l)=>{"use strict";l.d(ot,{e:()=>N});var i=l(13125),a=l(24850),m=l(94650),S=l(80529),d=l(18497);let N=(()=>{class q{constructor(P,A){this.httpClient=P,this.apollo=A,this.mailCategories=[{key:"inbox",name:"MailBox.INBOX",state:"mailbox/inbox",icon:"fa-inbox"},{key:"CC",name:"MailBox.CC",state:"mailbox/cc",icon:"fa-inbox"},{key:"sent",name:"MailBox.SENT",state:"mailbox/sentBox",icon:"fa-paper-plane"},{key:"important",name:"MailBox.IMPORTANT",state:"mailbox/important",icon:"fa-hand-paper-o"},{key:"draft",name:"MailBox.DRAFT",state:"mailbox/draft",icon:"fa-archive"},{key:"trash",name:"MailBox.TRASH",state:"mailbox/trash",icon:"fa-trash"}]}getAllMailbox(P,A,$,r){return this.apollo.query({query:i.ZP`
          query GetAllMails($pagination: PaginationInput, $sorting: MailSorting, $type: EnumMailType, $new_mail: Boolean) {
            GetAllMails(pagination: $pagination, sorting: $sorting, type: $type, new_mail: $new_mail) {
              sender_property {
                sender {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
                is_read
                module
                mail_type
              }
              recipient_properties {
                recipients {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
                rank
                module
                is_read
                mail_type
              }
              subject
              is_sent
              message
              tags
              attachments
              status
              is_urgent_mail
              file_attachments {
                file_name
                path
              }
              is_group_parent
              is_group_child
              group_detail {
                rncp_titles {
                  _id
                  short_name
                }
                user_types {
                  _id
                  name
                }
              }
              user_type_selection
              count_document
            }
          }
        `,variables:{pagination:P,sorting:A,type:$,new_mail:r},fetchPolicy:"network-only"}).pipe((0,a.U)(B=>B.data.GetAllMails))}getMailNotif(P,A,$){return this.apollo.query({query:i.ZP`
          query GetAllMails($pagination: PaginationInput, $type: EnumMailType, $new_mail: Boolean) {
            GetAllMails(pagination: $pagination, type: $type, new_mail: $new_mail) {
              _id
              created_at
              date
              sender_property {
                sender {
                  _id
                  first_name
                  last_name
                  email
                  civility
                }
                is_read
              }
              recipient_properties {
                recipients {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
                rank
                is_read
              }
              subject
              is_sent
              message
              tags
              attachments
              status
              is_urgent_mail
              file_attachments {
                file_name
                path
              }
              is_group_parent
              is_group_child
              group_detail {
                rncp_titles {
                  _id
                  short_name
                }
                user_types {
                  _id
                  name
                }
              }
              user_type_selection
              count_document
              count_not_read
            }
          }
        `,variables:{pagination:P,type:A,new_mail:$},fetchPolicy:"network-only"}).pipe((0,a.U)(r=>r.data.GetAllMails))}getMainMail(P,A,$,r,B,K,x){return this.apollo.query({query:i.ZP`
          query GetAllMails($pagination: PaginationInput, $sorting: MailSorting, $type: EnumMailType, $new_mail: Boolean, $user_id:ID) {
            GetAllMails(
              pagination: $pagination,
              sorting: $sorting,
              type: $type,
              new_mail: $new_mail,
              ${B},
              ${K?`recipient_rank : ${K}`:""}
              user_id: $user_id
            ) {
              _id
              created_at
                date
              sender_property {
                sender {
                  _id
                  first_name
                  last_name
                  email
                  civility
                }
                is_read
              }
              recipient_properties {
                recipients {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
                mail_type
                rank
                is_read
                recipients_email
              }
              subject
              is_sent
              message
              tags
              attachments
              status
              is_urgent_mail
              file_attachments {
                file_name
                path
              }
              is_group_parent
              is_group_child
              group_detail {
                rncp_titles {
                  _id
                  short_name
                }
                user_types {
                  _id
                  name
                }
              }
              user_type_selection
              count_document
              count_not_read
            }
          }
        `,variables:{pagination:P,sorting:A,type:$,new_mail:r,user_id:x||""},fetchPolicy:"network-only"}).pipe((0,a.U)(C=>C.data.GetAllMails))}getNonMainMail(P,A,$,r,B){return this.apollo.query({query:i.ZP`
          query GetAllMails($pagination: PaginationInput, $sorting: MailSorting, $type: EnumMailType, $user_id: ID) {
            GetAllMails(pagination: $pagination, sorting: $sorting, type: $type, ${r}, user_id: $user_id) {
              _id
              created_at
                date
              sender_property {
                sender {
                  _id
                  first_name
                  last_name
                  email
                  civility
                }
                is_read
              }
              recipient_properties {
                recipients {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
                recipients_email 
                rank
                is_read
              }
              subject
              is_sent
              message
              tags
              attachments
              status
              is_urgent_mail
              file_attachments {
                file_name
                path
              }
              is_group_parent
              is_group_child
              group_detail {
                rncp_titles {
                  _id
                  short_name
                }
                user_types {
                  _id
                  name
                }
              }
              user_type_selection
              count_document
              count_not_read
            }
          }
        `,variables:{pagination:P,sorting:A,type:$,user_id:B||""},fetchPolicy:"network-only"}).pipe((0,a.U)(K=>K.data.GetAllMails))}getUrgentMail(){return this.apollo.query({query:i.ZP`
          query GetAllMails {
            GetAllMails(is_urgent_mail: true, type: inbox) {
              _id
              created_at
              date
              sender_property {
                sender {
                  _id
                  first_name
                  last_name
                  email
                  civility
                }
                is_read
                module
                mail_type
              }
              recipient_properties {
                recipients {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
                rank
                module
                is_read
                mail_type
              }
              subject
              is_sent
              message
              tags
              attachments
              status
              is_urgent_mail
              file_attachments {
                file_name
                path
              }
              is_group_parent
              is_group_child
              group_detail {
                rncp_titles {
                  _id
                  short_name
                }
                user_types {
                  _id
                  name
                }
              }
              user_type_selection
              count_document
              count_not_read
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,a.U)(P=>P.data.GetAllMails))}updateSingleMail(P,A){return this.apollo.mutate({mutation:i.ZP`
          mutation UpdateMail($_id: ID!, $mail_input: MailInput) {
            UpdateMail(_id: $_id, mail_input: $mail_input) {
              sender_property {
                is_read
                mail_type
              }
              recipient_properties {
                is_read
                mail_type
              }
            }
          }
        `,variables:{_id:P,mail_input:A}}).pipe((0,a.U)($=>$.data.UpdateMail))}sendMail(P,A){return this.apollo.mutate({mutation:i.ZP`
          mutation SendMail($_id: ID, $mail_input: MailInput) {
            SendMail(_id: $_id, mail_input: $mail_input)
          }
        `,variables:{_id:P,mail_input:A}}).pipe((0,a.U)($=>$.data.SendMail))}updateMultipleMail(P,A){return this.apollo.mutate({mutation:i.ZP`
          mutation UpdateMultipleMail($_ids: [ID!]!, $mail_input: MailInput) {
            UpdateMultipleMail(_ids: $_ids, mail_input: $mail_input) {
              sender_property {
                mail_type
              }
              _id
              recipient_properties {
                recipients {
                  _id
                }
                is_read
                rank
                mail_type
              }
            }
          }
        `,variables:{_ids:P,mail_input:A}}).pipe((0,a.U)($=>$.data.UpdateMultipleMail))}updateMultipleMailRecipient(P,A,$){return this.apollo.mutate({mutation:i.ZP`
          mutation UpdateMultipleMail($_ids: [ID!]!, $recipient_properties: SetMailTypeInput, $user_id: ID) {
            UpdateMultipleMail(_ids: $_ids, recipient_properties: $recipient_properties, user_id:$user_id) {
              sender_property {
                mail_type
              }
              recipient_properties {
                mail_type
              }
            }
          }
        `,variables:{_ids:P,recipient_properties:A,user_id:$}}).pipe((0,a.U)(r=>r.data.UpdateMultipleMail))}updateMultipleMailSender(P,A,$){return this.apollo.mutate({mutation:i.ZP`
          mutation UpdateMultipleMail($_ids: [ID!]!, $sender_property: SetMailTypeInput, $user_id: ID) {
            UpdateMultipleMail(_ids: $_ids, sender_property: $sender_property, user_id:$user_id) {
              _id
              sender_property {
                is_read
                mail_type
              }
              recipient_properties {
                is_read
                mail_type
              }
            }
          }
        `,variables:{_ids:P,sender_property:A,user_id:$}}).pipe((0,a.U)(r=>r.data.UpdateMultipleMail))}deleteMail(P){return this.apollo.mutate({mutation:i.ZP`
          mutation DeleteMail($_ids: [ID]) {
            DeleteMail(_ids: $_ids) {
              _id
            }
          }
        `,variables:{_ids:P}}).pipe((0,a.U)(A=>A.data.DeleteMail))}deleteMultipleMail(P){return this.apollo.mutate({mutation:i.ZP`
          mutation DeleteMail($_ids: [ID]) {
            DeleteMail(_ids: $_ids) {
              _id
            }
          }
        `,variables:{_ids:P}}).pipe((0,a.U)(A=>A.data.DeleteMail))}createMail(P){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateMail($mail_input: MailInput) {
            CreateMail(mail_input: $mail_input)
          }
        `,variables:{mail_input:P}}).pipe((0,a.U)(A=>A.data.CreateMail))}CreateMailForMultipleRecipientsInvoice(P,A,$){return A?this.apollo.mutate({mutation:i.ZP`
            mutation CreateMailForMultipleRecipients($mail_input: MailInput, $is_with_invoice: Boolean) {
              CreateMailForMultipleRecipients(mail_input: $mail_input, is_with_invoice: $is_with_invoice)
            }
          `,variables:{mail_input:P,is_with_invoice:$||!1}}).pipe((0,a.U)(r=>r.data.CreateMailForMultipleRecipients)):this.apollo.mutate({mutation:i.ZP`
            mutation CreateMailForMultipleRecipients($mail_input: MailInput) {
              CreateMailForMultipleRecipients(mail_input: $mail_input)
            }
          `,variables:{mail_input:P}}).pipe((0,a.U)(r=>r.data.CreateMailForMultipleRecipients))}CreateMailForMultipleRecipients(P){return this.apollo.mutate({mutation:i.ZP`
          mutation CreateMailForMultipleRecipients($mail_input: MailInput) {
            CreateMailForMultipleRecipients(mail_input: $mail_input)
          }
        `,variables:{mail_input:P}}).pipe((0,a.U)(A=>A.data.CreateMailForMultipleRecipients))}getRecipientData(P){return this.apollo.query({query:i.ZP`
          query GetAllUsers($last_name: String) {
            GetAllUsers(last_name: $last_name, show_student: include_student) {
              email
              first_name
              last_name
              civility
              position
            }
          }
        `,variables:{last_name:P},fetchPolicy:"network-only"}).pipe((0,a.U)(A=>A.data.GetAllUsers))}getRecipientDataUsingName(P){return this.apollo.query({query:i.ZP`
          query GetAllUsers($last_name_or_email: String) {
            GetAllUsers(last_name_or_email: $last_name_or_email, show_student: include_student) {
              email
              first_name
              last_name
              civility
              position
            }
          }
        `,variables:{last_name_or_email:P},fetchPolicy:"network-only"}).pipe((0,a.U)(A=>A.data.GetAllUsers))}getRecipientDataUsingNameForGroup(P,A){return this.apollo.query({query:i.ZP`
          query GetAllUsers($full_name: String, $title: [ID!]) {
            GetAllUsers(full_name: $full_name, title: $title) {
              email
              first_name
              last_name
              civility
              position
            }
          }
        `,variables:{full_name:P,title:A},fetchPolicy:"network-only"}).pipe((0,a.U)($=>$.data.GetAllUsers))}getRecipientDataUsingNameAndTypeForGroup(P,A,$){return this.apollo.query({query:i.ZP`
          query GetAllUsers($full_name: String, $title: [ID!], $user_type: [ID!]) {
            GetAllUsers(full_name: $full_name, title: $title, user_type: $user_type) {
              email
              first_name
              last_name
              civility
              position
            }
          }
        `,variables:{full_name:P,title:A,user_type:$},fetchPolicy:"network-only"}).pipe((0,a.U)(r=>r.data.GetAllUsers))}getRecipientDataEmail(P){return this.apollo.query({query:i.ZP`
          query GetOneUser($email: String) {
            GetOneUser(email: $email) {
              email
              first_name
              last_name
              civility
              position
            }
          }
        `,variables:{email:P},fetchPolicy:"network-only"}).pipe((0,a.U)(A=>A.data.GetOneUser))}getUserBySchool(){return this.apollo.query({query:i.ZP`
          query GetUserBySchool{
            GetAllSchools(user_login: true) {
              _id
              short_name
              users {
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
              preparation_center_ats {
                rncp_title_id {
                  _id
                  short_name
                  long_name
                }
              }
              certifier_ats {
                short_name
              }
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,a.U)(P=>P.data.GetAllSchools))}getStudent(P){return this.apollo.query({query:i.ZP`
          query GetStudent{
            GetAllStudents(school: "${P}") {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,a.U)(A=>A.data.GetAllStudents))}getUserAcadDirBySchool(P){return this.apollo.query({query:i.ZP`
          query {
            GetAllUsers(school: "${P}", user_type_name: "Academic Director") {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,a.U)(A=>A.data.GetAllUsers))}getUserAcadAdminBySchool(P){return this.apollo.query({query:i.ZP`
          query {
            GetAllUsers(school: "${P}", user_type_name: "Academic Admin") {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,a.U)(A=>A.data.GetAllUsers))}geUserListBySchoolAndUsertype(P,A){return this.apollo.query({query:i.ZP`
          query GetUserListBySchoolAndUsertype($schools: [ID], $user_type: [ID!]) {
            GetAllUsers(schools: $schools, user_type: $user_type) {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,variables:{schools:P,user_type:A},fetchPolicy:"network-only"}).pipe((0,a.U)($=>$.data.GetAllUsers))}geUserListBySchoolAndTitleAndUsertype(P,A,$){return this.apollo.query({query:i.ZP`
          query GetUserListBySchoolAndUsertype($schools: [ID], $title: [ID!], $user_type: [ID!]) {
            GetAllUsers(schools: $schools, title: $title, user_type: $user_type) {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,variables:{schools:P,title:A,user_type:$},fetchPolicy:"network-only"}).pipe((0,a.U)(r=>r.data.GetAllUsers))}geUserListBySchoolAndTitle(P,A){return this.apollo.query({query:i.ZP`
          query GetUserListBySchoolAndUsertype($schools: [ID], $title: [ID!]) {
            GetAllUsers(schools: $schools, title: $title) {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,variables:{schools:P,title:A},fetchPolicy:"network-only"}).pipe((0,a.U)($=>$.data.GetAllUsers))}geUserStudentListBySchoolAndTitleAndUsertype(P,A,$,r){return this.apollo.query({query:i.ZP`
          query GetUserListBySchoolAndUsertype($schools: [ID], $title: [ID!], $user_type: [ID!], $show_student: EnumShowStudent) {
            GetAllUsers(schools: $schools, title: $title, user_type: $user_type, show_student: $show_student) {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,variables:{schools:P,title:A,user_type:$,show_student:r},fetchPolicy:"network-only"}).pipe((0,a.U)(B=>B.data.GetAllUsers))}getUserCerDirBySchool(P){return this.apollo.query({query:i.ZP`
          query {
            GetAllUsers(school: "${P}", user_type_name: "CR School Director") {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,a.U)(A=>A.data.GetAllUsers))}getUserCerAdminBySchool(P){return this.apollo.query({query:i.ZP`
          query {
            GetAllUsers(school: "${P}", user_type_name: "Certifier Admin") {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,a.U)(A=>A.data.GetAllUsers))}getUserBySchoolId(P){return this.apollo.query({query:i.ZP`
          query GetUserBySchoolId{
            GetAllUsers(school: "${P}") {
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
        `,fetchPolicy:"network-only"}).pipe((0,a.U)(A=>A.data.GetAllUsers))}getOneTitle(P){return this.apollo.query({query:i.ZP`
        query GetOneTitle{
          GetOneTitle(_id: "${P}") {
            _id
            short_name
          }
        }
      `,fetchPolicy:"network-only"}).pipe((0,a.U)(A=>A.data.GetOneTitle))}getOneUserTypes(P){return this.apollo.query({query:i.ZP`
      query GetOneUserType{
        GetOneUserType(_id:"${P}"){
          _id
          name
          entity
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,a.U)(A=>A.data.GetOneUserType))}getMailCategories(){return this.mailCategories}}return q.\u0275fac=function(P){return new(P||q)(m.\u0275\u0275inject(S.eN),m.\u0275\u0275inject(d._M))},q.\u0275prov=m.\u0275\u0275defineInjectable({token:q,factory:q.\u0275fac,providedIn:"root"}),q})()},28455:(on,ot,l)=>{"use strict";l.d(ot,{S:()=>q});var i=l(13125),a=l(591),m=l(68745),S=l(24850),d=l(94650),N=l(18497);let q=(()=>{class b{constructor(A){this.apollo=A,this.subs=new m.Y,this.notificationCount=new a.X(null),this.notificationCount$=this.notificationCount.asObservable()}setNotificationCount(A){this.notificationCount.next(A?.length?A[0]?.unread_notification:null)}getAllNotificationForCount(){return this.apollo.query({query:i.ZP`
          query getAllNotificationForCount($pagination: PaginationInput) {
            GetAllLiveNotifications(pagination: $pagination) {
              _id
              unread_notification
              count_document
            }
          }
        `,fetchPolicy:"network-only",variables:{pagination:{limit:1,page:0}}}).pipe((0,S.U)(A=>A.data.GetAllLiveNotifications))}getAllNotificationRelatedToUser(A,$){return this.apollo.query({query:i.ZP`
        query getAllNotificationRelatedToUser($pagination: PaginationInput, $filter: LiveNotificationFilterInput) {
          GetAllLiveNotifications(pagination: $pagination, filter: $filter) {
            _id
            unread_notification
            is_read
            is_removed
            comment_id {
              _id
              subject
              candidate_id {
                _id
              }
              created_by {
                _id
                first_name
                last_name
                civility
              }
              reply_for_comment_id {
                _id
              }
            }
            user_id {
              _id
            }
            status
            date_created
            count_document
          }
        }
      `,fetchPolicy:"network-only",variables:{pagination:A,filter:$}}).pipe((0,S.U)(r=>r.data.GetAllLiveNotifications))}updateLiveNofication(A,$){return this.apollo.mutate({mutation:i.ZP`
          mutation UpdateLiveNotification($payload: ID!, $filter: LiveNotificationInput) {
            UpdateLiveNotification(_id: $payload live_notification_input: $filter) {
              _id
            }
          }
        `,variables:{payload:A,filter:$}}).pipe((0,S.U)(r=>r.data.UpdateLiveNotification))}}return b.\u0275fac=function(A){return new(A||b)(d.\u0275\u0275inject(N._M))},b.\u0275prov=d.\u0275\u0275defineInjectable({token:b,factory:b.\u0275fac,providedIn:"root"}),b})()},44758:(on,ot,l)=>{"use strict";l.d(ot,{$:()=>P});var i=l(17489),m=l(13125),S=l(24850),d=l(94650),N=l(80529),q=l(18497),b=l(89383);let P=(()=>{class A{constructor(r,B,K){this.httpClient=r,this.apollo=B,this.translate=K,this.isManualPermission=!0}getLocalStorageUser(){return this.userData||(this.userData=JSON.parse(localStorage.getItem("userProfile")),this.isLoggedIn=!!this.userData),this.userData}getEntityUser(){return this.entityData||(this.entityData=this.getLocalStorageUser()&&this.getLocalStorageUser().entities[0]?this.getLocalStorageUser().entities[0]:null),this.entityData}getEntityPermission(){return this.permissionData||(this.permissionData=this.getEntityUser()?this.getEntityUser().type.usertype_permission_id:null),this.permissionData}resetServiceData(){this.userData=null,this.entityData=null,this.permissionData=null}showMenu(r){const B=this.getEntityPermission();return i.get(B,r)}showPendingTaskPerm(){const r=this.getEntityPermission();return i.get(r,"rncp_title.pending_task.show_perm")}editPendingTaskPerm(){const r=this.getEntityPermission();return i.get(r,"rncp_title.pending_task.edit_perm")}showCalendarPerm(){const r=this.getEntityPermission();return i.get(r,"rncp_title.calendar.show_perm")}addCalendarPerm(){const r=this.getEntityPermission();return i.get(r,"rncp_title.calendar.add_perm")}editCalendarPerm(){const r=this.getEntityPermission();return i.get(r,"rncp_title.calendar.edit_perm")}deleteCalendarPerm(){const r=this.getEntityPermission();return i.get(r,"rncp_title.calendar.delete_perm")}showAcadKitPerm(){const r=this.getEntityPermission();return i.get(r,"rncp_title.acad_kit.show_perm")}editAcadKitNot06Perm(){const r=this.getEntityPermission();return i.get(r,"rncp_title.acad_kit.edit_perm")}editAcadKit06Perm(){return this.getEntityPermission(),!1}showAcadKitFolderOnePerm(){const r=this.getEntityPermission();return i.get(r,"rncp_title.acad_kit.folder_permissions.folder_one.show_perm")}showAcadKitFolderTwoPerm(){const r=this.getEntityPermission();return i.get(r,"rncp_title.acad_kit.folder_permissions.folder_two.show_perm")}showAcadKitFolderThreePerm(){const r=this.getEntityPermission();return i.get(r,"rncp_title.acad_kit.folder_permissions.folder_three.show_perm")}showAcadKitFolderFourPerm(){const r=this.getEntityPermission();return i.get(r,"rncp_title.acad_kit.folder_permissions.folder_four.show_perm")}showAcadKitFolderFivePerm(){const r=this.getEntityPermission();return i.get(r,"rncp_title.acad_kit.folder_permissions.folder_five.show_perm")}showAcadKitFolderSixPerm(){const r=this.getEntityPermission();return i.get(r,"rncp_title.acad_kit.folder_permissions.folder_six.show_perm")}showAcadKitFolderSevenPerm(){const r=this.getEntityPermission();return i.get(r,"rncp_title.acad_kit.folder_permissions.folder_seven.show_perm")}showAcadKitFolderOthersPerm(){const r=this.getEntityPermission();return i.get(r,"rncp_title.acad_kit.folder_permissions.folder_others.show_perm")}showSchoolTablePerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.school_table.show_perm")}addSchoolTablePerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.school_table.add_perm")}editchoolTablePerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.school_table.actions.edit_perm")}sendMailSchoolTablePerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.school_table.actions.send_email")}showSchoolIdentityPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.school_details.show_perm")}editSchoolIdentityPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.school_details.edit_perm")}showConnectedRncpTablePerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.school_details.connected_rncp.show_perm")}addConnectedRncpTablePerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.school_details.connected_rncp.add_perm")}editConnectedRncpTablePerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.school_details.connected_rncp.actions.edit_perm")}deleteConnectedRncpTablePerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.school_details.connected_rncp.actions.delete_perm")}showSchoolStaffPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.school_staff.show_perm")}addStaffSchoolStaffPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.school_staff.add_user")}exportStaffSchoolStaffPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.school_staff.export_button")}incignitoActionSchoolStaffPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.school_staff.school_staff_table.actions.incognito")}errorMailActionSchoolStaffPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.school_staff.school_staff_table.actions.error_email")}editActionSchoolStaffPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.school_staff.school_staff_table.actions.edit_perm")}deleteActionSchoolStaffPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.school_staff.school_staff_table.actions.delete_perm")}sendMailActionSchoolStaffPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.school_staff.school_staff_table.actions.send_email")}showStudentTableInSchoolPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_table.show_perm")}addStudentInStudentTableInSchoolPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_table.add_perm")}importStudentInStudentTableInSchoolPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_table.import_student")}exportListOfStudentInStudentTableInSchoolPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_table.export_list_of_student")}exportESStudentInStudentTableInSchoolPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_table.export_ES")}thumbsupActionStudentTableInSchoolPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_table.actions.thumbsup")}resignActionStudentTableInSchoolPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_table.actions.resignation")}editActionStudentTableInSchoolPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_table.actions.edit_perm")}sendMailActionStudentTableInSchoolPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_table.actions.send_email")}showDeactivatedStudentTableInSchoolPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.deactivate_student_table.show_perm")}exportDeactivatedStudentTableInSchoolPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.deactivate_student_table.export_perm")}reactiveDeactivatedStudentTableInSchoolPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.deactivate_student_table.reactive_perm")}showStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.show_perm")}addStudentInStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.add_perm")}importStudentInStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.import_student")}showCourseTabStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.student_details.course.show_perm")}editCourseTabStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.student_details.course.edit_perm")}showIdentityTabStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.student_details.identity.show_perm")}editIdentityTabStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.student_details.identity.edit_perm")}showParentTabStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.student_details.parent.show_perm")}showCertificationRuleTabStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.student_details.certification_rule.show_perm")}showAcadJourneyTabStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.student_details.academic_journey.show_perm")}editParentTabStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.student_details.parent.edit_perm")}showEmpSurveyTabStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.student_details.emp_survey.show_perm")}showCompanyTabStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.student_details.company.show_perm")}editCompanyTabStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.student_details.company.edit_perm")}showJobDescTabStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.student_details.job_desc.show_perm")}showProblematicTabStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.student_details.problematic.show_perm")}showDiplomaTabStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.student_details.diploma.show_perm")}showSubjectCertTabStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.student_details.subject_of_cert.show_perm")}showDocumentTabStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.student_details.document.show_perm")}showCertificationTabStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.student_details.certification.show_perm")}showDetailCertificationTabStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.student_details.details_of_certification.show_perm")}showRetakeDuringYearTabStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.student_details.retake_during_year.show_perm")}showMentorEvalTabStudentCardPerm(){const r=this.getEntityPermission();return i.get(r,"schools.list_of_schools.student_card.student_details.mentor_evaluation.show_perm")}showGroupOfSchoolPerm(){const r=this.getEntityPermission();return i.get(r,"schools.group_of_schools.show_perm")}addGroupOfSchoolPerm(){const r=this.getEntityPermission();return i.get(r,"schools.group_of_schools.add_perm")}editGroupOfSchoolPerm(){const r=this.getEntityPermission();return i.get(r,"schools.group_of_schools.actions.edit_perm")}deleteGroupOfSchoolPerm(){const r=this.getEntityPermission();return i.get(r,"schools.group_of_schools.actions.delete_perm")}showStudentTablePerm(){const r=this.getEntityPermission();return i.get(r,"students.active_students.show_perm")}transfertActionInStudentTablePerm(){const r=this.getEntityPermission();return i.get(r,"students.active_students.student_table.transfer_student")}exportListOfStudentInTablePerm(){const r=this.getEntityPermission();return i.get(r,"students.active_students.student_table.export_list_of_student")}exportESInStudentTablePerm(){const r=this.getEntityPermission();return i.get(r,"students.active_students.student_table.export_ES")}editActiontInStudentTablePerm(){const r=this.getEntityPermission();return i.get(r,"students.active_students.student_table.actions.edit_perm")}thumbsupActionInStudentTablePerm(){const r=this.getEntityPermission();return i.get(r,"students.active_students.student_table.actions.thumbsup")}incignitoActionInStudentTablePerm(){const r=this.getEntityPermission();return i.get(r,"students.active_students.student_table.actions.incognito")}errorMailActionInStudentTablePerm(){const r=this.getEntityPermission();return i.get(r,"students.active_students.student_table.actions.error_email")}sendMailActionInStudentTablePerm(){const r=this.getEntityPermission();return i.get(r,"students.active_students.student_table.actions.send_email")}resignationActionInStudentTablePerm(){const r=this.getEntityPermission();return i.get(r,"students.active_students.student_table.actions.resignation_perm")}deactiveActionInStudentTablePerm(){const r=this.getEntityPermission();return i.get(r,"students.active_students.student_table.actions.deactive_perm")}viewActionInStudentTablePerm(){const r=this.getEntityPermission();return i.get(r,"students.active_students.student_table.actions.view_perm")}showStudentTablePermDeactivated(){const r=this.getEntityPermission();return i.get(r,"students.deactivated_students.show_perm")}exportListOfStudentInTablePermDeactivated(){const r=this.getEntityPermission();return i.get(r,"students.deactivated_students.student_table.export_list_of_student")}exportESInStudentTablePermDeactivated(){const r=this.getEntityPermission();return i.get(r,"students.deactivated_students.student_table.export_ES")}editActiontInStudentTablePermDeactivated(){const r=this.getEntityPermission();return i.get(r,"students.deactivated_students.student_table.actions.edit_perm")}thumbsupActionInStudentTablePermDeactivated(){const r=this.getEntityPermission();return i.get(r,"students.deactivated_students.student_table.actions.thumbsup")}incignitoActionInStudentTablePermDeactivated(){const r=this.getEntityPermission();return i.get(r,"students.deactivated_students.student_table.actions.incognito")}errorMailActionInStudentTablePermDeactivated(){const r=this.getEntityPermission();return i.get(r,"students.deactivated_students.student_table.actions.error_email")}reactivateActionInStudentTablePermDeactivated(){const r=this.getEntityPermission();return i.get(r,"students.deactivated_students.student_table.actions.reactivation_perm")}sendMailActionInStudentTablePermDeactivated(){const r=this.getEntityPermission();return i.get(r,"students.deactivated_students.student_table.actions.send_email")}resignationActionInStudentTablePermDeactivated(){const r=this.getEntityPermission();return i.get(r,"students.deactivated_students.student_table.actions.resignation_perm")}deactiveActionInStudentTablePermDeactivated(){const r=this.getEntityPermission();return i.get(r,"students.deactivated_students.student_table.actions.deactive_perm")}viewActionInStudentTablePermDeactivated(){const r=this.getEntityPermission();return i.get(r,"students.deactivated_students.student_table.actions.view_perm")}showStudentTablePermCompleted(){const r=this.getEntityPermission();return i.get(r,"students.completed_students.show_perm")}exportListOfStudentInTablePermCompleted(){const r=this.getEntityPermission();return i.get(r,"students.completed_students.student_table.export_list_of_student")}exportESInStudentTablePermCompleted(){const r=this.getEntityPermission();return i.get(r,"students.completed_students.student_table.export_ES")}editActiontInStudentTablePermCompleted(){const r=this.getEntityPermission();return i.get(r,"students.completed_students.student_table.actions.edit_perm")}thumbsupActionInStudentTablePermCompleted(){const r=this.getEntityPermission();return i.get(r,"students.completed_students.student_table.actions.thumbsup")}incignitoActionInStudentTablePermCompleted(){const r=this.getEntityPermission();return i.get(r,"students.completed_students.student_table.actions.incognito")}errorMailActionInStudentTablePermCompleted(){const r=this.getEntityPermission();return i.get(r,"students.completed_students.student_table.actions.error_email")}sendMailActionInStudentTablePermCompleted(){const r=this.getEntityPermission();return i.get(r,"students.completed_students.student_table.actions.send_email")}resignationActionInStudentTablePermCompleted(){const r=this.getEntityPermission();return i.get(r,"students.completed_students.student_table.actions.resignation_perm")}deactiveActionInStudentTablePermCompleted(){const r=this.getEntityPermission();return i.get(r,"students.completed_students.student_table.actions.deactive_perm")}viewActionInStudentTablePermCompleted(){const r=this.getEntityPermission();return i.get(r,"students.completed_students.student_table.actions.view_perm")}showStudentTablePermSuspended(){const r=this.getEntityPermission();return i.get(r,"students.suspended_students.show_perm")}exportListOfStudentInTablePermSuspended(){const r=this.getEntityPermission();return i.get(r,"students.suspended_students.student_table.export_list_of_student")}exportESInStudentTablePermSuspended(){const r=this.getEntityPermission();return i.get(r,"students.suspended_students.student_table.export_ES")}editActiontInStudentTablePermSuspended(){const r=this.getEntityPermission();return i.get(r,"students.suspended_students.student_table.actions.edit_perm")}thumbsupActionInStudentTablePermSuspended(){const r=this.getEntityPermission();return i.get(r,"students.suspended_students.student_table.actions.thumbsup")}incignitoActionInStudentTablePermSuspended(){const r=this.getEntityPermission();return i.get(r,"students.suspended_students.student_table.actions.incognito")}errorMailActionInStudentTablePermSuspended(){const r=this.getEntityPermission();return i.get(r,"students.suspended_students.student_table.actions.error_email")}reactivateActionInStudentTablePermSuspended(){const r=this.getEntityPermission();return i.get(r,"students.suspended_students.student_table.actions.reactivation_perm")}sendMailActionInStudentTablePermSuspended(){const r=this.getEntityPermission();return i.get(r,"students.suspended_students.student_table.actions.send_email")}resignationActionInStudentTablePermSuspended(){const r=this.getEntityPermission();return i.get(r,"students.suspended_students.student_table.actions.resignation_perm")}deactiveActionInStudentTablePermSuspended(){const r=this.getEntityPermission();return i.get(r,"students.suspended_students.student_table.actions.deactive_perm")}showCompaniesTablePerm(){const r=this.getEntityPermission();return i.get(r,"companies.show_perm")}addcompanyPerm(){const r=this.getEntityPermission();return i.get(r,"companies.add_company")}deleteCompanyPerm(){const r=this.getEntityPermission();return i.get(r,"companies.delete_perm")}showsCompanyDetailsTabPerm(){const r=this.getEntityPermission();return i.get(r,"companies.company_details.company_detail.show_perm")}editCompanyDetailsTabPerm(){const r=this.getEntityPermission();return i.get(r,"companies.company_details.company_detail.edit_perm")}revisionCompanyDetailsTabPerm(){const r=this.getEntityPermission();return i.get(r,"companies.company_details.company_detail.revision_perm")}showsCompanyStaffTabPerm(){const r=this.getEntityPermission();return i.get(r,"companies.company_branch.company_staff.show_perm")}addStaffInCompanyStaffTabPerm(){const r=this.getEntityPermission();return i.get(r,"companies.company_branch.company_staff.add_perm")}editActionInCompanyStaffTabPerm(){const r=this.getEntityPermission();return i.get(r,"companies.company_branch.company_staff.actions.edit_perm")}sendMailActionInCompanyStaffTabPerm(){const r=this.getEntityPermission();return i.get(r,"companies.company_branch.company_staff.actions.send_email")}deleteActionInCompanyStaffTabPerm(){const r=this.getEntityPermission();return i.get(r,"companies.company_branch.company_staff.actions.delete_perm")}showsConnectedSchoolTabPerm(){const r=this.getEntityPermission();return i.get(r,"companies.company_details.connected_school.show_perm")}connectSchoolInConnectedSchoolTabPerm(){const r=this.getEntityPermission();return i.get(r,"companies.company_details.connected_school.connect_school")}connectMentorActionInConnectedSchoolTabPerm(){const r=this.getEntityPermission();return i.get(r,"companies.company_details.connected_school.actions.connect_mentor_to_School")}deleteActionInConnectedSchoolTabPerm(){const r=this.getEntityPermission();return i.get(r,"companies.company_details.connected_school.actions.delete_perm")}addNoteInCompany(){const r=this.getEntityPermission();return i.get(r,"companies.company_entity.note.add_note")}editNoteInCompany(){const r=this.getEntityPermission();return i.get(r,"companies.company_entity.note.edit_perm")}addCompanyInCompany(){const r=this.getEntityPermission();return i.get(r,"companies.company_entity.add_company.show_perm")}editCompanyInCompany(){const r=this.getEntityPermission();return i.get(r,"companies.company_branch.edit_company.show_perm")}addOrganization(){const r=this.getEntityPermission();return i.get(r,"companies.organization.add_organization.show_perm")}editOrganization(){const r=this.getEntityPermission();return i.get(r,"companies.organization.edit_organization.show_perm")}deleteOrganization(){const r=this.getEntityPermission();return i.get(r,"companies.organization.delete_organization.show_perm")}addContactInOrganization(){const r=this.getEntityPermission();return i.get(r,"companies.organization.contact.add_contact.show_perm")}editContactInOrganization(){const r=this.getEntityPermission();return i.get(r,"companies.organization.contact.edit_contact.show_perm")}deleteContactInOrganization(){const r=this.getEntityPermission();return i.get(r,"companies.organization.contact.delete_contact.show_perm")}showTaskTablePerm(){const r=this.getEntityPermission();return i.get(r,"tasks.show_perm")}addTaskInTaskTablePerm(){const r=this.getEntityPermission();return i.get(r,"tasks.add_task")}internalTaskInTaskTablePerm(){const r=this.getEntityPermission();return i.get(r,"tasks.internal_task")}addTestTaskInTaskTablePerm(){const r=this.getEntityPermission();return i.get(r,"tasks.add_test_task")}deleteTaskActionInTaskTablePerm(){const r=this.getEntityPermission();return i.get(r,"tasks.actions.delete_task")}editTaskActionInTaskTablePerm(){const r=this.getEntityPermission();return i.get(r,"tasks.actions.edit_perm")}showMailboxTablePerm(){const r=this.getEntityPermission();return i.get(r,"mailbox.show_perm")}composeActionInTaskTablePerm(){const r=this.getEntityPermission();return i.get(r,"mailbox.actions.compose")}sendGroupMailActionInTaskTablePerm(){const r=this.getEntityPermission();return i.get(r,"mailbox.actions.mail_to_group")}urgentMessageActionInTaskTablePerm(){const r=this.getEntityPermission();return i.get(r,"mailbox.actions.urgent_message")}downloadMailActionInTaskTablePerm(){const r=this.getEntityPermission();return i.get(r,"mailbox.actions.download_email")}deleteMailActionInTaskTablePerm(){const r=this.getEntityPermission();return i.get(r,"mailbox.actions.delete")}importantMailActionInTaskTablePerm(){const r=this.getEntityPermission();return i.get(r,"mailbox.actions.important")}showUsersTablePerm(){const r=this.getEntityPermission();return i.get(r,"users.show_perm")}addUserInUsersTablePerm(){const r=this.getEntityPermission();return i.get(r,"users.add_perm")}exportUsersTablePerm(){const r=this.getEntityPermission();return i.get(r,"users.export")}resetUsersTablePerm(){const r=this.getEntityPermission();return i.get(r,"users.actions.btn_reset")}incignitoActionInUsersTablePerm(){const r=this.getEntityPermission();return i.get(r,"users.actions.incognito")}incignitoActionInCandidatePerm(){const r=this.getEntityPermission();return i.get(r,"candidate.candidate_tab.connect_as")}postponeActionInCandidatePerm(){const r=this.getEntityPermission();return i.get(r,"candidate.actions.report_inscription.show_perm")}errorMailActionInUsersTablePerm(){const r=this.getEntityPermission();return i.get(r,"users.actions.error_email")}deleteUserActionInUsersTablePerm(){const r=this.getEntityPermission();return i.get(r,"users.actions.delete_perm")}editUserActionInUsersTablePerm(){const r=this.getEntityPermission();return i.get(r,"users.actions.edit_perm")}sendMailActionInUsersTablePerm(){const r=this.getEntityPermission();return i.get(r,"users.actions.send_email")}reminderRegistrationActionInUsersTablePerm(){const r=this.getEntityPermission();return i.get(r,"users.actions.reminder_reg_user")}showTitleManagementPerm(){const r=this.getEntityPermission();return i.get(r,"parameters.rncp_title_management.show_perm")}addTitleManagementPerm(){const r=this.getEntityPermission();return i.get(r,"parameters.rncp_title_management.add_perm")}editTitleManagementPerm(){const r=this.getEntityPermission();return i.get(r,"parameters.rncp_title_management.edit_perm")}showIdeasPerm(){const r=this.getEntityPermission();return i.get(r,"ideas.show_perm")}shareIdeasPerm(){const r=this.getEntityPermission();return i.get(r,"ideas.actions.share")}replyIdeasPerm(){const r=this.getEntityPermission();return i.get(r,"ideas.actions.reply")}deleteIdeasPerm(){const r=this.getEntityPermission();return i.get(r,"ideas.actions.delete_perm")}detailIdeasPerm(){const r=this.getEntityPermission();return i.get(r,"ideas.actions.details")}showTutorialPerm(){const r=this.getEntityPermission();return i.get(r,"tutorials.show_perm")}addTutorialPerm(){const r=this.getEntityPermission();return i.get(r,"tutorials.add_perm")}deleteTutorialPerm(){const r=this.getEntityPermission();return i.get(r,"tutorials.actions.delete_perm")}editTutorialPerm(){const r=this.getEntityPermission();return i.get(r,"tutorials.actions.edit_perm")}viewTutorialPerm(){const r=this.getEntityPermission();return i.get(r,"tutorials.actions.view_perm")}sendTutorialPerm(){const r=this.getEntityPermission();return i.get(r,"tutorials.actions.send")}addQuestionnaireToolsTemplatePerm(){const r=this.getEntityPermission();return i.get(r,"process.ques_tools.add_perm")}editActionQuestionnaireToolsTemplatePerm(){const r=this.getEntityPermission();return i.get(r,"process.ques_tools.actions.edit_perm")}duplicateActionQuestionnaireToolsTemplatePerm(){const r=this.getEntityPermission();return i.get(r,"process.ques_tools.actions.duplicate_perm")}deleteActionQuestionnaireToolsTemplatePerm(){const r=this.getEntityPermission();return i.get(r,"process.ques_tools.actions.delete_perm")}addFormBuilder(){const r=this.getEntityPermission();return i.get(r,"process.form_builder.actions.btn_add_template")}resetFormBuilder(){const r=this.getEntityPermission();return i.get(r,"process.form_builder.actions.btn_reset")}deleteFormBuilder(){const r=this.getEntityPermission();return i.get(r,"process.form_builder.actions.btn_delete_template")}editFormBuilder(){const r=this.getEntityPermission();return i.get(r,"process.form_builder.actions.btn_edit_template")}duplicateFormBuilder(){const r=this.getEntityPermission();return i.get(r,"process.form_builder.actions.btn_duplicate_template")}addPromoPerm(){const r=this.getEntityPermission();return i.get(r,"promos.add_perm")}editPromoPerm(){const r=this.getEntityPermission();return i.get(r,"promos.actions.edit_perm")}deletePromoPerm(){const r=this.getEntityPermission();return i.get(r,"promos.actions.delete_perm")}viewPromoPerm(){const r=this.getEntityPermission();return i.get(r,"promos.actions.view_perm")}addJuryOrganizationPerm(){const r=this.getEntityPermission();return i.get(r,"certifications.jury_organization.add_perm")}viewActionJuryOrganizationPerm(){const r=this.getEntityPermission();return i.get(r,"certifications.jury_organization.actions.view_perm")}deleteActionJuryOrganizationPerm(){const r=this.getEntityPermission();return i.get(r,"certifications.jury_organization.actions.delete_perm")}editActionJuryOrganizationPerm(){const r=this.getEntityPermission();return i.get(r,"certifications.jury_organization.actions.edit_perm")}viewAssignJuryTabJuryOrganizationPerm(){const r=this.getEntityPermission();return i.get(r,"certifications.jury_organization.jury_organization_assign_jury.show_perm")}viewAssignPresidentTabJuryOrganizationPerm(){const r=this.getEntityPermission();return i.get(r,"certifications.jury_organization.jury_organization_assign_president_jury.show_perm")}viewAssignMemberTabJuryOrganizationPerm(){const r=this.getEntityPermission();return i.get(r,"certifications.jury_organization.jury_organization_assign_member_jury.show_perm")}viewAssignStudentTabJuryOrganizationPerm(){const r=this.getEntityPermission();return i.get(r,"certifications.jury_organization.jury_organization_assign_student.show_perm")}viewScheduleTabJuryOrganizationPerm(){const r=this.getEntityPermission();return i.get(r,"certifications.jury_organization.jury_organization_schedule_jury.show_perm")}transferResponsibilityPerm(){const r=this.getEntityPermission();return i.get(r,"users.transfer_responsibility")}crmOkAdmissionFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.actions.btn_crm_ok")}assignRegistrationProfileMultiple(){const r=this.getEntityPermission();return i.get(r,"candidate.actions.btn_assign_registration_profile_multiple")}firstCallDoneMultipleCandidates(){const r=this.getEntityPermission();return i.get(r,"candidate.actions.btn_1st_call_done_multiple")}firstEmailOfAnnoucmentMultipleCandidates(){const r=this.getEntityPermission();return i.get(r,"candidate.actions.btn_1st_email_of_annoucment_multiple")}transferToAnotherDevCandidate(){const r=this.getEntityPermission();return i.get(r,"candidate.actions.btn_transfer_to_another_dev")}assignRegistrationProfileAdmissionFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.actions.btn_assign_registration_profile")}firstCallDoneAdmissionFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.actions.btn_1st_call_done")}firstEmailOfAnnoucmentAdmissionFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.actions.btn_1st_email_of_annoucment")}transferToAnotherDevAdmissionFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.actions.btn_transfer_to_another_dev_multiple")}assignInternshipFCPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_continuous.actions.btn_assign_internship_exchange")}sendEmailMultipleAdmissionFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.actions.btn_send_email_multiple")}exportCsvAdmissionFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.actions.btn_export_csv")}resetAdmissionFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.actions.btn_reset")}sendEmailAdmissionFollowUpAdmissionFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.actions.btn_send_email")}transferToAnotherProgramAdmissionFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.actions.btn_transfer_another_program")}viewStudentCardAdmissionFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.actions.btn_view_student_card")}viewAdmissionFileAdmissionFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.actions.btn_view_admission_file")}resendRegistrationEmailAdmissionFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.actions.btn_resend_registration_email")}crmOkFollowUpContinuous(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_continuous.actions.btn_crm_ok")}assignRegistrationProfileMultipleFollowUpContinuous(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_continuous.actions.btn_assign_registration_profile_multiple")}firstCallDoneMultipleFollowUpContinuous(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_continuous.actions.btn_1st_call_done_multiple")}firstEmailMultipleFollowUpContinuous(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_continuous.actions.btn_1st_email_of_annoucment_multiple")}transferToAnotherMemberMultipleFollowUpContinuous(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_continuous.actions.btn_transfer_to_another_dev_multiple")}sendEmailMultipleFollowUpContinuous(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_continuous.actions.btn_send_email_multiple")}exportFollowUpContinuous(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_continuous.actions.btn_export_csv")}resetFollowUpContinuous(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_continuous.actions.btn_reset")}assignRegistrationProfileFollowUpContinuous(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_continuous.actions.btn_assign_registration_profile")}firstCallDoneFollowUpContinuous(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_continuous.actions.btn_1st_call_done")}firstEmailFollowUpContinuous(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_continuous.actions.btn_1st_email_of_annoucment")}sendEmailFollowUpContinuous(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_continuous.actions.btn_send_email")}transferToAnotherMemberFollowUpContinuous(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_continuous.actions.btn_transfer_to_another_dev")}transferToAnotherProgramFollowUpContinuous(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_continuous.actions.btn_transfer_another_program")}viewStudentCardFollowUpContinuous(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_continuous.actions.btn_view_student_card")}viewAdmissionFileFollowUpContinuous(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_continuous.actions.btn_view_admission_file")}resendRegistrationEmailFollowUpContinuous(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_continuous.actions.btn_resend_registration_email")}addContractFollowUpContract(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_contract.actions.btn_add_contract")}sendEmailFollowUpContract(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_contract.actions.btn_send_email")}sendReminderFollowUpContract(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_contract.actions.btn_send_reminder")}viewStudentCardFollowUpContract(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_contract.actions.btn_view_student_card")}viewAdmissionContractFollowUpContract(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_contract.actions.btn_view_admission_contract")}editFollowUpContractPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.follow_up_contract.edit_perm")}exportCourseSequencePerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"courses_sequences.btn_export")}resetCourseSequencePerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"courses_sequences.btn_reset")}addSubjectCourseSequencePerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"courses_sequences.btn_add_subject")}addTemplatePerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.template.create_perm")}exportTemplatePerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.template.export_perm")}resetTemplatePerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.template.actions.btn_reset")}duplicateTemplatePerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.template.actions.btn_duplicate")}deleteTemplatePerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.template.actions.btn_delete")}editTemplatePerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.template.edit_perm")}addSequencePerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.sequence.create_perm")}exportSequencePerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.sequence.export_perm")}resetSequencePerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.sequence.actions.btn_reset")}deleteSequencePerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.sequence.actions.btn_delete")}duplicateSequencePerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.sequence.actions.btn_duplicate")}editSequencePerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.sequence.edit_perm")}templateImportModulePerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.module.actions.btn_template_import")}importModulePerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.module.actions.btn_import_module")}resetModulePerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.module.actions.btn_reset")}deleteModulePerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.module.actions.btn_delete")}addModulePerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.module.create_perm")}exportModulePerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.module.export_perm")}editModulePerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.module.edit_perm")}addSubjectPerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.subject.create_perm")}exportSubjectPerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.subject.export_perm")}editSubjectPerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.subject.edit_perm")}templateImportSubjectPerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.subject.actions.btn_template_import")}importSubjectPerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.subject.actions.btn_import_subject")}resetSubjectPerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.subject.actions.btn_reset")}deleteSubjectPerm(){const r=this.getEntityPermission();return i.get(r,"courses_sequences.subject.actions.btn_delete")}addUsersTabPermission(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"users.add.send_email")}sendEmailUsersTabPermission(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"users.actions.send_email")}transferAnotherDevUsersTabPermission(){const r=this.getEntityPermission();return i.get(r,"users.actions.btn_transfer_another_dev")}transferAnotherProgramUsersTabPermission(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"users.actions.btn_transfer_another_program")}viewStudentCardUsersTabPermission(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"users.actions.btn_view_student_card")}viewAdmissionFileUsersTabPermission(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"users.actions.btn_view_admission_file")}resendRegistratUsersTabPermission(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"users.actions.btn_resend_registration_email")}importAdmissionOscarPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.oscar_campus.actions.btn_import")}assignProgramAdmissionOscarPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.oscar_campus.actions.btn_assign_program")}getAdmissionOscarStudentsPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.oscar_campus.actions.btn_get_oscar_student")}exportAdmissionOscarPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.oscar_campus.actions.btn_export")}resetAdmissionOscarPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.oscar_campus.actions.btn_reset")}assignProgramAdmissionHubspotPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.hubspot.actions.btn_assign_program")}getAdmissionHubspotStudentsPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.hubspot.actions.btn_get_hubspot_student")}exportAdmissionHubspotPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.hubspot.actions.btn_export")}resetAdmissionHubspotPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.hubspot.actions.btn_reset")}generateBillingFinanceFollowUp(){const r=this.getEntityPermission();return i.get(r,"finance.follow_up.actions.btn_generate_billing")}askingPaymentFinanceFollowUp(){const r=this.getEntityPermission();return i.get(r,"finance.follow_up.actions.btn_asking_payment")}sendMailMultipleFinanceFollowUp(){const r=this.getEntityPermission();return i.get(r,"finance.follow_up.actions.btn_send_mail_multiple")}sendEmailFinanceFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"finance.follow_up.actions.btn_send_email")}addPaymentFinanceFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"finance.follow_up.actions.add_payment")}viewStudentCardFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"finance.follow_up.actions.btn_view_student_card")}editFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"finance.follow_up.actions.btn_edit_term")}exportFinanceFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"finance.follow_up.actions.btn_export")}resetFinanceFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"finance.follow_up.actions.btn_reset")}generateBillingInFollowUpOrganization(){const r=this.getEntityPermission();return i.get(r,"finance.follow_up_organization.actions.btn_generate_billing")}assignTimelineTemplateMultipleInFollowUpOrganization(){const r=this.getEntityPermission();return i.get(r,"finance.follow_up_organization.actions.btn_assign_timeline_multiple")}sendMailMultipleInFollowUpOrganization(){const r=this.getEntityPermission();return i.get(r,"finance.follow_up_organization.actions.btn_send_mail_multiple")}exportInFollowUpOrganization(){const r=this.getEntityPermission();return i.get(r,"finance.follow_up_organization.actions.btn_export")}resetInFollowUpOrganization(){const r=this.getEntityPermission();return i.get(r,"finance.follow_up_organization.actions.btn_reset")}sendMailInFollowUpOrganization(){const r=this.getEntityPermission();return i.get(r,"finance.follow_up_organization.actions.btn_send_email")}addPaymentInFollowUpOrganization(){const r=this.getEntityPermission();return i.get(r,"finance.follow_up_organization.actions.add_payment")}editTermInFollowUpOrganization(){const r=this.getEntityPermission();return i.get(r,"finance.follow_up_organization.actions.btn_edit_term")}viewStudentCardInFollowUpOrganization(){const r=this.getEntityPermission();return i.get(r,"finance.follow_up_organization.actions.btn_view_student_card")}assignTimelineInFollowUpOrganization(){const r=this.getEntityPermission();return i.get(r,"finance.follow_up_organization.actions.btn_assign_timeline")}createTimelineTemplate(){const r=this.getEntityPermission();return i.get(r,"finance.timeline_template.create_timeline_template.show_perm")}editTimelineTemplate(){const r=this.getEntityPermission();return i.get(r,"finance.timeline_template.edit_timeline_template.show_perm")}deleteTimelineTemplate(){const r=this.getEntityPermission();return i.get(r,"finance.timeline_template.delete_timeline_template.show_perm")}operationLinesShowNotExportedTabPermission(){const r=this.getEntityPermission();return i.get(r,"finance.operation_lines.not_exported.show_perm")}operationLinesShowExportedTabPermission(){const r=this.getEntityPermission();return i.get(r,"finance.operation_lines.exported.show_perm")}operationLinesNotExportedTabActionExportSagePermission(){const r=this.getEntityPermission();return i.get(r,"finance.operation_lines.not_exported.actions.export_sage")}operationLinesNotExportedTabActionExportLinesToExportPermission(){const r=this.getEntityPermission();return i.get(r,"finance.operation_lines.not_exported.actions.export_lines_to_export")}operationLinesNotExportedTabActionExportLinesExportedPermission(){const r=this.getEntityPermission();return i.get(r,"finance.operation_lines.not_exported.actions.export_lines_exported")}operationLinesNotExportedTabActionExportAllLinesPermission(){const r=this.getEntityPermission();return i.get(r,"finance.operation_lines.not_exported.actions.export_all_lines")}operationLinesNotExportedTabActionResetPermission(){const r=this.getEntityPermission();return i.get(r,"finance.operation_lines.not_exported.actions.btn_reset")}operationLinesExportedTabActionResetPermission(){const r=this.getEntityPermission();return i.get(r,"finance.operation_lines.exported.btn_reset")}unbalancedBalanceActionExportPermission(){const r=this.getEntityPermission();return i.get(r,"finance.unbalanced_balance.actions.btn_export")}unbalancedBalanceActionResetPermission(){const r=this.getEntityPermission();return i.get(r,"finance.unbalanced_balance.actions.btn_reset")}unbalancedBalanceActionSendSchoolContractAmandementPermission(){const r=this.getEntityPermission();return i.get(r,"finance.unbalanced_balance.actions.send_school_contract_amendment")}masterTableTransactionShowPermission(){const r=this.getEntityPermission();return i.get(r,"finance.master_table_transaction.show_perm")}masterTableTransactionActionExportPermission(){const r=this.getEntityPermission();return i.get(r,"finance.master_table_transaction.actions.btn_export")}masterTableTransactionActionViewTransactionPermission(){const r=this.getEntityPermission();return i.get(r,"finance.master_table_transaction.actions.btn_view_transaction")}masterTableTransactionActionViewDetailPermission(){const r=this.getEntityPermission();return i.get(r,"finance.master_table_transaction.actions.btn_view_detail")}masterTableTransactionActionViewStudentCardPermission(){const r=this.getEntityPermission();return i.get(r,"finance.master_table_transaction.actions.btn_view_student_card")}exportAlumniFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"alumni.follow_up.actions.btn_export")}sendSurveyMultipleAlumniFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"alumni.follow_up.actions.btn_send_survey_multiple")}sendSurveyAlumniFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"alumni.follow_up.actions.btn_send_survey")}sendEmailAlumniFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"alumni.follow_up.actions.btn_send_email")}viewAlumniFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"alumni.follow_up.actions.btn_view_alumni_card")}resetAlumniFollowUpPerm(){const r=this.getEntityPermission();return i.get(r,"alumni.follow_up.actions.btn_reset")}editAlumniCard(){const r=this.getEntityPermission();return i.get(r,"alumni.card.edit_perm")}sendTheFormContractManagementPerm(){const r=this.getEntityPermission();return i.get(r,"contracts.contract_process.actions.btn_send_the_form")}templateForImportContractManagementPerm(){const r=this.getEntityPermission();return i.get(r,"contracts.contract_process.actions.btn_template_for_import")}importContractManagementPerm(){const r=this.getEntityPermission();return i.get(r,"contracts.contract_process.actions.btn_import_contract")}newContractManagementPerm(){const r=this.getEntityPermission();return i.get(r,"contracts.contract_process.actions.btn_new_contract")}resetContractManagementPerm(){const r=this.getEntityPermission();return i.get(r,"contracts.contract_process.actions.btn_reset")}goToFormContractManagementPerm(){const r=this.getEntityPermission();return i.get(r,"contracts.contract_process.actions.btn_go_to_form")}editContractManagementPerm(){const r=this.getEntityPermission();return i.get(r,"contracts.contract_process.actions.btn_edit_contract")}sendReminderContractManagementPerm(){const r=this.getEntityPermission();return i.get(r,"contracts.contract_process.actions.btn_send_reminder")}sendEmailContractManagementPerm(){const r=this.getEntityPermission();return i.get(r,"contracts.contract_process.actions.btn_send_email")}additionalDocumentContractManagementPerm(){const r=this.getEntityPermission();return i.get(r,"contracts.contract_process.actions.btn_additional_document")}removeContractManagementPerm(){const r=this.getEntityPermission();return i.get(r,"contracts.contract_process.actions.btn_remove_contract")}contractTemplateDetailPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"contracts.contract_template.actions.btn_contract_template_detail")}resetContractTemplatePerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"contracts.contract_template.actions.btn_reset")}resetInAppTutorial(){const r=this.getEntityPermission();return i.get(r,"tutorials.inapp_tutorials.actions.btn_reset")}addInAppTutorial(){const r=this.getEntityPermission();return i.get(r,"tutorials.inapp_tutorials.actions.btn_add_tutorial")}publishInAppTutorial(){const r=this.getEntityPermission();return i.get(r,"tutorials.inapp_tutorials.actions.btn_publish_tutorial")}editInAppTutorial(){const r=this.getEntityPermission();return i.get(r,"tutorials.inapp_tutorials.edit_perm")}deleteInAppTutorial(){const r=this.getEntityPermission();return i.get(r,"tutorials.inapp_tutorials.actions.btn_delete_tutorial")}viewInAppTutorial(){const r=this.getEntityPermission();return i.get(r,"tutorials.inapp_tutorials.actions.btn_view_tutorial")}deleteInAppTutorialPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"tutorials.actions.delete_perm")}editInAppTutorialPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"tutorials.edit_perm")}addInAppTutorialPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"tutorials.add_perm")}viewInAppTutorialPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"tutorials.actions.view_perm")}publishUnpublishInAppTutorialPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"tutorials.actions.edit_perm")}editFlyersAdmissionChannelPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.admission_channel.actions.btn_edit_flyers")}downloadFlyersAdmissionChannelPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.admission_channel.actions.btn_download_flyers")}editConditionAdmissionChannelPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.admission_channel.actions.btn_edit_condition")}downloadConditionAdmissionChannelPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.admission_channel.actions.btn_download_condition")}exportCsvAdmissionChannelPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.admission_channel.actions.btn_export_csv")}resetAdmissionChannelPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.admission_channel.actions.btn_reset")}editImportObjective(){const r=this.getEntityPermission();return i.get(r,"setting.import_objective.edit_perm")}editImportObjectiveFinance(){const r=this.getEntityPermission();return i.get(r,"setting.import_objective_finance.edit_perm")}editImportFinanceN1(){const r=this.getEntityPermission();return i.get(r,"setting.import_finance_n1.edit_perm")}editNotificationManagementPerm(){const r=this.getEntityPermission();return i.get(r,"setting.notification_management.actions.btn_edit_notification")}editNotificationManagement(){const r=this.getEntityPermission();return i.get(r,"setting.notification_management.edit_perm")}resetNotificationManagementPerm(){const r=this.getEntityPermission();return i.get(r,"setting.notification_management.actions.btn_reset")}deleteTemplateNotificationManagementPerm(){const r=this.getEntityPermission();return i.get(r,"setting.notification_management.actions.btn_delete_template")}editTemplateNotificationManagementPerm(){const r=this.getEntityPermission();return i.get(r,"setting.notification_management.actions.btn_edit_template")}addTemplateNotificationManagementPerm(){const r=this.getEntityPermission();return i.get(r,"setting.notification_management.actions.btn_add_template")}viewTemplateNotificationManagementPerm(){const r=this.getEntityPermission();return i.get(r,"setting.notification_management.actions.btn_view_template")}resetTemplateNotificationManagementPerm(){const r=this.getEntityPermission();return i.get(r,"setting.notification_management.actions.btn_reset_template")}editFullRatePerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.full_rate.actions.btn_edit_mode")}importFullRatePerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.full_rate.actions.btn_import")}exportFullRatePerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.full_rate.actions.btn_export")}deleteAdditionalExpensesPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.additional_expenses.actions.btn_delete_additional_expenses")}editAdditionalExpensesPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.additional_expenses.actions.btn_edit_additional_expenses")}addAdditionalExpensesPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.additional_expenses.actions.btn_add_additional_expenses")}exportCsvAdditionalExpensesPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.additional_expenses.actions.btn_export_csv")}resetAdditionalExpensesPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.additional_expenses.actions.btn_reset")}deletePaymentMode(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.payment_mode.actions.btn_delete_payment_mode")}editPaymentMode(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.payment_mode.actions.btn_edit_payment_mode")}addPaymentMode(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.payment_mode.actions.btn_add_payment_mode")}exportCsvPaymentMode(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.payment_mode.actions.btn_export_csv")}resetPaymentMode(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.payment_mode.actions.btn_reset")}deletePaymentModePerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.payment_mode.actions.btn_delete_payment_mode")}editPaymentModePerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.payment_mode.actions.btn_edit_payment_mode")}addPaymentModePerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.payment_mode.actions.btn_add_payment_mode")}exportCsvPaymentModePerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.payment_mode.actions.btn_export_csv")}resetPaymentModePerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.payment_mode.actions.btn_reset")}deleteMassageStepsPerm(){const r=this.getEntityPermission();return i.get(r,"setting.message_step.actions.btn_delete_message_step")}editMassageStepsPerm(){const r=this.getEntityPermission();return i.get(r,"setting.message_step.actions.btn_edit_message_step")}addMassageStepsPerm(){const r=this.getEntityPermission();return i.get(r,"setting.message_step.actions.btn_add_message_step")}viewMassageStepsPerm(){const r=this.getEntityPermission();return i.get(r,"setting.message_step.actions.btn_view_message_step")}sendByEmailMassageStepsPerm(){const r=this.getEntityPermission();return i.get(r,"setting.message_step.actions.btn_send_email")}duplicateMassageStepsPerm(){const r=this.getEntityPermission();return i.get(r,"setting.message_step.actions.btn_duplicate_message_step")}publishUnpublishMassageStepsPerm(){const r=this.getEntityPermission();return i.get(r,"setting.message_step.actions.btn_publish_message_step")}exportCsvMassageStepsPerm(){const r=this.getEntityPermission();return i.get(r,"setting.message_step.actions.btn_export_csv")}resetMassageStepsPerm(){const r=this.getEntityPermission();return i.get(r,"setting.message_step.actions.btn_reset")}deleteDiaposExternalPerm(){const r=this.getEntityPermission();return i.get(r,"setting.external_promotion.actions.btn_delete_diapos_external")}editDiaposExternalPerm(){const r=this.getEntityPermission();return i.get(r,"setting.external_promotion.actions.btn_edit_diapos_external")}addDiaposExternalPerm(){const r=this.getEntityPermission();return i.get(r,"setting.external_promotion.actions.btn_add_diapos_external")}viewDiaposExternalPerm(){const r=this.getEntityPermission();return i.get(r,"setting.external_promotion.actions.btn_view_diapos_external")}sendEmailDiaposExternalPerm(){const r=this.getEntityPermission();return i.get(r,"setting.external_promotion.actions.btn_send_email")}duplicateDiaposExternalPerm(){const r=this.getEntityPermission();return i.get(r,"setting.external_promotion.actions.btn_duplicate_diapos_external")}publishUnpublishDiaposExternalPerm(){const r=this.getEntityPermission();return i.get(r,"setting.external_promotion.actions.btn_publish_diapos_external")}exportCsvDiaposExternalPerm(){const r=this.getEntityPermission();return i.get(r,"setting.external_promotion.actions.btn_export_csv")}resetDiaposExternalPerm(){const r=this.getEntityPermission();return i.get(r,"setting.external_promotion.actions.btn_reset")}addScholarSeason(){const r=this.getEntityPermission();return i.get(r,"intake_channel.scholar_season.actions.btn_add_scholar_season")}resetScholarSeason(){const r=this.getEntityPermission();return i.get(r,"intake_channel.scholar_season.actions.btn_reset")}publishScholarSeason(){const r=this.getEntityPermission();return i.get(r,"intake_channel.scholar_season.actions.btn_publish")}editScholarSeason(){const r=this.getEntityPermission();return i.get(r,"intake_channel.scholar_season.actions.btn_edit")}deleteScholarSeason(){const r=this.getEntityPermission();return i.get(r,"intake_channel.scholar_season.actions.btn_delete")}addSchoolProgram(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.program.actions.btn_add_program")}exportSchoolProgram(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.program.actions.btn_export_csv")}resetSchoolProgram(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.program.actions.btn_reset")}deleteSchoolProgram(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.program.actions.btn_delete_program")}addSchoolInIntakeChanelSchool(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.actions.btn_add_school")}editSchoolInIntakeChanelSchool(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.actions.btn_edit_school")}showProgramIntakeChanelSchool(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.program.show_perm")}showDownPaymentIntakeChanelSchool(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.down_payment.show_perm")}showFullRateIntakeChanelSchool(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.full_rate.show_perm")}showLegalIntakeChanelSchool(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.legal.show_perm")}showAdmissionIntakeChanelSchool(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.admission.show_perm")}showCourseSequenceIntakeChanelSchool(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.course_sequence.show_perm")}deleteIntakeChannelSchoolTabPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.school.actions.btn_delete_school")}editIntakeChannelSchoolTabPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.notification_management.actions.btn_edit_school")}addIntakeChannelSchoolTabPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.notification_management.actions.btn_add_school")}exportCsvIntakeChannelSchoolTabPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.notification_management.actions.btn_export_csv")}resetIntakeChannelSchoolTabPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.notification_management.actions.btn_reset")}exportCsvIntakeChannelSchoolDownPaymentTabPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.down_payment.actions.btn_export_csv")}importIntakeChannelSchoolDownPaymentTabPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.down_payment.actions.btn_import_down_payment")}editPermIntakeChannelSchoolDownPaymentTabPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.down_payment.edit_perm")}exportCsvIntakeChannelSchoolFullRatetPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.full_rate.actions.btn_export_csv")}importIntakeChannelSchoolFullRatetTabPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.full_rate.actions.btn_import_full_rate")}editPermIntakeChannelSchoolFullRatetTabPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.full_rate.edit_perm")}resetIntakeChannelSchoolLegalTabPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.legal.actions.btn_reset")}exportCsvIntakeChannelSchoolLegalTabPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.legal.actions.btn_export_csv")}connectLegalEntityIntakeChannelSchoolLegalTabPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.legal.actions.btn_connect_legal_entity")}paidAllowanceRateIntakeChannelSchoolLegalTabPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.legal.actions.btn_paid_allowance_rate")}inducedHoursIntakeChannelSchoolLegalTabPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.legal.actions.btn_induced_hours")}resetIntakeChannelSchoolAdmissionTabPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.admission.actions.btn_reset")}exportCsvIntakeChannelSchoolAdmissionTabPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.admission.actions.btn_export_csv")}addConditionMultipleIntakeChannelSchoolAdmissionTabPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.admission.actions.btn_add_condition_multiple")}removeRegistrationProfileIntakeChannelSchoolAdmissionTabPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.admission.actions.btn_remove_registration_profile")}addRegistrationProfileIntakeChannelSchoolAdmissionTabPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.admission.actions.btn_add_registration_profile")}editPermIntakeChannelSchoolAdmissionTabPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.admission.edit_perm")}editPermIntakeChannelSchoolCoursesSequencesTabPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.course_sequence.edit_perm")}resetIntakeChannelSchoolCoursesSequencesTabPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.course_sequence.actions.btn_reset")}connectTemplateIntakeChannelSchoolCoursesSequencesTabPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.course_sequence.actions.btn_connect_template")}detailsIntakeChannelSchoolCoursesSequencesTabPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.school.course_sequence.actions.btn_details")}editIntakeChannelLevelByCampusPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.level_by_campus.btn_edit_level")}exportIntakeChannelLevelByCampusPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.level_by_campus.actions.btn_export_csv")}resetIntakeChannelLevelByCampusPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.level_by_campus.actions.btn_reset")}deleteIntakeChannelSectorPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.sector.actions.btn_delete_sector")}editIntakeChannelSectorPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.sector.actions.btn_edit_sector")}exportIntakeChannelSectorPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.sector.actions.btn_export_csv")}addIntakeChannelSectorPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.sector.actions.btn_add_sector")}deleteIntakeChannelSpecialityPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.speciality.actions.btn_delete_speciality")}editIntakeChannelSpecialityPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.speciality.actions.btn_edit_speciality")}addIntakeChannelSpecialityPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.speciality.actions.btn_add_speciality")}exportCsvIntakeChannelSpecialityPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.speciality.actions.btn_export_csv")}resetIntakeChannelSpecialityPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.speciality.actions.btn_reset")}editIntakeChannelDownPaymentPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.down_payment.actions.btn_edit_mode")}importIntakeChannelDownPaymentPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.down_payment.actions.btn_import")}exportIntakeChannelDownPaymentPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.down_payment.actions.btn_export")}reconciliationFinanceHistoryPerm(){const r=this.getEntityPermission();return i.get(r,"finance.history.actions.btn_reconciliation")}lettrageFinanceHistoryPerm(){const r=this.getEntityPermission();return i.get(r,"finance.history.actions.btn_lettrage")}seeStudentFileFinanceHistoryPerm(){const r=this.getEntityPermission();return i.get(r,"finance.history.actions.btn_see_student_file")}createInternalTaskFinanceHistoryPerm(){const r=this.getEntityPermission();return i.get(r,"finance.history.actions.btn_create_internal_task")}sendEmailFinanceHistoryPerm(){const r=this.getEntityPermission();return i.get(r,"finance.history.actions.btn_send_email")}exportCsvFinanceHistoryPerm(){const r=this.getEntityPermission();return i.get(r,"finance.history.actions.btn_export_csv")}filterTodayFinanceHistoryPerm(){const r=this.getEntityPermission();return i.get(r,"finance.history.actions.btn_filter_today")}filterYesterdayFinanceHistoryPerm(){const r=this.getEntityPermission();return i.get(r,"finance.history.actions.btn_filter_yesterday")}filterLast7DaysFinanceHistoryPerm(){const r=this.getEntityPermission();return i.get(r,"finance.history.actions.btn_filter_last_7_days")}filterLast30DaysFinanceHistoryPerm(){const r=this.getEntityPermission();return i.get(r,"finance.history.actions.btn_filter_last_30_days")}filterThisMonthFinanceHistoryPerm(){const r=this.getEntityPermission();return i.get(r,"finance.history.actions.btn_filter_this_month")}resetFinanceHistoryPerm(){const r=this.getEntityPermission();return i.get(r,"finance.history.actions.btn_reset")}exportCsvFinanceTransactionPerm(){const r=this.getEntityPermission();return i.get(r,"finance.transaction_report.actions.btn_export_csv")}filterTodayFinanceTransactionPerm(){const r=this.getEntityPermission();return i.get(r,"finance.transaction_report.actions.btn_filter_today")}filterYesterdayFinanceTransactionPerm(){const r=this.getEntityPermission();return i.get(r,"finance.transaction_report.actions.btn_filter_yesterday")}filterLast7DaysFinanceTransactionPerm(){const r=this.getEntityPermission();return i.get(r,"finance.transaction_report.actions.btn_filter_last_7_days")}filterLast30DaysFinanceTransactionPerm(){const r=this.getEntityPermission();return i.get(r,"finance.transaction_report.actions.btn_filter_last_30_days")}viewDetailsFinanceTransactionPerm(){const r=this.getEntityPermission();return i.get(r,"finance.transaction_report.actions.btn_view_transaction_detail")}resetFinanceTransactionPerm(){const r=this.getEntityPermission();return i.get(r,"finance.transaction_report.actions.btn_reset")}exportCsvFinanceBalanceReportPerm(){const r=this.getEntityPermission();return i.get(r,"finance.balance_report.actions.btn_export_csv")}resetFinanceBalanceReportPerm(){const r=this.getEntityPermission();return i.get(r,"finance.balance_report.actions.btn_reset")}filterTodayFinanceBalanceReportPerm(){const r=this.getEntityPermission();return i.get(r,"finance.balance_report.actions.btn_filter_today")}filterYesterdayFinanceBalanceReportPerm(){const r=this.getEntityPermission();return i.get(r,"finance.balance_report.actions.btn_filter_yesterday")}filterLast7DaysFinanceBalanceReportPerm(){const r=this.getEntityPermission();return i.get(r,"finance.balance_report.actions.btn_filter_last_7_days")}filterLast30DaysFinanceBalanceReportPerm(){const r=this.getEntityPermission();return i.get(r,"finance.balance_report.actions.btn_filter_last_30_days")}viewBalanceDetailFinanceBalanceReportPerm(){const r=this.getEntityPermission();return i.get(r,"finance.balance_report.actions.btn_view_transaction_detail")}editPermCandidate(){const r=this.getEntityPermission();return i.get(r,"candidate.edit_perm")}addCommentCandidateCommentariesPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"candidate.commentaries.actions.btn_add_comment")}deleteCommentCandidateCommentariesPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"candidate.commentaries.actions.btn_delete_comment")}editCommentCandidateCommentariesPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"candidate.commentaries.actions.btn_edit_comment")}replyCommentCandidateCommentariesPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"candidate.commentaries.actions.btn_reply_comment")}resetCandidateCommentariesPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"candidate.commentaries.actions.btn_reset")}addRegistrationProfile(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.registration_profile.actions.btn_add_registration_profile")}exportRegistrationProfile(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.registration_profile.actions.btn_add_export")}resetRegistrationProfile(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.registration_profile.actions.btn_reset")}editRegistrationProfile(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.registration_profile.actions.btn_edit")}deleteRegistrationProfile(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.registration_profile.actions.btn_delete")}deleteRegistrationProfilePerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.registration_profile.actions.btn_delete_registration_profile")}editRegistrationProfilePerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.registration_profile.actions.btn_edit_registration_profile")}addRegistrationProfilePerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.registration_profile.actions.btn_add_registration_profile")}exportCsvRegistrationProfilePerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.registration_profile.actions.btn_export_csv")}resetRegistrationProfilePerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.registration_profile.actions.btn_reset")}addSettingLegalEntity(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.legal_entities.actions.btn_add_legal_entity")}exportSettingLegalEntity(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.legal_entities.actions.btn_export_csv")}resetSettingLegalEntity(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.legal_entities.actions.btn_reset")}editSettingLegalEntity(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.legal_entities.actions.btn_edit_legal_entity")}deleteSettingLegalEntity(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.legal_entities.actions.btn_delete_legal_entity")}viewSettingLegalEntity(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.legal_entities.actions.btn_view_legal_entity")}publishSettingLegalEntity(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.legal_entities.actions.btn_publish_or_unpublish_legal_entity")}deleteLegalEntityPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.legal_entities.actions.btn_delete_legal_entity")}publishUnpublisLegalEntityPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.legal_entities.actions.btn_publish_or_unpublish_legal_entity")}viewLegalEntityPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.legal_entities.actions.btn_view_legal_entity")}addLegalEntityPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.legal_entities.actions.btn_add_legal_entity")}exportCsvLegalEntityPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.legal_entities.actions.btn_export_csv")}resetLegalEntityPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.legal_entities.actions.btn_reset")}addPaidLeaveAllowanceAccountingPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.accounting_tab.actions.btn_add_paid_leave_allowance")}addInducedHoursCoefficientAccountingPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.accounting_tab.actions.btn_add_induced_hours_coefficient")}connectLegalEntityAccountingPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.accounting_tab.actions.btn_connect_legal_entity")}addAccountingNumberPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.accounting_tab.actions.btn_add_acounting_number")}addAnalyticalCodeAccountingPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.accounting_tab.actions.btn_add_analytical_code")}exportCsvAccountingPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.accounting_tab.actions.btn_export_csv")}resetAccountingPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.accounting_tab.actions.btn_reset")}showAddtionalCostPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.additional_expense.show_perm")}exportAddtionalCostPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.additional_expense.actions.btn_export_additional_expense")}addNewAddtionalCostPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.additional_expense.actions.btn_add_additional_expense")}resetAddtionalExpensePerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.additional_expense.actions.btn_reset")}editAddtionalCostPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.additional_expense.actions.btn_edit_additional_expense")}deleteAddtionalCostPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.additional_expense.actions.btn_delete_additional_expense")}addSpecialityPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.speciality.actions.btn_add_speciality")}deleteSpecialityPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.speciality.actions.btn_delete_speciality")}editSpecialityPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.speciality.actions.btn_edit_speciality")}exportSpecialityPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.speciality.actions.btn_export_csv")}resetSpecialityPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.speciality.actions.btn_reset")}addLevelPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.level.actions.btn_add_level")}resetLevelPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.level.actions.btn_reset")}deleteLevelPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.level.actions.btn_delete")}editLevelPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.level.actions.btn_edit")}addSitePerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.site.actions.btn_add_site")}resetSitePerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.site.actions.btn_reset")}deleteSitePerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.site.actions.btn_delete")}editSitePerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.site.actions.btn_edit")}addSectorPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.sector.actions.btn_add_sector")}resetSectorPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.sector.actions.btn_reset")}deleteSectorPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.sector.actions.btn_delete_sector")}editSectorPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.sector.actions.btn_edit_sector")}exportSectorPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.sector.actions.btn_export_csv")}addSiteCampus(){const r=this.getEntityPermission();return i.get(r,"intake_channel.campus.actions.btn_add_site_campus")}pinSiteCampus(){const r=this.getEntityPermission();return i.get(r,"intake_channel.campus.actions.btn_pin")}editSiteCampus(){const r=this.getEntityPermission();return i.get(r,"intake_channel.campus.actions.btn_edit")}deleteSiteCampus(){const r=this.getEntityPermission();return i.get(r,"intake_channel.campus.actions.btn_delete")}saveSiteCampus(){const r=this.getEntityPermission();return i.get(r,"intake_channel.campus.edit_perm")}addCampusPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.campus.actions.btn_pin")}deleteCampusPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.campus.actions.btn_edit")}editCampusPerm(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"intake_channel.campus.actions.btn_delete")}addTypeOfFormationPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.type_of_formation.actions.btn_add_type_of_formation")}deleteTypeOfFormationPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.type_of_formation.actions.btn_delete_type_of_formation")}editTypeofFormationPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.type_of_formation.actions.btn_edit_type_of_formation")}exportCsvTypeOfFormationPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.type_of_formation.actions.btn_export_csv")}resetTypeOfFormationPerm(){const r=this.getEntityPermission();return i.get(r,"intake_channel.setting.type_of_formation.actions.btn_reset")}financialSituationInReadmissionAssignment(){const r=this.getEntityPermission();return i.get(r,"readmission.assignment.actions.btn_financial_situation")}templateImportInReadmissionAssignment(){const r=this.getEntityPermission();return i.get(r,"readmission.assignment.actions.btn_template_import")}importFileInReadmissionAssignment(){const r=this.getEntityPermission();return i.get(r,"readmission.assignment.actions.btn_import_file")}assignmentEditJuryDecision(){const r=this.getEntityPermission();return i.get(r,"readmission.assignment.actions.btn_edit_jury_decision")}assignmentEditProgramDesired(){const r=this.getEntityPermission();return i.get(r,"readmission.assignment.actions.btn_edit_program_desired")}assignmentAssignProgramMultiple(){const r=this.getEntityPermission();return i.get(r,"readmission.assignment.actions.btn_assign_program_multiple")}assignmentAssignProgram(){const r=this.getEntityPermission();return i.get(r,"readmission.assignment.actions.btn_assign_program")}assignmentSendEmail(){const r=this.getEntityPermission();return i.get(r,"readmission.assignment.actions.btn_send_email")}assignmentExport(){const r=this.getEntityPermission();return i.get(r,"readmission.assignment.actions.btn_export")}assignmentReset(){const r=this.getEntityPermission();return i.get(r,"readmission.assignment.actions.btn_reset")}assignmentViewStudentCard(){const r=this.getEntityPermission();return i.get(r,"readmission.assignment.actions.btn_view_student_card")}followUpAssignRegistrationProfileMultiple(){const r=this.getEntityPermission();return i.get(r,"readmission.follow_up.actions.btn_assign_registration_profile_multiple")}followUpAdmissionEmailMultiple(){const r=this.getEntityPermission();return i.get(r,"readmission.follow_up.actions.btn_admission_email_multiple")}followUpSendEmailMultiple(){const r=this.getEntityPermission();return i.get(r,"readmission.follow_up.actions.btn_send_email_multiple")}followUpSendReminder(){const r=this.getEntityPermission();return i.get(r,"readmission.follow_up.actions.btn_send_reminder")}followUpEditJuryDecision(){const r=this.getEntityPermission();return i.get(r,"readmission.follow_up.actions.btn_edit_jury_decision")}followUpTransferToAnotherDevMultiple(){const r=this.getEntityPermission();return i.get(r,"readmission.follow_up.actions.btn_transfer_to_another_dev_multiple")}followUpAssignRegistrationProfile(){const r=this.getEntityPermission();return i.get(r,"readmission.follow_up.actions.btn_assign_registration_profile")}followUpAdmissionEmail(){const r=this.getEntityPermission();return i.get(r,"readmission.follow_up.actions.btn_admission_email")}followUpSendEmail(){const r=this.getEntityPermission();return i.get(r,"readmission.follow_up.actions.btn_send_email")}followUpExport(){const r=this.getEntityPermission();return i.get(r,"readmission.follow_up.actions.btn_export")}followUpReset(){const r=this.getEntityPermission();return i.get(r,"readmission.follow_up.actions.btn_reset")}followUpTransferToAnotherDev(){const r=this.getEntityPermission();return i.get(r,"readmission.follow_up.actions.btn_transfer_to_another_dev")}followUpTransferToAnotherProgram(){const r=this.getEntityPermission();return i.get(r,"readmission.follow_up.actions.btn_transfer_another_program")}followUpResendRegistrationEmail(){const r=this.getEntityPermission();return i.get(r,"readmission.follow_up.actions.btn_resend_registration_email")}followUpViewStudentCard(){const r=this.getEntityPermission();return i.get(r,"readmission.follow_up.actions.btn_view_student_card")}followUpViewAdmissionFile(){const r=this.getEntityPermission();return i.get(r,"readmission.follow_up.actions.btn_view_admission_file")}allPermisionSearchShowPerm(){const r=this.getEntityPermission();return i.get(r,"quick_search.show_perm")}allPermisionSearchUser(){const r=this.getEntityPermission();return i.get(r,"quick_search.search_user")}allPermisionSearchStudent(){const r=this.getEntityPermission();return i.get(r,"quick_search.search_student")}allPermisionSearchMentor(){const r=this.getEntityPermission();return i.get(r,"quick_search.search_mentor")}allPermisionSearchSchool(){const r=this.getEntityPermission();return i.get(r,"quick_search.search_school")}allPermisionSearchTeacher(){const r=this.getEntityPermission();return i.get(r,"quick_search.search_teacher")}studentsSendEmail(){const r=this.getEntityPermission();return i.get(r,"students.follow_up.actions.btn_send_email")}studentsAssignSequence(){const r=this.getEntityPermission();return i.get(r,"students.follow_up.actions.btn_assign_sequence")}studentsActions(){const r=this.getEntityPermission(),B=this.studentsSendEmail(),K=this.studentsAssignSequence();return i.get(r,"students.follow_up.show_perm")&&(B||K)}studentsExport(){const r=this.getEntityPermission();return i.get(r,"students.follow_up.actions.btn_export")}studentsTrombinoscopeExport(){const r=this.getEntityPermission();return i.get(r,"students.trombinoscope.actions.btn_export_pdf")}studentsAllStudentsEditPerm(){const r=this.getEntityPermission();return i.get(r,"students.all_students.actions.edit_perm")}studentsAllStudentsExport(){const r=this.getEntityPermission();return i.get(r,"students.all_students.actions.btn_export")}studentsAllStudentsReset(){const r=this.getEntityPermission();return i.get(r,"students.all_students.actions.btn_reset")}studentsAllStudentsSendEmail(){const r=this.getEntityPermission();return i.get(r,"students.all_students.actions.btn_send_email")}studentsAllStudentsAddMultipleTags(){const r=this.getEntityPermission();return i.get(r,"students.all_students.actions.btn_add_multiple_tags")}studentsAllStudentsRemoveTags(){const r=this.getEntityPermission();return i.get(r,"students.all_students.actions.btn_remove_multiple_tags")}studentCardTagShowPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.student_card.student_tag.show_perm")}studentCardTagEditPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.student_card.student_tag.edit_perm")}studentCardTagAddTag(){const r=this.getEntityPermission();return i.get(r,"candidate.student_card.student_tag.actions.btn_add_tag")}studentCardTagActionEditPerm(){const r=this.getEntityPermission();return i.get(r,"candidate.student_card.student_tag.actions.btn_edit_perm")}allPermisionSearchTag(){const r=this.getEntityPermission();return i.get(r,"quick_search.search_tag")}getAllUserTypes(){return this.apollo.query({query:m.ZP`
          query {
            GetAllUserTypes(show_student_type: include_student) {
              _id
              name
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,S.U)(r=>r.data.GetAllUserTypes))}getAllUserPermissionTable(){return this.apollo.query({query:m.ZP`
          query {
            GetAllUserPermissionTable {
              menus {
                menu
                sub_menu {
                  name
                  permissions {
                    user_type_id {
                      _id
                    }
                    user_type_name
                    show_perm
                    edit_perm
                    home_page
                  }
                }
              }
            }
          }
        `,fetchPolicy:"network-only"}).pipe((0,S.U)(r=>r.data.GetAllUserPermissionTable))}addTemplateProcessFormBuilderPerm(){const r=this.getEntityPermission();return i.get(r,"process.form_builder.actions.btn_add_template")}resetProcessFormBuilderPerm(){const r=this.getEntityPermission();return i.get(r,"process.form_builder.actions.btn_reset")}deleteTemplateProcessFormBuilderPerm(){const r=this.getEntityPermission();return i.get(r,"process.form_builder.actions.btn_delete_template")}editTemplateProcessFormBuilderPerm(){const r=this.getEntityPermission();return i.get(r,"process.form_builder.actions.btn_edit_template")}duplicateTemplateProcessFormBuilderPerm(){const r=this.getEntityPermission();return i.get(r,"process.form_builder.actions.btn_duplicate_template")}resetHistoryNotificationPerm(){const r=this.getEntityPermission();return i.get(r,"history.notifications.actions.btn_reset")}filterTodayHistoryNotificationPerm(){const r=this.getEntityPermission();return i.get(r,"history.notifications.actions.btn_filter_today")}filterYesterdayHistoryNotificationPerm(){const r=this.getEntityPermission();return i.get(r,"history.notifications.actions.btn_filter_yesterday")}filterLast7DaysHistoryNotificationPerm(){const r=this.getEntityPermission();return i.get(r,"history.notifications.actions.btn_filter_last_7_days")}filterLast30DaysHistoryNotificationPerm(){const r=this.getEntityPermission();return i.get(r,"history.notifications.actions.btn_filter_last_30_days")}viewNotificationHistoryNotificationPerm(){const r=this.getEntityPermission();return i.get(r,"history.notifications.actions.btn_view_notification")}showAlumniSurveyOptionPerm(){const r=this.getEntityPermission();return i.get(r,"process.alumni_survey.show_perm")}showAlumniCardAddAlumniPerm(){const r=this.getEntityPermission();return i.get(r,"alumni.card.actions.btn_add_alumni")}showAlumniCardResetAlumniPerm(){const r=this.getEntityPermission();return i.get(r,"alumni.card.actions.btn_reset")}showAlumniCardAddCommentPerm(){const r=this.getEntityPermission();return i.get(r,"alumni.card.actions.btn_add_comment")}showAlumniCardSaveIdentityPerm(){const r=this.getEntityPermission();return i.get(r,"alumni.card.actions.btn_save_identity")}showAlumniCardHistoryExprotPerm(){const r=this.getEntityPermission();return i.get(r,"alumni.card.actions.btn_history_export")}teacherManagementFollowUpGenerateContract(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"teacher_management.teacher_follow_up.actions.btn_generate_contract")}teacherManagementFollowUpExport(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"teacher_management.teacher_follow_up.actions.btn_export")}teacherManagementFollowUpView(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"teacher_management.teacher_follow_up.actions.btn_view")}teacherManagementFollowUpGenerateContractAction(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"teacher_management.teacher_follow_up.actions.btn_generate_contract_action")}teacherManagementTeachersAddTypeOfIntervention(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"teacher_management.teachers_table.actions.btn_add_type_of_intervention")}teacherManagementTeachersExport(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"teacher_management.teachers_table.actions.btn_export")}teacherManagementTeachersEdit(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"teacher_management.teachers_table.actions.btn_edit")}teacherManagementTeachersDelete(){const r=this.getEntityPermission();return this.isManualPermission?this.isManualPermission:i.get(r,"teacher_management.teachers_table.actions.btn_delete")}}return A.\u0275fac=function(r){return new(r||A)(d.\u0275\u0275inject(N.eN),d.\u0275\u0275inject(q._M),d.\u0275\u0275inject(b.sK))},A.\u0275prov=d.\u0275\u0275defineInjectable({token:A,factory:A.\u0275fac,providedIn:"root"}),A})()},84075:(on,ot,l)=>{"use strict";l.d(ot,{t:()=>r});var i=l(17489),m=l(13125),S=l(24850),d=l(35226),N=l.n(d),q=l(94650),b=l(52688),P=l(84130),A=l(18497),$=l(89383);let r=(()=>{class B{constructor(x,C,T,J,Me){this.authService=x,this.permissionService=C,this.apollo=T,this.permissions=J,this.translate=Me,this.listHierarchyEntity=["operator","academic","admission","finance","company_relation","company","alumni"],this.listEntitiesNonProgram=["operator"],this.listHierarchyUserType={operator:["operator_dir","operator_admin"],academic:["Academic Director","Academic Member","Contract Manager","Academic referent","Teacher","Student","Candidate"],admission:["Admission Director","Admission Member","Continuous formation manager"],finance:["Finance Director","Finance Member"],company_relation:["Company Relation Director","Company Relation Member"],company:["CEO","Mentor"],alumni:["Alumni Member"]},this.operatorTypeList=["operator_dir","operator_admin"],this.academicTypeList=["Academic Director","Academic Member","Contract Manager","Academic referent","Teacher","Student","Candidate"],this.admissionTypeList=["Admission Director","Admission Member","Continuous formation manager"],this.financeTypeList=["Finance Director","Finance Member"],this.relationTypeList=["Company Relation Director","Company Relation Member"],this.companyTypeList=["CEO","Mentor"],this.alumniTypeList=["Alumni Member"],this.userTypeList=[{_id:"5a2e1ecd53b95d22c82f954e",name:"operator_admin"},{_id:"5a2e1ecd53b95d22c82f954b",name:"operator_dir"},{_id:"5a2e1ecd53b95d22c82f954d",name:"operator_visitor"},{_id:"5a2e1ecd53b95d22c82f9555",name:"Academic Admin"},{_id:"5a2e1ecd53b95d22c82f9554",name:"Academic Director"},{_id:"5cdbdeaf4b1f6a1b5a0b3fb6",name:"Academic Final Jury Member"},{_id:"5c173695ba179819bd115df1",name:"Academic Final Jury Member"},{_id:"5a2e1ecd53b95d22c82f9550",name:"Certifier Admin"},{_id:"5a66cd0813f5aa05902fac1e",name:"Chief Group Academic"},{_id:"5bc066042a35327127ad9dfa",name:"Collaborateur Ext. ADMTC"},{_id:"5b1ffb5c9e25da6d30bde480",name:"Correcteur PFE Oral"},{_id:"5a2e1ecd53b95d22c82f9559",name:"Corrector"},{_id:"5f33552b683818419d13028b",name:"Animator Business game"},{_id:"5b210d24090336708818ded1",name:"Corrector Certifier"},{_id:"5a2e1ecd53b95d22c82f9552",name:"Corrector Quality"},{_id:"5a2e1ecd53b95d22c82f9551",name:"Corrector of Problematic"},{_id:"5a9e7ddf8228f45eb2e9bc77",name:"Cross Corrector"},{_id:"5a2e1ecd53b95d22c82f954f",name:"CR School Director"},{_id:"5a2e1ecd53b95d22c82f9553",name:"PC School Director"},{_id:"5a2e603c53b95d22c82f958f",name:"HR"},{_id:"5a2e603f53b95d22c82f9590",name:"Mentor"},{_id:"5a3cd5e7e6fae44c7c11561e",name:"President of Jury"},{_id:"5cdbde9b4b1f6a1b5a0b3fb5",name:"Professional Jury Member"},{_id:"5a2e1ecd53b95d22c82f954c",name:"Sales"},{_id:"5a2e1ecd53b95d22c82f9558",name:"Teacher"},{_id:"5e93dd18ef9a2925e85eeb29",name:"Teacher Certifier"},{_id:"6110d01d08f82f5d8c8f7d5c",name:"Company Member"},{_id:"6110d01d08f82f5d8c8f7d5e",name:"CEO"}],this.industryList=["none","food","bank","wood_paper_cardboard_printing","building_construction_materials","chemistry_parachemistry","sales_trading_distribution","education","edition_communication_multimedia","electronics_electricity","studies_and_consultancy","professional_training","pharmaceutical_industry","it_telecom","machinery_and_equipment_automotive","metallurgy_metal_working","plastic_rubber","business_services","textile_clothing_shoes","transport_logistics"]}getAppPermission(){return this.apollo.query({query:m.ZP`
          query GetAppPermission {
            GetAppPermission {
              group_name
              group_logo
              is_site_active
              mails {
                help_mail
              }
            }
          }