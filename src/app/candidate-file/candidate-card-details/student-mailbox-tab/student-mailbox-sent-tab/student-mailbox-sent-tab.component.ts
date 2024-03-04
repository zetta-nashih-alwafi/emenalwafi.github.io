import { Component, ViewChild, OnInit, OnDestroy, AfterViewInit, Input, OnChanges } from '@angular/core';
import { MatDialogConfig, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SubSink } from 'subsink';
import { MailboxService } from 'app/service/mailbox/mailbox.service';
import * as _ from 'lodash';
import { UntypedFormControl } from '@angular/forms';
import * as moment from 'moment';
import { debounceTime, startWith, tap, map } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { TranslateService } from '@ngx-translate/core';
import swal from 'sweetalert2';
import { AuthService } from 'app/service/auth-service/auth.service';
import { UrgentMessageDialogComponent } from 'app/urgent-message/urgent-message-dialog.component';
import { NgxPermissionsService } from 'ngx-permissions';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { CertificationRuleService } from 'app/service/certification-rule/certification-rule.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { SendMailDialogComponent } from 'app/mailbox/send-mail-dialog/send-mail-dialog.component';
import { MailToGroupDialogComponent } from 'app/mailbox/mail-to-group-dialog/mail-to-group-dialog.component';
import { ReplyUrgentMessageDialogComponent } from 'app/mailbox/reply-urgent-message-dialog/reply-urgent-message-dialog.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'ms-student-mailbox-sent-tab',
  templateUrl: './student-mailbox-sent-tab.component.html',
  styleUrls: ['./student-mailbox-sent-tab.component.scss'],
})
export class StudentMailboxSentTabComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() candidateId;
  private subs = new SubSink();
  inbox = false;
  cc = false;
  important = false;
  draft = false;
  trash = false;
  sent = true;
  isReset = false;

  IsReplyBtn = false;
  IsReplyAllBtn = false;
  IsForwardBtn = false;
  IsDeleteBtn = false;
  IsImportantBtn = false;
  isWaitRecipientGroup = false;
  IsMovetoInboxBtn = false;
  hideResetButton = false;
  noData: any;
  titleName: any;
  typeName: any;

  isSearching = false;
  selectedMails = [];
  mailSelected = [];
  checked = [];
  countSelected: boolean;

  sendMailDialogComponent: MatDialogRef<SendMailDialogComponent>;
  urgentMessageDialogComponent: MatDialogRef<UrgentMessageDialogComponent>;
  replyUrgentMessageDialogComponent: MatDialogRef<ReplyUrgentMessageDialogComponent>;
  mailToGroupDialogComponent: MatDialogRef<MailToGroupDialogComponent>;
  selectedRncpTitleLongName: any;
  selectedRncpTitleName: any;
  configCertificatioRule: MatDialogConfig = {
    disableClose: true,
  };
  config: MatDialogConfig = {
    disableClose: true,
    width: '800px',
  };
  urgentMessageConfig: MatDialogConfig = {
    disableClose: true,
    width: '600px',
  };

  inboxCount = 0;
  ccCount = 0;
  importantCount = 0;
  mailCategories;
  selection = new SelectionModel(true, []);
  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = ['select', 'created_at', 'timeTable', 'from', 'to', 'subject'];
  filterColumns: string[] = ['selectFilter', 'createdAtFilter', 'timeTableFilter', 'fromFilter', 'toFilter', 'subjectFilter'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /*Searching and filter*/
  dateFilter = new UntypedFormControl('');
  subjectFilter = new UntypedFormControl('');
  fromFilter = new UntypedFormControl('');
  toFilter = new UntypedFormControl('');

  filteredValues = {
    date: '',
    from: '',
    to: '',
    subject: '',
  };

  dataLoaded = false;
  sortValue: any;
  isWaitingForResponse = false;
  dataCount: number;
  selectedMailCategory = 'sent';

  mailsList = [];
  mailList = [];
  getCountOfCC = [];
  recpList = [];
  ccList = [];
  viewMessageData: any;

  senderId: string;
  senderName: string;
  senderEmail: string;

  recipientId: string;
  receipientName: string;
  receipientEmail: string;
  subject: string;
  message: string;
  messageDate: string;
  viewBcc = true;
  bccList = [];
  private timeOutVal: any;
  isOPERATORDir = false;
  isOPERATORAdmin = false;
  currentUser: any;
  datePipe: any;

  constructor(
    private mailboxService: MailboxService,
    private userService: AuthService,
    public translate: TranslateService,
    public dialog: MatDialog,
    private permissions: NgxPermissionsService,
    private certificationRuleService: CertificationRuleService,
    private rncpTitlesService: RNCPTitlesService,
    public permissionService: PermissionService,
  ) {}

  ngOnInit() {
    this.currentUser = this.userService.getLocalStorageUser();
    this.isOPERATORAdmin = !!this.permissions.getPermission('operator_admin');
    this.isOPERATORDir = !!this.permissions.getPermission('operator_dir');
    this.countSelected = false;
    this.sortValue = { latest_email: 'asc' };
    this.getSentMail();
    this.initSentMail();
  }

  ngOnChanges() {
    this.getSentMail();
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getSentMail();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getSentMail();
      }
    }
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      if (filterData[key]) {
        filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
      }
    });
    return filterQuery;
  }

  getSentMail() {
    const type = this.selectedMailCategory;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex,
    };
    const filter = this.cleanFilterData();
    if (this.candidateId) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.mailboxService.getNonMainMail(pagination, this.sortValue, type, filter, this.candidateId).subscribe(
        (mailList: any[]) => {
          this.isReset = false;
          this.isWaitingForResponse = false;
          if (mailList && mailList.length) {
            console.log(mailList);
            this.dataSource.data = mailList;
            this.dataSource.sort = this.sort;
            this.mailList = mailList;
            // this.dataSource.paginator = this.paginator;
            this.paginator.length = mailList[0] ? mailList[0].count_document : 0;
          } else {
            this.dataSource.data = [];
            this.paginator.length = 0;
          }
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        },
        (err) => {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
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
          swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
  }

  sendMailToGroup() {
    this.mailToGroupDialogComponent = this.dialog.open(MailToGroupDialogComponent, this.config);
  }

  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach((row) => this.selection.select(row));
  }
  checkboxLabel(row?): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data ? this.dataSource.data.length : null;
    const data = this.selection.selected;
    this.mailSelected = [];
    data.forEach((mail) => {
      this.mailSelected.push(mail._id);
    });
    return numSelected === numRows;
  }

  initSentMail() {
    this.subs.sink = this.dateFilter.valueChanges.subscribe((date) => {
      const newDate = moment(date).format('MM/DD/YYYY');
      console.log('date ' + newDate);
      this.filteredValues.date = date;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getSentMail();
      }
    });

    this.subs.sink = this.fromFilter.valueChanges.pipe(debounceTime(400)).subscribe((value) => {
      if (this.fromFilter.value !== '') {
        const symbol = /[()|{}\[\]:;<>?,\/]/;
        const symbol1 = /\\/;
        if (!value.match(symbol) && !value.match(symbol1)) {
          this.filteredValues.from = value ? value.toLowerCase() : '';
          console.log('from ' + this.filteredValues.from);
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getSentMail();
          }
        } else {
          this.fromFilter.setValue('');
          this.filteredValues.from = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getSentMail();
          }
        }
      }
    });

    this.subs.sink = this.toFilter.valueChanges.pipe(debounceTime(400)).subscribe((to) => {
      if (this.toFilter.value !== '') {
        const symbol = /[()|{}\[\]:;<>?,\/]/;
        const symbol1 = /\\/;
        if (!to.match(symbol) && !to.match(symbol1)) {
          this.filteredValues.to = to ? to.toLowerCase() : '';
          console.log('ddddddd' + to);
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getSentMail();
          }
        } else {
          this.toFilter.setValue('');
          this.filteredValues.to = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getSentMail();
          }
        }
      }
    });

    this.subs.sink = this.subjectFilter.valueChanges.pipe(debounceTime(400)).subscribe((subject) => {
      if (this.subjectFilter.value !== '') {
        const symbol = /[()|{}\[\]:;<>?,\/]/;
        const symbol1 = /\\/;
        if (!subject.match(symbol) && !subject.match(symbol1)) {
          this.filteredValues.subject = subject ? subject.toLowerCase() : '';
          console.log('ddddddd' + subject);
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getSentMail();
          }
        } else {
          this.subjectFilter.setValue('');
          this.filteredValues.subject = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getSentMail();
          }
        }
      }
    });
    this.mailCategories = this.mailboxService.getMailCategories();
  }

  resetFilter() {
    this.isReset = true;
    this.filteredValues = {
      date: '',
      from: '',
      to: '',
      subject: '',
    };

    this.sort.direction = '';
    this.sort.active = '';
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sortValue = this.sortValue = { latest_email: 'asc' };
    this.dataSource.data = [];
    this.paginator.pageIndex = 0;
    this.dateFilter.setValue('');
    this.subjectFilter.setValue('');
    this.fromFilter.setValue('');
    this.toFilter.setValue('');
    this.getSentMail();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.dataSource.data = [];
  }

  changePage(event: any) {
    if (!this.isReset) {
      this.getSentMail();
    }
  }

  onSelectMessage(data, index: number) {
    if (data.user_type_selection) {
      this.getRecipientName(data);
      this.isWaitRecipientGroup = true;
    } else {
      this.isWaitRecipientGroup = false;
    }
    this.viewMessageData = data;
    this.viewBcc = false;
    this.recpList = [];
    this.ccList = [];
    this.bccList = [];
    console.log('Update ', data);
    this.getCountOfCC = data.recipient_properties;

    if (this.getCountOfCC && this.getCountOfCC.length) {
      this.getCountOfCC.forEach((element) => {
        if (element.rank !== null && element.rank !== undefined) {
          if (element.rank === 'a') {
            this.recpList.push(element);
          }

          if (element.rank === 'cc') {
            this.ccList.push(element);
            element.recipients.forEach((mail) => {
              if (element.rank === 'cc') {
                this.viewBcc = true;
              }
            });
          }

          if (element.rank === 'c') {
            this.viewBcc = true;
            this.bccList.push(element);
            console.log('Ada BCC :', element);
          }

          element.recipients.forEach((mail) => {
            if (element.rank === 'c') {
              this.recpList.push(element);
            }
          });
        } else {
          data.recipient_properties[0].rank = 'a';
          this.recpList.push(data.recipient_properties[0]);
        }
      });
    }
    console.log('indeeex  ', index);
    this.viewMessageData['$$index'] = index;
  }

  onPreviousMessage(data) {
    this.viewBcc = false;
    this.recpList = [];
    this.ccList = [];
    this.bccList = [];
    const currentIndex = this.viewMessageData['$$index'] - 1;
    console.log('indeeexprevieus   ', currentIndex);
    this.viewMessageData = this.mailList[currentIndex];
    this.viewMessageData['$$index'] = currentIndex;

    this.getCountOfCC = this.mailList[currentIndex].recipient_properties;

    this.getCountOfCC.forEach((element, index) => {
      if (element.rank !== null && element.rank !== undefined) {
        if (element.rank === 'a') {
          this.recpList.push(element);
        }

        if (element.rank === 'cc') {
          this.ccList.push(element);
          element.recipients.forEach((mail) => {
            if (element.rank === 'cc') {
              this.viewBcc = true;
            }
          });
        }

        if (element.rank === 'c') {
          this.viewBcc = true;
          this.bccList.push(element);
          console.log('Ada BCC :', element);
        }

        element.recipients.forEach((mail) => {
          if (element.rank === 'c') {
            this.recpList.push(element);
          }
        });
      } else {
        data.recipient_properties[0].rank = 'a';
        this.recpList.push(data.recipient_properties[0]);
      }
    });
  }
  onNextMessage(data) {
    if (this.viewMessageData && this.viewMessageData['$$index'] + 1 < this.mailList.length) {
      this.viewBcc = false;
      this.recpList = [];
      this.ccList = [];
      this.bccList = [];
      const currentIndex = this.viewMessageData['$$index'] + 1;
      this.viewMessageData = this.mailList[currentIndex];
      this.viewMessageData['$$index'] = currentIndex;
      this.getCountOfCC = this.mailList[currentIndex].recipient_properties;

      this.getCountOfCC.forEach((element, index) => {
        if (element.rank !== null && element.rank !== undefined) {
          if (element.rank === 'a') {
            this.recpList.push(element);
          }

          if (element.rank === 'cc') {
            this.ccList.push(element);
            element.recipients.forEach((mail) => {
              if (element.rank === 'cc') {
                this.viewBcc = true;
              }
            });
          }

          if (element.rank === 'c') {
            this.viewBcc = true;
            this.bccList.push(element);
            console.log('Ada BCC :', element);
          }

          element.recipients.forEach((mail) => {
            if (element.rank === 'c') {
              this.recpList.push(element);
            }
          });
        } else {
          data.recipient_properties[0].rank = 'a';
          this.recpList.push(data.recipient_properties[0]);
        }
      });
    }
  }

  checkIsPreviousBtnShow() {
    const prevBtn = this.viewMessageData['$$index'] === 0 ? false : true;
    return prevBtn;
  }
  checkIsNextBtnShow() {
    return this.viewMessageData['$$index'] === this.mailList.length - 1 ? false : true;
  }

  OpenMailPopupRequest(data, tag) {
    this.config.data = {};
    this.sendMailDialogComponent = this.dialog.open(SendMailDialogComponent, this.config);
    this.sendMailDialogComponent.componentInstance.tags = [tag];
    this.sendMailDialogComponent.componentInstance.currentMailData = data;
    if (this.selectedMailCategory === 'sent') {
      this.sendMailDialogComponent.componentInstance.isSenderReq = false;
    }

    this.subs.sink = this.sendMailDialogComponent.afterClosed().subscribe((result) => {
      if (result === 'updateMailList') {
        if (!this.isReset) {
          this.getSentMail();
        }
      }
      this.sendMailDialogComponent = null;
    });
  }

  getFileName(fileName: String): string {
    if (fileName) {
      return fileName.substring(fileName.lastIndexOf('/') + 1);
    }
    return '';
  }

  downloadFile(file) {
    console.log(file);
    const a = document.createElement('a');
    a.target = '_blank';
    a.href = file.path;
    a.download = file.file_name;
    a.click();
    a.remove();
  }

  public openDialog(data) {
    let timeDisabled = 3;
    let title = 'Are you sure?';
    let message = 'You are about to delete this message';
    if (this.translate.currentLang === 'fr') {
      title = 'tes-vous sr?';
      message = 'Vous allez supprimer ce message';
    }
    const sender_property = {
      mail_type: 'trash',
    };
    swal
      .fire({
        title: this.translate.instant('MailBox.MESSAGES.ATTENTION'),
        text: this.translate.instant('MailBox.MESSAGES.ASKMSG'),
        type: 'warning',
        showCancelButton: true,
        allowEscapeKey: true,
        confirmButtonText: this.translate.instant('SWEET_ALERT.DELETE.CONFIRM', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('SWEET_ALERT.DELETE.CANCEL'),
        onOpen: () => {
          swal.disableConfirmButton();
          const confirmBtnRef = swal.getConfirmButton();
          const time = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM') + ' in ' + timeDisabled + ' sec';
          }, 1000);

          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM');
            swal.enableConfirmButton();
            clearInterval(time);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      })
      .then((result) => {
        clearTimeout(this.timeOutVal);
        if (result.value) {
          this.viewMessageData = [];
          const ids = [];
          ids.push(data._id);
          this.subs.sink = this.mailboxService.updateMultipleMailSender(ids, sender_property).subscribe(
            (dataa: any) => {
              swal.fire({
                type: 'success',
                title: this.translate.instant('MailBox.MESSAGES.DELMSG'),
                text: '',
                confirmButtonText: this.translate.instant('MailBox.MESSAGES.THANK'),
              });
              if (!this.isReset) {
                this.getSentMail();
              }
            },
            (err) => {
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
              swal.fire({
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

  sendMail() {
    this.sendMailDialogComponent = this.dialog.open(SendMailDialogComponent, this.config);
    this.subs.sink = this.sendMailDialogComponent.afterClosed().subscribe((result) => {
      if (!this.isReset) {
        this.getSentMail();
      }
      this.sendMailDialogComponent = null;
    });
  }

  // this function execute when we click to delete mail
  onDeleteMail() {
    let timeDisabled = 3;
    const sender_property = {
      mail_type: 'trash',
    };

    let title = 'Are you sure?';
    let message = 'You are about to delete this message';
    if (this.translate.currentLang === 'fr') {
      title = 'tes-vous sr?';
      message = 'Vous allez supprimer ce message';
    }

    swal
      .fire({
        title: this.translate.instant('MailBox.MESSAGES.ATTENTION'),
        text: this.translate.instant('MailBox.MESSAGES.ASKMSG'),
        type: 'warning',
        showCancelButton: true,
        allowEscapeKey: true,
        confirmButtonText: this.translate.instant('SWEET_ALERT.DELETE.CONFIRM', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('SWEET_ALERT.DELETE.CANCEL'),
        onOpen: () => {
          swal.disableConfirmButton();
          const confirmBtnRef = swal.getConfirmButton();
          const time = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM') + ' in ' + timeDisabled + ' sec';
          }, 1000);

          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM');
            swal.enableConfirmButton();
            clearInterval(time);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      })
      .then((result) => {
        clearTimeout(this.timeOutVal);
        if (result.value) {
          this.viewMessageData = [];
          this.subs.sink = this.mailboxService.updateMultipleMailSender(this.mailSelected, sender_property, this.candidateId).subscribe(
            (data: any) => {
              swal.fire({
                type: 'success',
                title: this.translate.instant('MailBox.MESSAGES.DELMSG'),
                text: '',
                confirmButtonText: this.translate.instant('MailBox.MESSAGES.THANK'),
              });
              if (!this.isReset) {
                this.getSentMail();
              }
            },
            (err) => {
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
              swal.fire({
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
  showOptions() {
    const numSelected = this.selection.selected.length;
    if (numSelected > 0) {
      this.countSelected = true;
    } else {
      this.countSelected = false;
    }
  }

  receiveEmail() {
    if (!this.isReset) {
      this.getSentMail();
    }
  }

  mailMoveTo(mail_type) {
    const recipient_properties = {
      mail_type: mail_type,
    };
    this.viewMessageData = [];
    this.subs.sink = this.mailboxService.updateMultipleMailRecipient(this.mailSelected, recipient_properties).subscribe(
      (data: any) => {
        if (!this.isReset) {
          this.getSentMail();
        }
      },
      (err) => {
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
        swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  sendUrgentMessage() {
    this.urgentMessageDialogComponent = this.dialog.open(UrgentMessageDialogComponent, this.urgentMessageConfig);
  }
  getMessage(data) {
    if (data) {
      data = data.replaceAll('<table>', '<table class="notif-table full-width" border="1">');
      if (data && data.includes('<a')) {
        if (data && !data.includes('target')) {
          data = data.replaceAll('<a', '<a target="blank" class="blue-link-format"');
        }
      }
      return data;
    } else {
      return '';
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
                  swal.fire({
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
        swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
  getCertificationRule() {
    const studentData = this.userService.getLocalStorageUser();
    const titleId = studentData.entities[0].assigned_rncp_title._id;
    const classId = studentData.entities[0].class._id;
    const studentId = studentData._id;
    this.subs.sink = this.rncpTitlesService.getRncpTitleById(titleId).subscribe(
      (resp) => {
        this.selectedRncpTitleName = resp.short_name;
        this.selectedRncpTitleLongName = resp.long_name;
      },
      (err) => {
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
        swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
    this.subs.sink = this.certificationRuleService.getCertificationRuleSentWithStudent(titleId, classId, studentId).subscribe(
      (dataRule: any) => {
        if (dataRule) {
          // this.showCertificationRule(titleId, classId);
        } else {
          this.getUrgentMail();
        }
      },
      (err) => {
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
        swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
  getRecipientName(data) {
    console.log('This group recipient : ', data);
    if (data.group_detail.rncp_titles && data.group_detail.rncp_titles.length) {
      this.subs.sink = this.mailboxService.getOneTitle(data.group_detail.rncp_titles[0]._id).subscribe(
        (resp) => {
          if (resp) {
            this.titleName = resp.short_name;
          }
        },
        (err) => {
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
          swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
    if (data.group_detail.user_types && data.group_detail.user_types.length) {
      this.subs.sink = this.mailboxService.getOneUserTypes(data.group_detail.user_types[0]._id).subscribe(
        (respp) => {
          if (respp) {
            this.typeName = respp.name;
          }
        },
        (err) => {
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
          swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
    this.isWaitRecipientGroup = false;
  }

  showCertificationRule(selectedRncpTitleId, selectedClassId) {
    // this.dialog
    //   .open(CertificationRulePopUpComponent, {
    //     panelClass: 'reply-message-pop-up',
    //     ...this.configCertificatioRule,
    //     data: {
    //       callFrom: 'global',
    //       titleId: selectedRncpTitleId,
    //       classId: selectedClassId,
    //       titleName: this.selectedRncpTitleName,
    //       titleLongName: this.selectedRncpTitleLongName,
    //     },
    //   })
    //   .afterClosed()
    //   .subscribe((result) => {
    //     this.getUrgentMail();
    //   });
  }
  momentlang(event) {
    const dateRaw: any = moment(event).format('DD/MM/YYYY');
    if (typeof dateRaw === 'object') {
      const date = new Date(dateRaw.year, dateRaw.month, dateRaw.date, dateRaw.hour, dateRaw.minute);
      this.datePipe = new DatePipe(this.translate.currentLang);
      return this.datePipe.transform(date, 'EEE d MMM, y');
    } else {
      let date = dateRaw;
      if (typeof date === 'number') {
        date = date.toString();
      }
      if (date.length === 8) {
        const year: number = parseInt(date.substring(0, 4));
        const month: number = parseInt(date.substring(4, 6));
        const day: number = parseInt(date.substring(6, 8));
        date = new Date(year, month, day);
      }
      this.datePipe = new DatePipe(this.translate.currentLang);
      const formatDate = moment(date, 'DD/MM/YYYY');
      const dateTranslate = this.datePipe.transform(formatDate, 'EEEE d MMMM y');
      return dateTranslate;
    }
  }

  translateTime(data) {
    return moment(data, 'HH:mm').format('H:mm');
  }
}
