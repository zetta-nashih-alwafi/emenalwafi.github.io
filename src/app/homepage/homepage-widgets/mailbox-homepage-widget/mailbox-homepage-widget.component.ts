import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedModule } from 'app/shared/shared.module';
import { SubSink } from 'subsink';
import { MailboxService } from 'app/service/mailbox/mailbox.service';
import { cloneDeep } from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/service/auth-service/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-mailbox-homepage-widget',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './mailbox-homepage-widget.component.html',
  styleUrls: ['./mailbox-homepage-widget.component.scss'],
})
export class MailboxHomepageWidgetComponent implements OnInit, OnDestroy {
  recentMails: any[] = [];
  private subs = new SubSink();
  currentUser = JSON.parse(localStorage.getItem('userProfile'));
  filteredValues = {
    date: '',
    from: '',
    to: '',
    subject: '',
  };
  dataLength: number;
  datePipe: DatePipe;
  clickedIndex;
  isWaitingForResponse: boolean = false;
  is_starred: boolean = false;
  private timeOutVal: any;

  constructor(
    private mailboxService: MailboxService,
    public translate: TranslateService,
    private userService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getRecentMails();
  }

  getRecentMails() {
    const pagination = { page: 0, limit: 5 };
    const sorting = { latest_email: 'asc' };
    const recipientRank = null;
    const new_mail = true;
    const filter = this.cleanFilterData();
    this.subs.sink = this.mailboxService
      .getMainMail(pagination, sorting, 'inbox', new_mail, filter, recipientRank, this.currentUser._id)
      .subscribe((res) => {
        if (Array.isArray(res) && res[0]) {
          this.dataLength = res[0].count_document;

          this.recentMails = cloneDeep(res).map((mail) => {
            mail.message = mail.message ? mail.message.replace(/\&nbsp;/g, ' ') : null;
            mail.is_read = mail.recipient_properties.some((property) => property.rank === 'a' && property.is_read);
            return mail;
          });
        }
      });
  }

  cleanFilterData() {
    const filterData = cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      if (filterData[key]) {
        filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
      }
    });
    return filterQuery;
  }

  getTranslatedDate(dateRaw) {
    if (dateRaw) {
      this.datePipe = new DatePipe(this.translate.currentLang);
      if (this.datePipe && this.datePipe['locale']) {
        const dateTranslate = this.datePipe.transform(dateRaw, 'MMM dd');
        return dateTranslate;
      }
      return '';
    }
    return '';
  }

  emailDetails(recent) {
    const emailId = recent._id;
    const payload = { is_read: true };
    const emailIdx = this.recentMails.findIndex((mail: any) => mail._id === recent._id);
    const newEmail = {
      ...recent,
      recipient_properties: recent.recipient_properties.map((property: any) => {
        if (property.rank === 'a') return { ...property, is_read: true };
        return property;
      }),
    };
    this.isWaitingForResponse = true;
    this.recentMails[emailIdx] = newEmail;
    this.subs.sink = this.mailboxService.updateMultipleMailRecipient([emailId], payload).subscribe((resp) => {
      if (resp) {
        this.router.navigate(['/mailbox/inbox'], { queryParams: { selectedEmailId: recent._id } });
      }
      this.isWaitingForResponse = false;
    });
  }

  mailMoveTo(mail, mail_type) {
    const recipient_properties = {
      mail_type: mail_type,
    };
    const id = mail?._id;

    this.subs.sink = this.mailboxService.updateMultipleMailRecipient(id, recipient_properties).subscribe(
      () => {},
      (err) => {
        this.userService.postErrorLog(err);
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
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

  getRecipientStatus(idx: number) {
    return this.recentMails[idx].recipient_properties.find((recipient: any) => recipient.rank === 'a');
  }

  setAsImportant(mail: any) {
    if (mail?.recipient_properties[0]?.mail_type === 'important') {
      this.mailMoveTo(mail, 'inbox');
    } else if (mail?.recipient_properties[0]?.mail_type === 'inbox') {
      this.mailMoveTo(mail, 'important');
    }
  }

  onDeleteMail(mail) {
    const recipient_properties = {
      mail_type: 'trash',
    };

    let title = 'Are you sure?';
    let message = 'You are about to delete this message';
    if (this.translate.currentLang === 'fr') {
      title = 'tes-vous sr?';
      message = 'Vous allez supprimer ce message';
    }
    let timeDisabled = 3;

    Swal.fire({
      title: this.translate.instant('MailBox.MESSAGES.ATTENTION'),
      text: this.translate.instant('MailBox.MESSAGES.ASKMSG'),
      type: 'warning',
      showCancelButton: true,
      allowEscapeKey: true,
      confirmButtonText: this.translate.instant('SWEET_ALERT.DELETE.CONFIRM', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('SWEET_ALERT.DELETE.CANCEL'),
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const time = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM') + ' in ' + timeDisabled + ' sec';
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM');
          Swal.enableConfirmButton();
          clearInterval(time);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((result) => {
      clearTimeout(this.timeOutVal);
      if (result.value) {
        this.subs.sink = this.mailboxService.updateMultipleMailRecipient(mail._id, recipient_properties).subscribe(
          (data: any) => {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('MailBox.MESSAGES.DELMSG'),
              text: '',
              confirmButtonText: this.translate.instant('MailBox.MESSAGES.THANK'),
            });
            if (data) {
              this.getRecentMails();
            }
          },
          (err) => {
            this.userService.postErrorLog(err);
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      }
    });
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    this.subs.unsubscribe();
  }
}
