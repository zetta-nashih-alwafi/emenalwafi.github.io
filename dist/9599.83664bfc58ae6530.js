"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[9599],{94306:(D,g,i)=>{i.r(g),i.d(g,{UserPermissionModule:()=>W});var d=i(36895),u=i(93730),f=i(30160),_=i(88796),c=i(610),x=i(25360),C=i(68745),m=i(17489),P=i(35226),b=i.n(P),t=i(94650),h=i(89383),O=i(52688),M=i(24006),v=i(96334),y=i(44758),w=i(67154),k=i(51572);function S(e,o){1&e&&(t.\u0275\u0275elementStart(0,"div",8),t.\u0275\u0275element(1,"mat-progress-spinner",9),t.\u0275\u0275elementEnd())}function U(e,o){if(1&e&&(t.\u0275\u0275elementStart(0,"div",24)(1,"div",25),t.\u0275\u0275text(2),t.\u0275\u0275pipe(3,"translate"),t.\u0275\u0275elementEnd()()),2&e){const n=o.$implicit;t.\u0275\u0275advance(2),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(3,1,"USER_TYPES."+(null==n?null:n.name)))}}function T(e,o){if(1&e&&(t.\u0275\u0275elementStart(0,"div",28),t.\u0275\u0275text(1),t.\u0275\u0275pipe(2,"translate"),t.\u0275\u0275elementEnd()),2&e){const n=t.\u0275\u0275nextContext().$implicit;t.\u0275\u0275advance(1),t.\u0275\u0275textInterpolate1(" ",null!=n&&n.sub_menu?t.\u0275\u0275pipeBind1(2,1,"Alumnis."+(null==n?null:n.sub_menu)):""," ")}}function I(e,o){if(1&e&&(t.\u0275\u0275elementStart(0,"div",28),t.\u0275\u0275text(1),t.\u0275\u0275pipe(2,"translate"),t.\u0275\u0275elementEnd()),2&e){const n=t.\u0275\u0275nextContext().$implicit;t.\u0275\u0275advance(1),t.\u0275\u0275textInterpolate1(" ",null!=n&&n.sub_menu?t.\u0275\u0275pipeBind1(2,1,"Finances."+(null==n?null:n.sub_menu)):""," ")}}function E(e,o){if(1&e&&(t.\u0275\u0275elementStart(0,"div",28),t.\u0275\u0275text(1),t.\u0275\u0275pipe(2,"translate"),t.\u0275\u0275pipe(3,"translate"),t.\u0275\u0275pipe(4,"translate"),t.\u0275\u0275pipe(5,"translate"),t.\u0275\u0275elementEnd()),2&e){const n=t.\u0275\u0275nextContext().$implicit;t.\u0275\u0275advance(1),t.\u0275\u0275textInterpolate1(" ","template"===(null==n?null:n.sub_menu)?t.\u0275\u0275pipeBind1(2,1,"course_sequence.Template"):"module"===(null==n?null:n.sub_menu)?t.\u0275\u0275pipeBind1(3,3,"course_sequence.Modules"):"sequence"===(null==n?null:n.sub_menu)?t.\u0275\u0275pipeBind1(4,5,"course_sequence.Sequences"):"subject"===(null==n?null:n.sub_menu)?t.\u0275\u0275pipeBind1(5,7,"course_sequence.Subjects"):""," ")}}function z(e,o){if(1&e&&(t.\u0275\u0275elementStart(0,"div",28),t.\u0275\u0275text(1),t.\u0275\u0275pipe(2,"translate"),t.\u0275\u0275elementEnd()),2&e){const n=t.\u0275\u0275nextContext().$implicit;t.\u0275\u0275advance(1),t.\u0275\u0275textInterpolate1(" ",null!=n&&n.sub_menu?t.\u0275\u0275pipeBind1(2,1,(null==n?null:n.menu)+"."+(null==n?null:n.sub_menu)):""," ")}}function B(e,o){if(1&e&&(t.\u0275\u0275elementStart(0,"div")(1,"div",35)(2,"div",36),t.\u0275\u0275text(3),t.\u0275\u0275pipe(4,"translate"),t.\u0275\u0275pipe(5,"translate"),t.\u0275\u0275pipe(6,"translate"),t.\u0275\u0275pipe(7,"translate"),t.\u0275\u0275elementEnd()()()),2&e){const n=t.\u0275\u0275nextContext().$implicit;t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate3(" ",null!=n&&n.show_perm?"V":""," ",null!=n&&n.edit_perm&&null!=n&&n.show_perm?t.\u0275\u0275pipeBind1(4,3,"/ E"):null!=n&&n.edit_perm?t.\u0275\u0275pipeBind1(5,5,"E"):""," ",(null!=n&&n.edit_perm||null!=n&&n.show_perm)&&null!=n&&n.home_page?t.\u0275\u0275pipeBind1(6,7," + HP"):null!=n&&n.home_page?t.\u0275\u0275pipeBind1(7,9,"HP"):""," ")}}function F(e,o){if(1&e&&(t.\u0275\u0275elementStart(0,"div"),t.\u0275\u0275template(1,B,8,11,"div",31),t.\u0275\u0275pipe(2,"lowercase"),t.\u0275\u0275pipe(3,"lowercase"),t.\u0275\u0275elementEnd()),2&e){const n=o.$implicit,a=t.\u0275\u0275nextContext().$implicit;t.\u0275\u0275advance(1),t.\u0275\u0275property("ngIf",t.\u0275\u0275pipeBind1(2,1,null==n?null:n.user_type_name)===t.\u0275\u0275pipeBind1(3,3,null==a?null:a.name))}}function j(e,o){if(1&e&&(t.\u0275\u0275elementStart(0,"div",33),t.\u0275\u0275template(1,F,4,5,"div",34),t.\u0275\u0275elementEnd()),2&e){const n=t.\u0275\u0275nextContext(2).index,a=t.\u0275\u0275nextContext(3);t.\u0275\u0275advance(1),t.\u0275\u0275property("ngForOf",null==a.leftLabel[n]?null:a.leftLabel[n].permissions)}}function L(e,o){if(1&e&&(t.\u0275\u0275elementStart(0,"div"),t.\u0275\u0275template(1,j,2,1,"div",32),t.\u0275\u0275elementEnd()),2&e){const n=t.\u0275\u0275nextContext(4);t.\u0275\u0275advance(1),t.\u0275\u0275property("ngForOf",n.dataUserTypes)}}function R(e,o){if(1&e&&(t.\u0275\u0275elementStart(0,"div",26)(1,"div",27)(2,"div",28),t.\u0275\u0275text(3),t.\u0275\u0275pipe(4,"translate"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(5,"div",29),t.\u0275\u0275template(6,T,3,3,"div",30),t.\u0275\u0275template(7,I,3,3,"div",30),t.\u0275\u0275template(8,E,6,9,"div",30),t.\u0275\u0275template(9,z,3,3,"div",30),t.\u0275\u0275elementEnd(),t.\u0275\u0275template(10,L,2,1,"div",31),t.\u0275\u0275elementEnd()),2&e){const n=o.$implicit,a=o.index,l=t.\u0275\u0275nextContext(3);t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate1(" ",null!=n&&n.isFirst?t.\u0275\u0275pipeBind1(4,6,"menu."+(null==n?null:n.menu)):""," "),t.\u0275\u0275advance(3),t.\u0275\u0275property("ngIf","alumni"===(null==n?null:n.menu)),t.\u0275\u0275advance(1),t.\u0275\u0275property("ngIf","finance"===(null==n?null:n.menu)),t.\u0275\u0275advance(1),t.\u0275\u0275property("ngIf","courses_sequences"==(null==n?null:n.menu)),t.\u0275\u0275advance(1),t.\u0275\u0275property("ngIf","alumni"!==(null==n?null:n.menu)&&"finance"!==(null==n?null:n.menu)&&"courses_sequences"!==(null==n?null:n.menu)),t.\u0275\u0275advance(1),t.\u0275\u0275property("ngIf",l.leftLabel&&(null==l.leftLabel?null:l.leftLabel.length)&&l.leftLabel[a]&&(null==l.leftLabel[a]?null:l.leftLabel[a].permissions.length))}}function N(e,o){if(1&e&&(t.\u0275\u0275elementStart(0,"div",12)(1,"div",13)(2,"div",14)(3,"div",15)(4,"div",16),t.\u0275\u0275text(5),t.\u0275\u0275pipe(6,"translate"),t.\u0275\u0275elementEnd()(),t.\u0275\u0275elementStart(7,"div",17)(8,"div",16),t.\u0275\u0275text(9),t.\u0275\u0275pipe(10,"translate"),t.\u0275\u0275elementEnd()()(),t.\u0275\u0275elementStart(11,"div",18)(12,"div",19),t.\u0275\u0275element(13,"div",20)(14,"div",21),t.\u0275\u0275template(15,U,4,3,"div",22),t.\u0275\u0275elementEnd(),t.\u0275\u0275template(16,R,11,8,"div",23),t.\u0275\u0275elementEnd()()()),2&e){const n=t.\u0275\u0275nextContext(2);t.\u0275\u0275advance(5),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(6,4,"Menu")),t.\u0275\u0275advance(4),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(10,6,"Submenu")),t.\u0275\u0275advance(6),t.\u0275\u0275property("ngForOf",n.dataUserTypes),t.\u0275\u0275advance(1),t.\u0275\u0275property("ngForOf",n.leftLabel)}}function A(e,o){if(1&e&&(t.\u0275\u0275elementStart(0,"div",10),t.\u0275\u0275template(1,N,17,8,"div",11),t.\u0275\u0275elementEnd()),2&e){const n=t.\u0275\u0275nextContext();t.\u0275\u0275advance(1),t.\u0275\u0275property("ngIf",n.dataUserTypes&&n.dataUserTypes.length)}}const $=[{path:"",component:(()=>{class e{constructor(n,a,l,r,s,p,G){this.translate=n,this.userService=a,this.fb=l,this.router=r,this.coreService=s,this.permissionService=p,this.pageTitleService=G,this.subs=new C.Y,this.isWaitingForResponse=!1,this.dataUserTypes=[],this.leftLabel=[],this.dataPermission=[]}ngOnInit(){setTimeout(()=>{this.coreService.sidenavOpen=!1},1e3),this.currentUser=this.userService.getLocalStorageUser(),this.isPermission=this.userService.getPermission();const n=this.currentUser?.entities?.find(a=>a?.type?.name===this.isPermission[0]);this.currentUserTypeId=n?.type?._id,this.getAllUserTypes(),this.pageTitleService.setTitle("NAV.SETTINGS.USER_PERMISSION")}getAllUserTypes(){this.isWaitingForResponse=!0,this.subs.sink=this.permissionService.getAllUserTypes().subscribe(n=>{n?.length&&(n=n.filter(a=>"5fe98eeadb866c403defdc6c"!==a?._id),this.dataUserTypes=m.cloneDeep(n),this.GetAllUserPermissionTable())},n=>{this.userService.postErrorLog(n),this.isWaitingForResponse=!1,b().fire({type:"info",title:this.translate.instant("SORRY"),text:n&&n.message?this.translate.instant(n.message.replaceAll("GraphQL error: ","")):n,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})})}GetAllUserPermissionTable(){this.isWaitingForResponse=!0,this.subs.sink=this.permissionService.getAllUserPermissionTable().subscribe(n=>{if(this.isWaitingForResponse=!1,n){this.dataPermission=m.cloneDeep(n),this.leftLabel=[],n?.menus?.length&&n.menus.forEach(l=>{l?.sub_menu?.length&&l.sub_menu.forEach((r,s)=>{"contracts"!==l?.menu&&this.leftLabel.push({menu:l?.menu?l.menu:"",sub_menu:r?.name?r.name:"",permissions:r?.permissions?r.permissions:"",isFirst:0===s})})});const a=this.leftLabel?.filter(l=>l?.sub_menu);this.leftLabel=a}},n=>{this.userService.postErrorLog(n),this.isWaitingForResponse=!1,b().fire({type:"info",title:this.translate.instant("SORRY"),text:n&&n.message?this.translate.instant(n.message.replaceAll("GraphQL error: ","")):n,confirmButtonText:this.translate.instant("DISCONNECT_SCHOOL.BUTTON3")})})}ngOnDestroy(){this.subs.unsubscribe(),this.pageTitleService.setTitle(null)}}return e.\u0275fac=function(n){return new(n||e)(t.\u0275\u0275directiveInject(h.sK),t.\u0275\u0275directiveInject(O.e),t.\u0275\u0275directiveInject(M.UntypedFormBuilder),t.\u0275\u0275directiveInject(c.gz),t.\u0275\u0275directiveInject(v.p),t.\u0275\u0275directiveInject(y.$),t.\u0275\u0275directiveInject(w.Z))},e.\u0275cmp=t.\u0275\u0275defineComponent({type:e,selectors:[["ms-user-permission"]],decls:16,vars:14,consts:[["class","loading-indicator",4,"ngIf"],[1,"p-grid"],[1,"p-col-12",2,"padding","0px"],[1,"label",2,"width","250px"],[1,"view-perm",2,"width","100px !important","display","inline-block"],[1,"edit-perm",2,"width","100px !important","display","inline-block"],[1,"edit-perm"],["class","detail-school",4,"ngIf"],[1,"loading-indicator"],["mode","indeterminate","color","accent"],[1,"detail-school"],["class","table-school",4,"ngIf"],[1,"table-school"],[1,"detail-table"],[1,"list-headers"],[1,"label-array",2,"padding","0px !important","width","200px !important","background","#607d8b","text-align","center","vertical-align","middle"],[1,"label-school-first"],[1,"label-array",2,"padding","0px !important","border","none !important","background","#607d8b","text-align","center","vertical-align","middle","border-right","1px solid black !important"],[1,"list-body"],[1,"list-level","fixed-header"],[1,"label-array",2,"width","200px !important"],[1,"label-array"],["class","array-data","style","padding: 0px !important; background: #607d8b",4,"ngFor","ngForOf"],["class","list-level",4,"ngFor","ngForOf"],[1,"array-data",2,"padding","0px !important","background","#607d8b"],[1,"label-list-schools"],[1,"list-level"],[1,"label-array",2,"height","45px !important","padding","0px 5px !important"],[1,"label-level"],[1,"label-array",2,"height","45px !important","padding","0px 5px !important","left","240px !important"],["class","label-level",4,"ngIf"],[4,"ngIf"],["class","array-data","style","vertical-align: middle",4,"ngFor","ngForOf"],[1,"array-data",2,"vertical-align","middle"],[4,"ngFor","ngForOf"],[1,"list-data"],[1,"registereds"]],template:function(n,a){1&n&&(t.\u0275\u0275template(0,S,2,0,"div",0),t.\u0275\u0275elementStart(1,"div",1)(2,"div",2)(3,"span",3),t.\u0275\u0275text(4),t.\u0275\u0275pipe(5,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(6,"span",4),t.\u0275\u0275text(7),t.\u0275\u0275pipe(8,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(9,"span",5),t.\u0275\u0275text(10),t.\u0275\u0275pipe(11,"translate"),t.\u0275\u0275elementEnd(),t.\u0275\u0275elementStart(12,"span",6),t.\u0275\u0275text(13),t.\u0275\u0275pipe(14,"translate"),t.\u0275\u0275elementEnd()()(),t.\u0275\u0275template(15,A,2,1,"div",7)),2&n&&(t.\u0275\u0275property("ngIf",a.isWaitingForResponse),t.\u0275\u0275advance(4),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(5,6,"User Permission")),t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(8,8,"V = View")),t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(11,10,"E = Edit")),t.\u0275\u0275advance(3),t.\u0275\u0275textInterpolate(t.\u0275\u0275pipeBind1(14,12,"HP = Home Page")),t.\u0275\u0275advance(2),t.\u0275\u0275property("ngIf",!a.isWaitingForResponse))},dependencies:[d.sg,d.O5,k.Ou,d.i8,h.X$],styles:[".top-space[_ngcontent-%COMP%]{margin-top:30px}table[_ngcontent-%COMP%]   .mat-select-trigger[_ngcontent-%COMP%]{display:inline-table}table[_ngcontent-%COMP%]   .mat-select-value[_ngcontent-%COMP%]{display:table-cell;max-width:0}table[_ngcontent-%COMP%]   .mat-select-arrow-wrapper[_ngcontent-%COMP%]{display:table-cell;vertical-align:middle}[_nghost-%COMP%]     table:not(.no-action-header):not(.notif-table) th{font-weight:400}[_nghost-%COMP%]     table:not(.no-action-header):not(.notif-table) thead>tr:first-child{height:40px}[_nghost-%COMP%]     table:not(.no-action-header):not(.notif-table) thead>tr:nth-child(2){border-top:4px solid #607d8b}[_nghost-%COMP%]     table:not(.no-action-header):not(.notif-table) thead>tr:not(:first-child){border-left:4px solid #607d8b;border-right:4px solid #607d8b}[_nghost-%COMP%]     table:not(.no-action-header):not(.notif-table) thead>tr:nth-last-child(2){border-bottom:4px solid #607d8b}[_nghost-%COMP%]     table:not(.no-action-header):not(.notif-table) thead>tr:last-child{border-bottom:4px solid #607d8b}[_nghost-%COMP%]     table:not(.no-action-header):not(.notif-table) tbody>tr{border-left:4px solid #607d8b;border-right:4px solid #607d8b}[_nghost-%COMP%]     table:not(.no-action-header):not(.notif-table) tbody>tr:last-child{border-bottom:4px solid #607d8b}[_nghost-%COMP%]     table:not(.no-action-header):not(.notif-table) tbody tr:nth-child(odd){background-color:#607d8b}[_nghost-%COMP%]     table:not(.no-action-header):not(.notif-table) tbody tr:nth-child(odd) .mat-icon-button .mat-icon{line-height:1!important}[_nghost-%COMP%]     table:not(.no-action-header):not(.notif-table) tbody tr:nth-child(odd) .mat-icon-button{background:#353535;line-height:0!important}[_nghost-%COMP%]     table:not(.no-action-header):not(.notif-table) tbody tr:nth-child(even){background-color:#353535}[_nghost-%COMP%]     table:not(.no-action-header):not(.notif-table) tbody tr:nth-child(even) .mat-icon-button .mat-icon{line-height:1!important}[_nghost-%COMP%]     table:not(.no-action-header):not(.notif-table) tbody tr:nth-child(even) .mat-icon-button{background:#607d8b;line-height:0!important}[_nghost-%COMP%]     table.no-action-header th{font-weight:400}[_nghost-%COMP%]     table.no-action-header thead>tr:nth-child(1){border-top:4px solid #607d8b;border-left:4px solid #607d8b;border-right:4px solid #607d8b}[_nghost-%COMP%]     table.no-action-header thead>tr:not(:first-child){border-left:4px solid #607d8b;border-right:4px solid #607d8b}[_nghost-%COMP%]     table.no-action-header thead>tr:nth-last-child(2){border-bottom:4px solid #607d8b}[_nghost-%COMP%]     table.no-action-header thead>tr:last-child{border-bottom:4px solid #607d8b}[_nghost-%COMP%]     table.no-action-header tbody>tr{border-left:4px solid #607d8b;border-right:4px solid #607d8b}[_nghost-%COMP%]     table.no-action-header tbody>tr:last-child{border-bottom:4px solid #607d8b}[_nghost-%COMP%]     table.no-action-header tbody tr:nth-child(odd){background-color:#607d8b}[_nghost-%COMP%]     table.no-action-header tbody tr:nth-child(odd) .mat-icon-button .mat-icon{line-height:1!important}[_nghost-%COMP%]     table.no-action-header tbody tr:nth-child(odd) .mat-icon-button{background:#353535;line-height:0!important}[_nghost-%COMP%]     table.no-action-header tbody tr:nth-child(even){background-color:#353535}[_nghost-%COMP%]     table.no-action-header tbody tr:nth-child(even) .mat-icon-button .mat-icon{line-height:1!important}[_nghost-%COMP%]     table.no-action-header tbody tr:nth-child(even) .mat-icon-button{background:#607d8b;line-height:0!important}.horizontal[_ngcontent-%COMP%]{overflow:auto}.child-tab-font[_ngcontent-%COMP%]{font-size:.8rem}.center-spinner[_ngcontent-%COMP%]{display:flex;justify-content:center;align-items:center}.hide[_ngcontent-%COMP%], .hidden[_ngcontent-%COMP%]{display:none!important}.header-div[_ngcontent-%COMP%]{border-bottom:1px solid black;display:flex;padding:1rem}.header-text[_ngcontent-%COMP%]{color:#000;margin-left:1rem;margin-bottom:0!important}.header-icon[_ngcontent-%COMP%]{align-self:center;margin-left:auto!important;background-color:transparent!important}.baseline-align[_ngcontent-%COMP%]{align-items:baseline}.admtc-table-button[_ngcontent-%COMP%], button.yellow-button.mat-raised-button[_ngcontent-%COMP%], button.blue-patina-button.mat-raised-button[_ngcontent-%COMP%]{min-width:7em;height:2.8em;font-size:1.2em;font-family:Roboto,Helvetica Neue,sans-serif!important}.admtc-table-button[_ngcontent-%COMP%]   .mat-icon[svgicon][_ngcontent-%COMP%], button.yellow-button.mat-raised-button[_ngcontent-%COMP%]   .mat-icon[svgicon][_ngcontent-%COMP%], button.blue-patina-button.mat-raised-button[_ngcontent-%COMP%]   .mat-icon[svgicon][_ngcontent-%COMP%]{margin-top:.5em;margin-right:.3em}.admtc-normal-button[_ngcontent-%COMP%], button.yellow-button-normal.mat-raised-button[_ngcontent-%COMP%]{min-width:7em;height:2em;font-size:1em;font-family:Roboto,Helvetica Neue,sans-serif!important}.admtc-normal-button[_ngcontent-%COMP%]   .mat-icon[svgicon][_ngcontent-%COMP%], button.yellow-button-normal.mat-raised-button[_ngcontent-%COMP%]   .mat-icon[svgicon][_ngcontent-%COMP%]{margin-top:.3em;margin-right:.2em}.background-accent[_ngcontent-%COMP%], button.yellow-button-normal.mat-raised-button[_ngcontent-%COMP%], button.yellow-button.mat-raised-button[_ngcontent-%COMP%]{background-color:#fdd835!important;color:#000000de}.background-warn[_ngcontent-%COMP%]{background-color:red!important;color:#fff}.background-success[_ngcontent-%COMP%]{background-color:#4caf50!important;color:#fff}.background-primary[_ngcontent-%COMP%]{background-color:#607d8b!important;color:#fff}.background-medium-grey[_ngcontent-%COMP%]{background-color:#424242!important;color:#fff}.background-black[_ngcontent-%COMP%]{background-color:#212121!important;color:#fff}button.blue-patina-button.mat-raised-button[_ngcontent-%COMP%]{background-color:#607d8b!important}[_nghost-%COMP%]     .mat-slide-toggle.mat-checked .mat-slide-toggle-bar .mat-slide-toggle-thumb{background-color:#fdd835}[_nghost-%COMP%]     .mat-slide-toggle.mat-checked .mat-slide-toggle-bar{background-color:#ffc10780}[_nghost-%COMP%]     .mat-form-field-appearance-outline .mat-form-field-infix{padding:.15rem}[_nghost-%COMP%]     mat-form-field.mat-form-field-should-float label{font-size:18px;font-weight:600;color:#000}.status-icon[_ngcontent-%COMP%], .red-icon[_ngcontent-%COMP%], .purple-icon[_ngcontent-%COMP%], .black-icon[_ngcontent-%COMP%], .greenyellow-icon[_ngcontent-%COMP%], .yellow-icon[_ngcontent-%COMP%], .green-icon[_ngcontent-%COMP%]{font-size:25px;width:30px}.is-loading[_ngcontent-%COMP%]   .mat-option-text[_ngcontent-%COMP%]{display:flex;justify-content:center}.display-flex[_ngcontent-%COMP%]{display:flex}.green-icon[_ngcontent-%COMP%]{color:#4caf50}.yellow-icon[_ngcontent-%COMP%]{color:#ff0}.greenyellow-icon[_ngcontent-%COMP%]{color:#adff2f}.black-icon[_ngcontent-%COMP%]{color:#000}.purple-icon[_ngcontent-%COMP%]{color:purple}.red-icon[_ngcontent-%COMP%], .red-text[_ngcontent-%COMP%]{color:red}.text-white[_ngcontent-%COMP%]{color:#fff}.greenyellow-text[_ngcontent-%COMP%]{color:#adff2f!important}.mat-sort-header-container[_ngcontent-%COMP%]{justify-content:center}.tags[_ngcontent-%COMP%]{background-color:#fdd835;color:#000;padding:3px 5px;border-radius:3px;margin-right:5px}.p-grid[_ngcontent-%COMP%]{margin-right:unset!important;margin-left:unset!important;margin-top:unset!important}.add-btn[_ngcontent-%COMP%]{background:#fdd835;width:10rem}.color[_ngcontent-%COMP%]{background:#607d8b;width:10rem}.alignment[_ngcontent-%COMP%]{text-align:right;padding-right:0}mat-form-field[_ngcontent-%COMP%]{width:100%}[_nghost-%COMP%]     .ck-editor__editable_inline{min-height:50px;border:1px solid #b8b8b8;background:white;color:#000}.fontColor[_ngcontent-%COMP%]{color:#000}.yellow-border[_ngcontent-%COMP%]{border:2px solid #fdd835}.silver-border[_ngcontent-%COMP%]{border:2px solid whitesmoke}.red-border[_ngcontent-%COMP%]{border:2px solid red}.certification-rule-pop-up[_ngcontent-%COMP%]   .mat-dialog-container[_ngcontent-%COMP%]{padding:0}.one-time-pop-up[_ngcontent-%COMP%]   .mat-dialog-container[_ngcontent-%COMP%]{width:800px!important}.dark-mode-pop-up[_ngcontent-%COMP%]   .mat-dialog-container[_ngcontent-%COMP%]{color:#fff;background:#303030}.grey-mode-pop-up[_ngcontent-%COMP%]   .mat-dialog-container[_ngcontent-%COMP%]{color:#fff;background:#7c7c7c}.view-step-validation-pop-up[_ngcontent-%COMP%]   .mat-dialog-container[_ngcontent-%COMP%]{max-height:590px}.image-preview-pop-up[_ngcontent-%COMP%]   .mat-dialog-container[_ngcontent-%COMP%]{background:rgba(0,0,0,.231372549);box-shadow:none;padding:0;overflow:hidden}.pass-fail-pop-up[_ngcontent-%COMP%]   .mat-dialog-container[_ngcontent-%COMP%]{padding:0 24px 18px}.expected-doc-task[_ngcontent-%COMP%]   .mat-dialog-container[_ngcontent-%COMP%]{padding:16px!important;overflow:visible}.no-padding-pop-up[_ngcontent-%COMP%]   .mat-dialog-container[_ngcontent-%COMP%]{padding:0;overflow:visible}.questionnaire-simulation-pop-up[_ngcontent-%COMP%]   .mat-dialog-container[_ngcontent-%COMP%]{overflow:scroll;width:60vw;max-height:90vh;background-color:#607d8b;color:#fff}.reply-message-pop-up[_ngcontent-%COMP%]   .mat-dialog-container[_ngcontent-%COMP%]{padding:0;min-height:430px}.send-pro-evaluation-pop-up[_ngcontent-%COMP%]   .mat-dialog-container[_ngcontent-%COMP%]{padding:0;min-height:430px;visibility:hidden}.banner-connect-snackbar[_ngcontent-%COMP%]{padding:0!important;min-height:0!important;max-height:0!important}.editor-background-white[_ngcontent-%COMP%]{background-color:#fafafa;color:#000}.editor-background-white[_ngcontent-%COMP%]   .ck-editor__editable[_ngcontent-%COMP%]{min-height:140px!important}.small-text-fieldset[_ngcontent-%COMP%]{font-size:12px}.small-icon[_ngcontent-%COMP%]{transform:scale(.6)}.padding-0[_ngcontent-%COMP%]{padding:0!important}.mt-1rem[_ngcontent-%COMP%]{margin-top:1rem}.mr-1rem[_ngcontent-%COMP%]{margin-right:1rem}.mb-1rem[_ngcontent-%COMP%]{margin-bottom:1rem}.ellipsis-one-line[_ngcontent-%COMP%]{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.span-block[_ngcontent-%COMP%]{width:-moz-fit-content;width:fit-content;display:block;max-width:-webkit-fill-available;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dialog-title[_ngcontent-%COMP%]{color:#000}.icon-self-right[_ngcontent-%COMP%]{position:absolute;right:0;top:0;cursor:pointer}.dialog-body[_ngcontent-%COMP%]{color:#000}.no-padding[_ngcontent-%COMP%]{padding:0!important}.no-padding-x[_ngcontent-%COMP%]{padding-right:0!important;padding-left:0!important}.no-padding-y[_ngcontent-%COMP%]{padding-top:0!important;padding-bottom:0!important}.no-padding-r[_ngcontent-%COMP%]{padding-right:0!important}.no-padding-l[_ngcontent-%COMP%]{padding-left:0!important}.no-padding-t[_ngcontent-%COMP%]{padding-top:0!important}.no-padding-b[_ngcontent-%COMP%]{padding-bottom:0!important}.no-margin[_ngcontent-%COMP%]{margin:0}.align-center[_ngcontent-%COMP%]{text-align:center}.align-end[_ngcontent-%COMP%]{text-align:end}.one-line-text[_ngcontent-%COMP%]{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}[_ngcontent-%COMP%]::-webkit-scrollbar{-webkit-appearance:none;width:7px;height:8px}[_ngcontent-%COMP%]::-webkit-scrollbar-thumb{border-radius:4px;background-color:#00000080;box-shadow:0 0 1px #ffffff80;-webkit-box-shadow:0 0 1px rgba(255,255,255,.5)}.ckeditor-small[_ngcontent-%COMP%]   .ck-editor__editable[_ngcontent-%COMP%]{min-height:140px!important;max-height:140px!important;border:1px solid rgba(0,0,0,.5)!important}.ckeditor-medium[_ngcontent-%COMP%]   .ck-editor__editable[_ngcontent-%COMP%]{min-height:300px!important;max-height:300px!important;border:1px solid rgba(0,0,0,.5)!important}.ckeditor-big[_ngcontent-%COMP%]   .ck-editor__editable[_ngcontent-%COMP%]{min-height:500px!important;max-height:500px!important}.ckeditor-white-background[_ngcontent-%COMP%]{background-color:#fff!important;color:#000!important}.custom-dialog-container-publishable-doc[_ngcontent-%COMP%]   .mat-dialog-container[_ngcontent-%COMP%]{overflow:unset;padding:15px}.align-input-field[_ngcontent-%COMP%]{margin-bottom:9px}.hide-pagination-buttons[_ngcontent-%COMP%]   .mat-paginator-navigation-first[_ngcontent-%COMP%], .hide-pagination-buttons[_ngcontent-%COMP%]   .mat-paginator-navigation-previous[_ngcontent-%COMP%], .hide-pagination-buttons[_ngcontent-%COMP%]   .mat-paginator-navigation-next[_ngcontent-%COMP%], .hide-pagination-buttons[_ngcontent-%COMP%]   .mat-paginator-navigation-last[_ngcontent-%COMP%]{display:none!important}.clickable[_ngcontent-%COMP%]{cursor:pointer}input[type=number][_ngcontent-%COMP%]::-webkit-inner-spin-button, input[type=number][_ngcontent-%COMP%]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.flex-layout-row-wrap[_ngcontent-%COMP%]{display:flex;flex-flow:row wrap;box-sizing:border-box}.mat-expansion-panel[_ngcontent-%COMP%]{margin-right:24px;margin-top:10px}.detail-school[_ngcontent-%COMP%]{padding:10px;padding-top:0!important}.detail-table[_ngcontent-%COMP%]{border-collapse:separate;box-sizing:border-box;text-indent:initial}.scholar-school[_ngcontent-%COMP%]{float:left}.button-action[_ngcontent-%COMP%]{display:block;text-align:right;position:relative;float:right}.school-name[_ngcontent-%COMP%]{min-width:245px;float:left;display:block;position:relative}.date-today[_ngcontent-%COMP%]{width:220px;float:left;position:relative;left:15px;vertical-align:middle}.list-body[_ngcontent-%COMP%]{vertical-align:middle;max-height:80vh;overflow:auto;top:-44px;position:relative}.label-school-first[_ngcontent-%COMP%]{font-weight:700;font-size:14px;background:#607d8b;text-align:center;position:absolute;width:100%;padding:5px 0;height:47px;display:contents}.label-level-first[_ngcontent-%COMP%]{font-size:14px;background:#565656;text-align:center;position:absolute;width:100%;padding:5px 0;height:45px;top:30px}.title-school[_ngcontent-%COMP%]{float:left;font-size:16px}.label-first[_ngcontent-%COMP%]{height:45px;width:145px;float:left;padding:5px;border:2px solid #607d8b}.list-level[_ngcontent-%COMP%]{width:100%;position:relative;display:table-row;vertical-align:inherit}.array-school[_ngcontent-%COMP%]{height:45px;min-width:120px;padding:14px 5px 5px;border:2px solid #607d8b;text-align:center;justify-content:center;margin:auto;font-size:15px;display:table-cell;vertical-align:inherit}.list-header[_ngcontent-%COMP%]{vertical-align:middle;border-color:inherit}.label-sub-school[_ngcontent-%COMP%]{height:45px;font-size:14px;padding:5px 0;background:#565656}.label-list-schools[_ngcontent-%COMP%]{font-weight:700;height:45px;font-size:14px;padding:5px 0;background:#607d8b;text-align:center}.list-headers[_ngcontent-%COMP%]{position:relative;top:5.5px;z-index:9999999;display:block}.label-array[_ngcontent-%COMP%]{height:50px;width:240px;min-width:240px;padding:5px;border:1px solid #607d8b;border-right:1px solid black;justify-content:center;display:table-cell;vertical-align:inherit;margin:0!important;z-index:9999;position:sticky;left:0;background:#363636}.table-school[_ngcontent-%COMP%]{width:100%}.fixed-header[_ngcontent-%COMP%]{position:sticky;top:0!important;z-index:999;display:block!important;background:#363636}.label-list-schools[_ngcontent-%COMP%]{text-align:center;display:contents}.array-data[_ngcontent-%COMP%]{height:45px;width:170px;min-width:170px;border:1px solid #607d8b;border-right:1px solid black;border-left:1px solid black;margin:auto;display:table-cell;vertical-align:middle;text-align:center;background:#363636}.label-sub[_ngcontent-%COMP%]{width:50%;float:left;text-align:center}.spinner-wrapper[_ngcontent-%COMP%]{width:100%;height:210px;z-index:998}.label-list-school[_ngcontent-%COMP%]{width:26px;float:left}.label-list-objectives[_ngcontent-%COMP%]{height:18px;font-size:15px;margin-left:21px;float:left}.label-level[_ngcontent-%COMP%]{font-size:12px}.objective[_ngcontent-%COMP%]{width:35px;float:right;margin-left:10px;font-size:12px}.mat-icon-status[_ngcontent-%COMP%]{font-size:16px;padding-top:11px;padding-left:5px}.label-list-registered[_ngcontent-%COMP%]{height:18px;font-size:11px;margin-left:25px;float:left}.registered[_ngcontent-%COMP%]{width:35px;float:right;margin-left:16px}.form-amount[_ngcontent-%COMP%]{width:118px;padding:0 10px}.yellow[_ngcontent-%COMP%]{color:#ffd740}.orange[_ngcontent-%COMP%]{color:#f49f36}.blue[_ngcontent-%COMP%]{color:#36ebf4}.red[_ngcontent-%COMP%]{color:#ff4040}.green[_ngcontent-%COMP%]{color:#adff2f}.grey[_ngcontent-%COMP%]{color:#999}.purple[_ngcontent-%COMP%]{color:#ff46f9}.magenta[_ngcontent-%COMP%]{color:#f0f}.black[_ngcontent-%COMP%]{color:#000}.cyan[_ngcontent-%COMP%]{color:#0ff}.status[_ngcontent-%COMP%]{height:27px;width:2px;background-color:#bbb;display:block;float:left}.registereds[_ngcontent-%COMP%]{width:100%;text-align:center;font-size:12px!important}.objectives[_ngcontent-%COMP%]{width:70px;float:left;text-align:center;color:#b1b1b1}.bkorange[_ngcontent-%COMP%]{background-color:#f49f36!important}.bkblue[_ngcontent-%COMP%]{background-color:#36ebf4!important}.bkred[_ngcontent-%COMP%]{background-color:#ff4040!important}.bkgrey[_ngcontent-%COMP%]{background-color:#607d8b!important}.bkgreen[_ngcontent-%COMP%]{background-color:#adff2f!important}[_nghost-%COMP%]  .ng-select .ng-select-container{background-color:#fff0;color:#fff;border:none;border-radius:0!important;border-bottom:1px solid #8c8c8c!important;min-height:36px;align-items:center}[_nghost-%COMP%]  .mat-select-arrow-wrapper{padding-right:5px}[_nghost-%COMP%]  .mat-select-value-text{margin-left:10px;font-size:13px}[_nghost-%COMP%]  ng-dropdown-panel{z-index:99999999999}[_nghost-%COMP%]  .ng-select .ng-select-container .ng-value-container .ng-input>input{color:#fff;box-sizing:content-box;background:none;border:0;box-shadow:none;outline:0;cursor:default;width:100%}.class-scholar[_ngcontent-%COMP%]{width:150px;display:inline-block;vertical-align:middle}input[type=number][_ngcontent-%COMP%]{-moz-appearance:textfield}"]}),e})(),canActivate:[x.n],data:{permission:"intake_channel.show_perm"}}];let H=(()=>{class e{}return e.\u0275fac=function(n){return new(n||e)},e.\u0275mod=t.\u0275\u0275defineNgModule({type:e}),e.\u0275inj=t.\u0275\u0275defineInjector({imports:[c.Bz.forChild($),c.Bz]}),e})(),W=(()=>{class e{}return e.\u0275fac=function(n){return new(n||e)},e.\u0275mod=t.\u0275\u0275defineNgModule({type:e}),e.\u0275inj=t.\u0275\u0275defineInjector({imports:[d.ez,u.m,H,f.ii.forRoot(),_.A0]}),e})()}}]);