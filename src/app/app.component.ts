import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from './service/auth-service/auth.service';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { SubSink } from 'subsink';
import { MailboxService } from './service/mailbox/mailbox.service';
import { UtilityService } from './service/utility/utility.service';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { NotificationBarService } from './service/notification-bar/notification-bar.service';

@Component({
  selector: 'ms-app',
  template: `<ngx-loading-bar></ngx-loading-bar><router-outlet></router-outlet>`,
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  urgentMessageConfig: MatDialogConfig = {
    disableClose: true,
    width: '825px',
    panelClass: 'certification-rule-pop-up',
  };
  constructor(
    translate: TranslateService,
    private permissionsService: NgxPermissionsService,
    private authService: AuthService,
    public dialog: MatDialog,
    private mailboxService: MailboxService,
    private utilService: UtilityService,
    private titleService: Title,
    private meta: Meta,
    private router: Router,
    private notificationBarService: NotificationBarService
  ) {
    translate.addLangs(['en', 'fr', 'he', 'ru', 'ar', 'zh', 'de', 'es', 'ja', 'ko', 'it', 'hu', 'id']);
    translate.setDefaultLang('fr');

    this.meta.addTags([
      { name: 'description', content: "Groupe EDH est le leader français de l'enseignement supérieur dans les domaines de la communication, du management artistique et culturel, du cinéma, du journalisme, du design graphique et de la création digitale." },
      { name: 'keywords', content: 'edh, EDH Group, Groupe EDH, Groupe EDH SAS' }
    ]);

    // const browserLang: string = translate.getBrowserLang();
    // translate.use(browserLang.match(/fr|en/) ? browserLang : 'fr');
  }

  ngOnInit(): void {
    this.utilService.getAppPermission().subscribe((resp) => {
      const title = resp && resp.group_name ? resp.group_name : 'Operator';
      this.titleService.setTitle(title);
      this.utilService.operator = resp;
    });
    if (localStorage.getItem('permissions')) {
      const permissions = this.authService.getPermission();
      this.permissionsService.loadPermissions(permissions);
    }
    this.getAllLiveNotifications();
  }

  getAllLiveNotifications() {
    this.subs.sink = this.router.events
      .pipe(
        filter((events) => events instanceof NavigationEnd),
        switchMap(() => {
        const user = JSON.parse(localStorage.getItem('userProfile'));
        let isNotMenuRoute = false;
        const notMenuRoute = [
          'form-filling', 
          'session', 
          'admission-diploma', 
          'form-fill', 
          'job-offer-creation',
          'company-creation',
          'student-profile-internship',
          'internship-agreement',
          'form-teacher-contract',
          'form-continuous',
          'form-survey',
          'form-fc-contract',
          'financial',
          'term-payment',
          'special-form',
        ];
        for(let menu of notMenuRoute) {
          if (!user?._id || this.router.url.includes(menu)) {
            isNotMenuRoute = true;
            break;
          } else {
            isNotMenuRoute = false;
          };
        };

        if(isNotMenuRoute) {
          return of([]);
        } else {
          return this.notificationBarService.getAllNotificationForCount();
        }
    }),
  ).subscribe((count) => {
      this.notificationBarService.setNotificationCount(count);
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
