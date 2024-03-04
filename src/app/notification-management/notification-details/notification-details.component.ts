import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTab, MatTabGroup, MatTabHeader } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { forkJoin, Observable } from 'rxjs';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { NotificationDetail, NotificationManagementService, Templates } from '../notification-management.service';
import { NotificationTemplateComponent } from './notification-template/notification-template.component';

@Component({
  selector: 'ms-notification-details',
  templateUrl: './notification-details.component.html',
  styleUrls: ['./notification-details.component.scss'],
})
export class NotificationDetailsComponent implements OnInit, OnDestroy {
  @ViewChild('templateTabGroup', { static: false }) tabGroup: MatTabGroup;
  @ViewChild('templateId', { static: false }) templateChild: NotificationTemplateComponent;
  private subs = new SubSink();
  detail: NotificationDetail;
  templates: Templates[];
  notification_id: string;
  isWaitingForResponse = false;
  identity: string;
  hasDefaultTemplate = false;
  selectedIndex: number;

  constructor(
    private notificationService: NotificationManagementService,
    private route: ActivatedRoute,
    private pageTitleService: PageTitleService,
    private translate: TranslateService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // this.route.queryParams.subscribe((params) => {
    //   if (params['id']) {
    //     this.notification_id = params['id'];
    //     this.fetchNotificationData(params['id']);
    //   }
    // });

    this.notification_id = this.route.snapshot.queryParamMap.get('id');
    if (this.notification_id) {
      this.fetchNotificationData(this.notification_id);
    }

    // when changes occur in children, refresh the data in parent and pass back on the updated one
    this.notificationService.refresh.subscribe((shouldRefresh) => {
      if (shouldRefresh) {
        this.fetchNotificationData(this.notification_id, true);
      }
    });

    // Set page title based on language change
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setPageTitle();
    });

    this.subs.sink = this.notificationService.isHasDefaultTemplate$.subscribe((res) => (this.hasDefaultTemplate = res));

    setTimeout(() => {
      this.tabGroup._handleClick = this.interceptTabChange.bind(this);
    }, 500);
  }

  // fetch both the templates and the notification detail
  fetchNotificationData(notificationId: string, fromRefresh?) {
    this.isWaitingForResponse = true;
    const requests = [this.getOneNotificationReference(notificationId), this.getTemplateList(notificationId)];
    this.subs.sink = forkJoin(requests).subscribe(
      ([detail, templates]) => {
        this.isWaitingForResponse = false;
        this.detail = detail;
        this.templates = templates;
        if (!fromRefresh) {
          this.setPageTitle();
        }
      },
      (error) => {
        this.authService.postErrorLog(error);
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getOneNotificationReference(notificationId: string) {
    return this.notificationService.getOneNotificationReference(notificationId);
  }

  getTemplateList(notificationId: string) {
    const filter = {
      notification_reference_id: notificationId,
    };
    return this.notificationService.getAllNotificationTemplates(filter);
  }

  navigateToTabWithId(templateId: string) {
    const templateIndex = this.templates.findIndex((template: Templates) => template._id === templateId);
    // console.log(templateIndex);
    this.tabGroup.selectedIndex = templateIndex + 1;
  }

  setPageTitle() {
    if (this.detail) {
      const editText = this.translate.instant('Edit Notification') + ' - ' + this.detail.notification_reference;
      this.pageTitleService.setTitle(editText);
      this.pageTitleService.setIcon('clipboard-flow');
    }
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    let validation: Boolean;
    let validation2: Boolean;
    validation2 = false;
    validation = false;
    if (!this.hasDefaultTemplate) {
      validation = true;
    }
    if (this.templateChild && this.templateChild.child) {
      validation2 = this.templateChild.child.checkComparison() ? false : true;
    } else {
      validation2 = false;
    }
    if (validation2) {
      return new Promise((resolve, reject) => {
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('TMTC_S01.TITLE'),
          text: this.translate.instant('TMTC_S01.TEXT'),
          confirmButtonText: this.translate.instant('TMTC_S01.BUTTON_1'),
          showCancelButton: true,
          cancelButtonText: this.translate.instant('TMTC_S01.BUTTON_2'),
          allowOutsideClick: false,
        }).then((result) => {
          if (result.value) {
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    } else if (validation) {
      return new Promise((resolve, reject) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Notif_S21.TITLE'),
          text: this.translate.instant('Notif_S21.TEXT'),
          confirmButtonText: this.translate.instant('Notif_S21.BUTTON'),
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then((result) => {
          if (result.value) {
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    } else {
      return true;
    }
  }

  interceptTabChange(tab: MatTab, tabHeader: MatTabHeader, idx: number) {
    let validation: Boolean;
    validation = false;
    if (this.templateChild && this.templateChild.child) {
      validation = this.templateChild.child.checkComparison() ? false : true;
    } else {
      validation = false;
    }
    if (validation) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('TMTC_S01.TITLE'),
        text: this.translate.instant('TMTC_S01.TEXT'),
        confirmButtonText: this.translate.instant('TMTC_S01.BUTTON_1'),
        showCancelButton: true,
        cancelButtonText: this.translate.instant('TMTC_S01.BUTTON_2'),
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.value) {
          return;
        } else {
          return MatTabGroup.prototype._handleClick.apply(this.tabGroup, arguments);
        }
      });
    } else {
      return MatTabGroup.prototype._handleClick.apply(this.tabGroup, arguments);
    }
  }

  ngOnDestroy(): void {
    this.pageTitleService.setTitle('');
    this.pageTitleService.setIcon('');
    this.subs.unsubscribe();
  }
}
