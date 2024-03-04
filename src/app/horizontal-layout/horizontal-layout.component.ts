import { filter } from 'rxjs/operators';
import { Component, OnInit, ViewChild, HostListener, ViewEncapsulation, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AuthService } from '../service/auth-service/auth.service';
import { CoreService } from '../service/core/core.service';
import { HorizontalMenuItems } from '../core/menu/horizontal-menu-items/horizontal-menu-items';
declare var require: any;
import { Subscription } from 'rxjs';
import { SubSink } from 'subsink';
import { ReplyUrgentMessageDialogComponent } from 'app/mailbox/reply-urgent-message-dialog/reply-urgent-message-dialog.component';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MailboxService } from 'app/service/mailbox/mailbox.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { CertificationRuleService } from 'app/service/certification-rule/certification-rule.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import Swal from 'sweetalert2';

const screenfull = require('screenfull');

@Component({
  selector: 'ms-horizontal-layout',
  templateUrl: './horizontal-layout.component.html',
  styleUrls: ['./horizontal-layout.component.scss'],
  host: {
    '(window:resize)': 'onResize($event)',
  },
})
export class HorizontalLayoutComponent implements OnInit, OnDestroy {
  replyUrgentMessageDialogComponent: MatDialogRef<ReplyUrgentMessageDialogComponent>;
  selectedRncpTitleLongName: any;
  selectedRncpTitleName: any;
  configCertificatioRule: MatDialogConfig = {
    disableClose: true,
  };
  private subs = new SubSink();
  root = 'ltr';
  currentLang = 'fr';
  dark: boolean;
  compactSidebar: boolean;
  customizerIn: boolean = false;
  chatpanelOpen: boolean = false;
  isFullscreen: boolean = false;
  showSettings: boolean = false;
  isMobile: boolean = false;
  header = 'operator';
  layout: any = 'ltr';
  popupDeleteResponse: any;
  isMobileStatus: boolean;
  appsmenu;
  private _routerEventsSubscription: Subscription;
  private _router;
  @ViewChild('horizontalSideNav', { static: true }) horizontalSideNav;

  chatList: any[] = [
    {
      image: 'assets/img/user-1.jpg',
      name: 'John Smith',
      chat: 'Lorem ipsum simply dummy',
      mode: 'online',
    },
    {
      image: 'assets/img/user-2.jpg',
      name: 'Amanda Brown',
      chat: 'Lorem ipsum simply dummy',
      mode: 'online',
    },
    {
      image: 'assets/img/user-3.jpg',
      name: 'Justin Randolf',
      chat: 'Lorem ipsum simply dummy',
      mode: 'offline',
    },
    {
      image: 'assets/img/user-4.jpg',
      name: 'Randy SunSung',
      chat: 'Lorem ipsum simply dummy',
      mode: 'online',
    },
    {
      image: 'assets/img/user-5.jpg',
      name: 'Lisa Myth',
      chat: 'Lorem ipsum simply dummy',
      mode: 'online',
    },
  ];

  constructor(
    public menuItems: HorizontalMenuItems,
    public translate: TranslateService,
    private router: Router,
    private authService: AuthService,
    public coreService: CoreService,
    private activateRoute: ActivatedRoute,
    public dialog: MatDialog,
    private mailboxService: MailboxService,
    private permissions: NgxPermissionsService,
    private certificationRuleService: CertificationRuleService,
    private rncpTitlesService: RNCPTitlesService,
  ) {
    // const browserLang: string = translate.getBrowserLang();
    // translate.use(browserLang.match(/en|fr/) ? browserLang : 'fr');
  }

  ngOnInit() {
    this.subs.sink = this._routerEventsSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd && this.isMobile) {
        this.horizontalSideNav.close();
      }
    });
    if (!!this.permissions.getPermission('Student')) {
      this.getCertificationRule();
    } else {
      this.getUrgentMail();
    }
  }

  /**
   *As router outlet will emit an activate event any time a new component is being instantiated.
   */
  onActivate(e, scrollContainer) {
    scrollContainer.scrollTop = 0;
  }

  /**
   * toggleFullscreen method is used to show a template in fullscreen.
   */
  toggleFullscreen() {
    if (screenfull.enabled) {
      screenfull.toggle();
      this.isFullscreen = !this.isFullscreen;
    }
  }

  /**
   * customizerFunction is used to open and close the customizer.
   */

  customizerFunction() {
    this.customizerIn = !this.customizerIn;
  }

  /**
   * addClassOnBody method is used to add a add or remove class on body.
   */
  addClassOnBody(event) {
    var body = document.body;
    if (event.checked) {
      body.classList.add('dark-theme-active');
    } else {
      body.classList.remove('dark-theme-active');
    }
  }

  /**
   * logOut method is used to log out the template.
   */
  logOut() {
    this.authService.logOut();
  }

  /**
   * onDelete function is used to open the delete dialog.
   */
  onDelete(cart) {}

  /**
   * getPopupDeleteResponse is used to delete the cart item when reponse is yes.
   */
  getPopupDeleteResponse(response: any, cart) {}

  /**
   * changeLayout method is used to change the layout of menu items.
   */
  changeLayout() {
    this.router.navigate(['/dashboard/crm']);
  }

  /**
   * changeRTL method is used to change the layout of template.
   */
  changeRTL(isChecked) {
    if (isChecked) {
      this.layout = 'rtl';
    } else {
      this.layout = 'ltr';
    }
  }

  /**
   *chatMenu method is used to toggle a chat menu list.
   */
  chatMenu() {
    document.getElementById('gene-chat').classList.toggle('show-chat-list');
  }

  /**
   * onChatOpen method is used to open a chat window.
   */
  onChatOpen() {
    document.getElementById('chat-open').classList.toggle('show-chat-window');
  }

  /**
   * onChatWindowClose method is used to close the chat window.
   */

  chatWindowClose() {
    document.getElementById('chat-open').classList.remove('show-chat-window');
  }

  /**
   * toggleSidebar method is used a toggle a side nav bar.
   */
  toggleSidebar() {
    this.coreService.horizontalSideNavOpen = !this.coreService.horizontalSideNavOpen;
  }

  onResize(event) {
    if (event.target.innerWidth < 1200) {
      this.coreService.horizontalSideNavMode = 'over';
      this.coreService.horizontalSideNavOpen = false;
      var main_div = document.getElementsByClassName('app');
      for (let i = 0; i < main_div.length; i++) {
        if (!main_div[i].classList.contains('sidebar-overlay')) {
          if (document.getElementById('main-app')) {
            document.getElementById('main-app').className += ' sidebar-overlay';
          }
        }
      }
    } else {
      //for responsive
      var main_div = document.getElementsByClassName('app');
      for (let i = 0; i < main_div.length; i++) {
        if (main_div[i].classList.contains('sidebar-overlay')) {
          document.getElementById('main-app').classList.remove('sidebar-overlay');
        }
      }
    }
  }

  getUrgentMail() {
    this.subs.sink = this.mailboxService.getUrgentMail().subscribe(
      (mailList: any[]) => {
        if (mailList && mailList.length) {
          this.subs.sink = this.dialog
            .open(ReplyUrgentMessageDialogComponent, {
              disableClose: true,
              width: '825px',
              panelClass: 'certification-rule-pop-up',
              data: mailList,
            })
            .afterClosed()
            .subscribe((resp) => {
              this.subs.sink = this.mailboxService.getUrgentMail().subscribe(
                (mailUrgent: any[]) => {
                  if (mailUrgent && mailUrgent.length) {
                    this.replyUrgentMessageDialogComponent = this.dialog.open(ReplyUrgentMessageDialogComponent, {
                      disableClose: true,
                      width: '825px',
                      panelClass: 'certification-rule-pop-up',
                      data: mailUrgent,
                    });
                  }
                },
                (err) => {
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('SORRY'),
                    text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                    confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                  });
                },
              );
            });
        }
      },
      (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
  getCertificationRule() {
    const studentData = this.authService.getLocalStorageUser();
    const titleId = studentData.entities[0].assigned_rncp_title._id;
    const classId = studentData.entities[0].class._id;
    const studentId = studentData._id;
    this.subs.sink = this.rncpTitlesService.getRncpTitleById(titleId).subscribe((resp) => {
      this.selectedRncpTitleName = resp.short_name;
      this.selectedRncpTitleLongName = resp.long_name;
    });
    this.subs.sink = this.certificationRuleService
      .getCertificationRuleSentWithStudent(titleId, classId, studentId)
      .subscribe((dataRule: any) => {
        if (dataRule) {
          this.showCertificationRule(titleId, classId);
        }
      });
  }

  showCertificationRule(selectedRncpTitleId, selectedClassId) {
    // this.dialog.open(CertificationRulePopUpComponent, {
    //   panelClass: 'reply-message-pop-up',
    //   ...this.configCertificatioRule,
    //   data: {
    //     callFrom: 'global',
    //     titleId: selectedRncpTitleId,
    //     classId: selectedClassId,
    //     titleName: this.selectedRncpTitleName,
    //     titleLongName: this.selectedRncpTitleLongName,
    //   },
    // }).afterClosed().subscribe((result) => {
    //   this.getUrgentMail();
    // });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
