import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NotificationManagementService } from 'app/notification-management/notification-management.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import _ from 'lodash';
import { NotificationTemplateDetailsComponent } from './notification-template-details/notification-template-details.component';

@Component({
  selector: 'ms-notification-template',
  templateUrl: './notification-template.component.html',
  styleUrls: ['./notification-template.component.scss'],
})
export class NotificationTemplateComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  selectedLang: any = 'EN';
  @Input() templateId: any;
  published;
  payload: any;
  @ViewChild('ChildCmp', { static: false }) child: NotificationTemplateDetailsComponent;
  disablePublish: boolean;
  refresh: any;
  notificationId: any;
  isWaitingForResponse: boolean;
  validationPublish: boolean;
  selectedIndex: number;

  constructor(
    private notificationService: NotificationManagementService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    // this.route.queryParams.subscribe((params) => {
    //   if (params['id']) {
    //     this.notificationId = params['id'];
    //   }
    // });

    this.notificationId = this.route.snapshot.queryParamMap.get('id');
    this.getOneTemplate();
  }

  getOneTemplate() {
    if (this.templateId) {
      this.subs.sink = this.notificationService.getOneTemplate(this.templateId).subscribe((res) => {
        if (res) {
          this.published = res.is_publish;
          this.validationPublish = res.is_publish && !res.is_default_template ? true : false;
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        if (
          err && err['message'] && (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.authService.handlerSessionExpired();
          return;
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
      );
    }
  }

  selectLanguage(lang) {
    if (!this.child.checkComparison() && this.selectedLang !== lang) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('TMTC_S01.TITLE'),
        text: this.translate.instant('TMTC_S01.TEXT'),
        confirmButtonText: this.translate.instant('TMTC_S01.BUTTON_1'),
        showCancelButton: true,
        cancelButtonText: this.translate.instant('TMTC_S01.BUTTON_2'),
        allowOutsideClick: false,
      }).then((res) => {
        if (res.dismiss) {
          this.selectedLang = lang;
        }
        if (res.value) {
          return;
        }
      });
    } else {
      this.selectedLang = lang;
    }
  }

  swalFieldisRequired() {
    return Swal.fire({
      type: 'warning',
      title: this.translate.instant('FormSave_S1.TITLE'),
      html: this.translate.instant('FormSave_S1.TEXT'),
      confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
    });
  }

  onSave() {
    this.child.checkIsFieldFilled();
    if (
      (this.selectedLang === 'EN' && (!this.child.bodyData || !this.child.subjectDataEN)) ||
      (this.selectedLang === 'FR' && (!this.child.bodyData || !this.child.subjectDataFR))
    ) {
      this.swalFieldisRequired();
    } else {
      this.isWaitingForResponse = true;
      if (this.validationPublish) {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Notif_S18.TITLE'),
          text: this.translate.instant('Notif_S18.TEXT'),
          confirmButtonText: this.translate.instant('Notif_S18.BUTTON1'),
          allowEnterKey: false,
          allowEscapeKey: false,
          allowOutsideClick: false,
        }).then(() => {
          this.isWaitingForResponse = false;
          return;
        });
      } else {
        const payload = this.child.createPayload();
        payload.notification_reference_id = payload.notification_reference_id._id;
        if (payload.program_seasons && payload.program_seasons.length > 0) {
          payload.program_seasons = payload.program_seasons.map((pro) => {
            const programs = pro.programs.map((mapped) => mapped._id);
            return {
              scholar_season: pro.scholar_season._id,
              programs,
            };
          });
        }
        if (payload && this.templateId) {
          this.subs.sink = this.notificationService.updateNotificationTemplate(this.templateId, payload).subscribe(
            (res) => {
              if (res) {
                this.isWaitingForResponse = false;
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('Notif_S11.TITLE'),
                  text: this.translate.instant('Notif_S11.TEXT'),
                  confirmButtonText: this.translate.instant('Notif_S13.BUTTON1'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.getOneTemplate();
                  this.child.refetch();
                });
              }
            },
            (err) => {
              this.authService.postErrorLog(err);
              this.isWaitingForResponse = false
              if (
err && err['message'] && (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
              ) {
                this.authService.handlerSessionExpired();
                return;
              }
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            },
          );
        }
      }
    }
  }

  onPublish() {
    this.isWaitingForResponse = true;
    if (this.child.disablePublish()) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Notif_S17.TITLE'),
        text: this.translate.instant('Notif_S17.TEXT'),
        confirmButtonText: this.translate.instant('Notif_S17.BUTTON1'),
        allowEnterKey: false,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then(() => {
        this.isWaitingForResponse = false;
        return;
      });
    } else {
      const payload = this.child.createPayload();
      payload.notification_reference_id = payload.notification_reference_id._id;
      if (payload.program_seasons && payload.program_seasons.length > 0) {
        payload.program_seasons = payload.program_seasons.map((pro) => {
          const programs = pro.programs.map((mapped) => mapped._id);
          return {
            scholar_season: pro.scholar_season._id,
            programs,
          };
        });
      }
      if (!payload.is_publish) {
        payload.is_publish = true;
      }
      Swal.fire({
        title: this.translate.instant('Notif_S12.TITLE'),
        html: this.translate.instant('Notif_S12.TEXT', { templateName: payload.template_name }),
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: this.translate.instant('Notif_S12.BUTTON1'),
        cancelButtonText: this.translate.instant('Notif_S12.BUTTON2'),
      }).then((result) => {
        if (result.value) {
          if (payload && this.templateId) {
            this.subs.sink = this.notificationService.updateNotificationTemplate(this.templateId, payload).subscribe(
              (res) => {
                if (res) {
                  this.isWaitingForResponse = false;
                  Swal.fire({
                    type: 'success',
                    title: this.translate.instant('Notif_S13.TITLE'),
                    text: this.translate.instant('Notif_S13.TEXT', { templateName: payload.template_name }),
                    confirmButtonText: this.translate.instant('Notif_S13.BUTTON1'),
                    allowEnterKey: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                  }).then((confirm) => {
                    if (confirm) {
                      this.getOneTemplate();
                      this.child.refetch();
                    }
                  });
                }
              },
              (err) => {
                this.authService.postErrorLog(err);
                this.isWaitingForResponse = false
                if (
            err && err['message'] && (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
                ) {
                  this.authService.handlerSessionExpired();
                  return;
                }
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('SORRY'),
                  text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                  confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                });
              },
            );
          }
        } else {
          this.isWaitingForResponse = false;
        }
      });
    }
  }

  onUnPublish() {
    this.isWaitingForResponse = true;
    const payload = this.child.createPayload();
    payload.notification_reference_id = payload.notification_reference_id._id;
    if (payload.program_seasons && payload.program_seasons.length > 0) {
      payload.program_seasons = payload.program_seasons.map((pro) => {
        const programs = pro.programs.map((mapped) => mapped._id);
        return {
          scholar_season: pro.scholar_season._id,
          programs,
        };
      });
    }
    if (payload.is_publish) {
      payload.is_publish = false;
    }
    Swal.fire({
      title: this.translate.instant('Notif_S14.TITLE'),
      html: this.translate.instant('Notif_S14.TEXT', { templateName: payload.template_name }),
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: this.translate.instant('Notif_S14.BUTTON1'),
      cancelButtonText: this.translate.instant('Notif_S14.BUTTON2'),
    }).then((result) => {
      if (result.value) {
        if (payload && this.templateId) {
          this.subs.sink = this.notificationService.updateNotificationTemplate(this.templateId, payload).subscribe(
            (res) => {
              if (res) {
                this.isWaitingForResponse = false;
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('Notif_S15.TITLE'),
                  text: this.translate.instant('Notif_S15.TEXT', { templateName: payload.template_name }),
                  confirmButtonText: this.translate.instant('Notif_S15.BUTTON1'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then((confirm) => {
                  if (confirm) {
                    this.getOneTemplate();
                    this.child.refetch();
                  }
                });
              }
            },
            (err) => {
              this.authService.postErrorLog(err);
              this.isWaitingForResponse = false;
              if (
err && err['message'] && (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
              ) {
                this.authService.handlerSessionExpired();
                return;
              }
              // console.log(err);
              if (err.message.includes('Cannot UnPublish Default Template')) {
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('Notif_S20.TITLE'),
                  html: this.translate.instant('Notif_S20.TEXT'),
                  confirmButtonText: this.translate.instant('Notif_S20.BUTTON'),
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                });
              }
            },
          );
        }
      } else {
        this.isWaitingForResponse = false;
      }
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
