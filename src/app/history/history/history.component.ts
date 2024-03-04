import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from './../../models/bread-crumb-filter.model';
import { Component, ViewChild, OnInit, OnDestroy, AfterViewInit, Input } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HistoryService } from '../../service/history/history.service';
import * as _ from 'lodash';
import { SubSink } from 'subsink';
import { UntypedFormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { startWith, map, tap, debounceTime } from 'rxjs/operators';
import { ViewHistoryComponent } from '../view-history/view-history.component';
import { SendMailDialogComponent } from 'app/mailbox/send-mail-dialog/send-mail-dialog.component';
import { NotificationHistory } from 'app/models/notification-history.model';
import { SchoolService } from 'app/service/schools/school.service';
import { Observable, of } from 'rxjs';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { ReplyUrgentMessageDialogComponent } from 'app/mailbox/reply-urgent-message-dialog/reply-urgent-message-dialog.component';
import { MailboxService } from 'app/service/mailbox/mailbox.service';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { UtilityService } from 'app/service/utility/utility.service';
import { TeacherContractService } from 'app/teacher-contract/teacher-contract.service';
import Swal from 'sweetalert2';
import { AuthService } from 'app/service/auth-service/auth.service';
import { PermissionService } from 'app/service/permission/permission.service';

@Component({
  selector: 'ms-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  providers: [ParseStringDatePipe, ParseLocalToUtcPipe, ParseUtcToLocalPipe],
})
export class HistoryComponent implements OnInit, AfterViewInit, OnDestroy {
  replyUrgentMessageDialogComponent: MatDialogRef<ReplyUrgentMessageDialogComponent>;
  @Input() type: string;
  private subs = new SubSink();
  datePipe: DatePipe;
  dataSource = new MatTableDataSource([]);
  noData: any;
  displayedColumns: string[] = ['sentDate', 'sentTime', 'notificationReference', 'notificationSubject', 'program', 'from', 'to', 'action'];
  filterColumns: string[] = [
    'dateFilter',
    'timeFilter',
    'notifRefFilter',
    'notifSubjectFilter',
    'programFilter',
    'fromFilter',
    'toFilter',
    'actionFilter',
  ];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  notifRefArray: any[] = [];
  filteredRefArray: Observable<any[]>;
  notifSubjectArray = [];
  programArray: { _id: string; program: string }[] = [];
  filteredProgramArray: Observable<{ _id: string; program: string }[]>;
  programList: any[] = [];

  dateFilter = new UntypedFormControl('');
  timeFilter = new UntypedFormControl('');
  fromDateFilter = new UntypedFormControl('');
  toDateFilter = new UntypedFormControl('');
  notifRefFilter = new UntypedFormControl('All');
  notifSubjectFilter = new UntypedFormControl('');
  programFilter = new UntypedFormControl(null);
  fromFilter = new UntypedFormControl('');
  toFilter = new UntypedFormControl('');
  notificationHistoryDate = new UntypedFormControl('');
  offsetFilter = new UntypedFormControl('');

  filteredValues: any = {
    sent_date: '',
    sent_time: '',
    from_date: '',
    to_date: '',
    notif_ref: '',
    notif_sub: '',
    program_id: '',
    program_ids: null,
    from_user: '',
    to_user: '',
    subject_name: '',
    test_name: '',
    notification_history_date: '',
  };
  sortValue = null;

  historyList: NotificationHistory[] = [];
  isReset = false;
  dataLoaded = false;
  isWaitingForResponse = false;
  historyCount: number;
  maxDate;
  filterBreadcrumbData = [];

  tempDataFilter = {
    program: null,
  };

  filteredValuesAll = {
    program_ids: 'All',
  };

  public dialogRefViewHistory: MatDialogRef<ViewHistoryComponent>;
  public sendMailDialogComponent: MatDialogRef<SendMailDialogComponent>;
  config: MatDialogConfig = { disableClose: true, width: '800px' };

  constructor(
    private historyService: HistoryService,
    private datepipe: DatePipe,
    private translate: TranslateService,
    private dialog: MatDialog,
    private mailboxService: MailboxService,
    private parseStringDatePipe: ParseStringDatePipe,
    private parseLocalToUTCPipe: ParseLocalToUtcPipe,
    private teacherContractService: TeacherContractService,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private dateAdapter: DateAdapter<Date>,
    private utilService: UtilityService,
    private userService: AuthService,
    public permission: PermissionService,
    private filterBreadCrumbService: FilterBreadcrumbService,
  ) {}

  ngOnInit() {
    this.sortValue = null;
    this.dateAdapter.setLocale(this.translate.currentLang);
    this.notifRefFilter.setValue(this.translate.instant('All'), { emitEvent: false });
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.dateAdapter.setLocale(this.translate.currentLang);
      if (this.notifRefFilter.value === 'All' || this.notifRefFilter.value === 'Tous') {
        this.notifRefFilter.setValue(this.translate.instant('All'), { emitEvent: false });
      }
    });
    if (this.type === 'latest') {
      this.filteredValues.notification_history_date = 'last_7_days';
    } else if (this.type === 'archived') {
      this.filteredValues.notification_history_date = 'after_7_days';
    }
    this.getNotificationhistories();
    this.initFilter();
    this.getProgramsDropdownData();
    this.getNotifRefDropdownData();
    this.getUrgentMail();
    this.filterProgram();    
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getNotificationhistories();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  sortData(sort: Sort) {
    // dynamically set key property of sort object
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getNotificationhistories();
      }
    }
  }

  getToUserTooltip(users: any[]) {
    let tooltipText = '';
    if (users && users.length) {
      users.forEach((user, index) => {
        if (user) {
          tooltipText =
            tooltipText +
            `
          ${user.last_name ? user.last_name.toUpperCase() : ''}
          ${user.first_name}
          ${user.civility && user.civility !== 'neutral' ? this.translate.instant(user.civility) : ''}`;
          tooltipText = index < users.length - 1 ? tooltipText + ',' : tooltipText + '';
        }
      });
    }
    return tooltipText;
  }

  getNotificationhistories() {
    this.isWaitingForResponse = true;

    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };

    const filter = this.cleanFilterData();
    this.subs.sink = this.historyService.getNotificationHistories(pagination, this.sortValue, filter).subscribe(
      (HistoryList) => {
        this.isWaitingForResponse = false;
        this.historyList = HistoryList;
        this.dataSource.data = HistoryList;
        this.historyCount = HistoryList && HistoryList.length ? HistoryList[0].count_document : 0;
        this.noData = this.dataSource.connect().pipe(map((data) => !data || (data && data.length === 0)));
        // set isReset back to false after 400 milisecond so the subscription that has debounceTime not triggered
        setTimeout(() => (this.isReset = false), 400);
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isWaitingForResponse = false;
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

  cleanFilterData() {
    // this function is to convert object filteredValues to string for graphql filter
    // convert from object like this: {date: "", from_date: "", to_date: "", notif_ref: "", notif_sub: "", …}
    // to string like this: "from_user:admin, subject_name:testing"

    this.filteredValues.offset = moment().utcOffset();
    const filterData = _.cloneDeep(this.filteredValues);

    for (const [key, value] of Object.entries(filterData)) {
      if (!value) {
        delete filterData[key];
      }
    }

    return filterData;
    // let filterQuery = '';

    // Object.keys(filterData).forEach((key) => {
    //   // only add key that has value to the query. so it wont send filter with empty string
    //   if (filterData[key]) {
    //     if (key === 'notification_history_date') {
    //       filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
    //     } else if (key === 'program_ids') {
    //       filterQuery = filterQuery + ` ${key}:[${filterData[key]}]`;
    //     } else if (key === 'offset') {
    //       filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
    //     } else {
    //       filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
    //     }
    //   }
    //   console.log('filter => ', filterData[key]);
    // });
    // console.log('filterQuery => ', filterQuery);
    // return filterQuery;
  }

  initFilter() {
    this.subs.sink = this.dateFilter.valueChanges.pipe(debounceTime(700)).subscribe((date) => {
      if (date) {
        // this.filteredValues.notification_history_date = '';
        const dateString = moment(date).format('DD/MM/YYYY');
        this.filteredValues.sent_date = this.parseLocalToUTCPipe.transformDateTime(dateString, '00:00');
        this.filteredValues.offset = moment().utcOffset();
      }
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getNotificationhistories();
      }
    });
    this.subs.sink = this.timeFilter.valueChanges.pipe(debounceTime(700)).subscribe((date) => {
      // this.filteredValues.notification_history_date = '';
      const parse = this.parseLocalToUTCPipe.transform(date);
      this.filteredValues.sent_time = parse;
      this.filteredValues.offset = moment().utcOffset();
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getNotificationhistories();
      }
    });
    this.subs.sink = this.fromDateFilter.valueChanges.pipe(debounceTime(700)).subscribe((date) => {
      if (date) {
        // this.filteredValues.notification_history_date = '';
        const dateString = moment(date).format('DD/MM/YYYY');
        this.filteredValues.from_date = this.parseLocalToUTCPipe.transformDateTime(dateString, '00:00');
        this.filteredValues.offset = moment().utcOffset();
      }
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getNotificationhistories();
      }
    });
    this.subs.sink = this.toDateFilter.valueChanges.pipe(debounceTime(700)).subscribe((date) => {
      if (date) {
        // this.filteredValues.notification_history_date = '';
        const dateString = moment(date).format('DD/MM/YYYY');
        this.filteredValues.to_date = this.parseLocalToUTCPipe.transformDateTime(dateString, '00:00');
        this.filteredValues.offset = moment().utcOffset();
      }
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getNotificationhistories();
      }
    });
    this.subs.sink = this.notifSubjectFilter.valueChanges.pipe(debounceTime(700)).subscribe((notifSubj) => {
      this.filteredValues.notif_sub = notifSubj;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getNotificationhistories();
      }
    });
    this.subs.sink = this.fromFilter.valueChanges.pipe(debounceTime(700)).subscribe((from) => {
      this.filteredValues.from_user = from;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getNotificationhistories();
      }
    });
    this.subs.sink = this.toFilter.valueChanges.pipe(debounceTime(700)).subscribe((to) => {
      this.filteredValues.to_user = to;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getNotificationhistories();
      }
    });
  }

  filterProgram() {
    // this.filteredValues.program_id = programId && programId !== 'All' ? programId : null;
    // this.paginator.pageIndex = 0;
    // if (programId === 'All') {
    //   const result = this.programArray.filter((ttl) => ttl);
    //   this.filteredProgramArray = of(result);

    // }
    // if (!this.isReset) {
    //   this.getNotificationhistories();
    // }
    const isSame = JSON.stringify(this.tempDataFilter.program) === JSON.stringify(this.programFilter.value);
    if (isSame) {
      return;
    } else if (this.programFilter.value?.length) {
      this.filteredValues.program_ids = this.programFilter.value;
      this.tempDataFilter.program = this.programFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getNotificationhistories();
      }
    } else {
      if (this.tempDataFilter.program?.length && !this.programFilter.value?.length) {
        this.filteredValues.program_ids = this.programFilter.value;
        this.tempDataFilter.program = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getNotificationhistories();
        }
      } else {
        return;
      }
    }
  }

  filterNotifArray(resp: any) {
    this.filteredValues.notif_ref = resp !== 'All' ? resp: null;
    this.paginator.pageIndex = 0;
    if (!this.isReset) {
      this.getNotificationhistories();
    }
  }

  getProgramsDropdownData() {
    this.subs.sink = this.teacherContractService.GetAllProgramsDropdown().subscribe(
      (resp) => {
        this.programArray = resp;
        this.filteredProgramArray = of(this.programArray);
        this.programList = this.programArray;
        // ************* Start for auto complete
        this.subs.sink = this.programFilter.valueChanges.subscribe((statusSearch) => {
          if (typeof statusSearch === 'string') {
            const result = this.programArray.filter((ttl) =>
              this.utilService.simplifyRegex(ttl.program).includes(this.utilService.simplifyRegex(statusSearch)),
            );
            this.filteredProgramArray = of(result);
          }
        });
      },
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

  getNotifRefDropdownData() {
    this.subs.sink = this.historyService.GetNotificationReferences().subscribe(
      (resp) => {
        this.notifRefArray = resp;
        this.notifRefArray = this.notifRefArray.sort((notifRefA, notifRefB) => {
          if (this.utilService.simplifyRegex(notifRefA) < this.utilService.simplifyRegex(notifRefB)) {
            return -1;
          } else if (this.utilService.simplifyRegex(notifRefA) > this.utilService.simplifyRegex(notifRefB)) {
            return 1;
          } else {
            return 0;
          }
        });
        this.getFilterNotifRef();
      },
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

  getFilterNotifRef() {
    this.filteredRefArray = this.notifRefFilter.valueChanges.pipe(
      startWith(''),
      map((searchTxt: string) =>
        this.notifRefArray.filter((resNotifArray) => {
          if (searchTxt && !['All','Tous'].includes(searchTxt)) {
            return resNotifArray.toLowerCase().includes(searchTxt.toLowerCase());
          }
          return true;
        }),
      ),
    );
  }

  translateDate(dateRaw) {
    if (dateRaw && dateRaw.date_utc && dateRaw.time_utc) {
      const date = this.parseUTCToLocalPipe.transformDate(dateRaw.date_utc, dateRaw.time_utc);
      const datee = date !== 'Invalid date' ? moment(date, 'DD/MM/YYYY').format('DD/MM/YYYY') : '';
      return date !== '' ? moment(datee, 'DD/MM/YYYY').format('DD/MM/YYYY') : '';
    } else {
      return '';
    }
  }

  translateTime(timeRaw) {
    const time = this.parseUTCToLocalPipe.transform(timeRaw.time_utc)
      ? this.parseUTCToLocalPipe.transform(timeRaw.time_utc)
      : this.parseUTCToLocalPipe.transform('15:59');
    return time;
  }

  resetAllFilter() {
    this.resetFilterObject();
    this.isReset = true;
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sortValue = null;
    this.dateFilter.setValue('', { emitEvent: false });
    this.timeFilter.setValue('', { emitEvent: false });
    this.fromDateFilter.setValue('', { emitEvent: false });
    this.toDateFilter.setValue('', { emitEvent: false });
    this.notifRefFilter.setValue(this.translate.instant('All'), { emitEvent: false });
    this.notifSubjectFilter.setValue('', { emitEvent: false });
    this.programFilter.setValue(null, { emitEvent: false });
    this.fromFilter.setValue('', { emitEvent: false });
    this.toFilter.setValue('', { emitEvent: false });

    if (this.type === 'latest') {
      this.filteredValues.notification_history_date = 'last_7_days';
    } else if (this.type === 'archived') {
      this.filteredValues.notification_history_date = 'after_7_days';
    }
    this.filterBreadcrumbData = [];
    this.getNotificationhistories();
    this.getFilterNotifRef();

    this.filteredProgramArray = of(this.programArray);
  }

  todayDetails() {
    this.resetFilterObject();
    this.isReset = true;
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sortValue = null;
    this.dateFilter.setValue('', { emitEvent: false });
    this.timeFilter.setValue('', { emitEvent: false });
    this.fromDateFilter.setValue('', { emitEvent: false });
    this.toDateFilter.setValue('', { emitEvent: false });
    this.notifRefFilter.setValue(this.translate.instant('All'), { emitEvent: false });
    this.notifSubjectFilter.setValue('', { emitEvent: false });
    this.programFilter.setValue(null, { emitEvent: false });
    this.fromFilter.setValue('', { emitEvent: false });
    this.toFilter.setValue('', { emitEvent: false });
    const dateString = moment().format('DD/MM/YYYY');
    this.filteredValues.sent_date = this.parseLocalToUTCPipe.transformDateTime(dateString, '00:00');
    this.getNotificationhistories();
    this.getFilterNotifRef();
  }

  filterDateRange(dateRange) {
    this.resetFilterObject();
    this.isReset = true;
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sortValue = null;
    this.dateFilter.setValue('', { emitEvent: false });
    this.timeFilter.setValue('', { emitEvent: false });
    this.fromDateFilter.setValue('', { emitEvent: false });
    this.toDateFilter.setValue('', { emitEvent: false });
    this.notifRefFilter.setValue(this.translate.instant('All'), { emitEvent: false });
    this.notifSubjectFilter.setValue('', { emitEvent: false });
    this.programFilter.setValue(null, { emitEvent: false });
    this.fromFilter.setValue('', { emitEvent: false });
    this.toFilter.setValue('', { emitEvent: false });
    this.notificationHistoryDate.setValue('', { emitEvent: false });
    this.offsetFilter.setValue('');

    if (dateRange === 'today') {
      this.filteredValues.notification_history_date = 'today';
    } else if (dateRange === 'yesterday') {
      this.filteredValues.notification_history_date = 'yesterday';
    } else if (dateRange === 'last_7_days') {
      this.filteredValues.notification_history_date = 'last_7_days';
    } else if (dateRange === 'last_30_days') {
      this.filteredValues.notification_history_date = 'last_30_days';
    }

    // if (dateRange === 'yesterday') {
    //   const dateYesterday = moment().subtract(1, 'days').format('DD/MM/YYYY');
    //   this.filteredValues.sent_date = this.parseLocalToUTCPipe.transformDateTime(dateYesterday, '00:00');
    // } else if (dateRange === 'lastWeek') {
    //   const from = moment().subtract(7, 'days').format('DD/MM/YYYY');
    //   const to = moment().format('DD/MM/YYYY');
    //   this.filteredValues.from_date = this.parseLocalToUTCPipe.transformDateTime(from, '00:00');
    //   this.filteredValues.to_date = this.parseLocalToUTCPipe.transformDateTime(to, '00:00');
    // } else if (dateRange === 'lastMonth') {
    //   const from = moment().subtract(1, 'months').format('DD/MM/YYYY');
    //   const to = moment().format('DD/MM/YYYY');
    //   this.filteredValues.from_date = this.parseLocalToUTCPipe.transformDateTime(from, '00:00');
    //   this.filteredValues.to_date = this.parseLocalToUTCPipe.transformDateTime(to, '00:00');
    // }

    this.getNotificationhistories();
    this.getFilterNotifRef();
  }

  resetFilterObject() {
    this.filteredValues = {
      sent_date: '',
      sent_time: '',
      from_date: '',
      to_date: '',
      notif_ref: '',
      notif_sub: '',
      program_id: '',
      program_ids: null,
      from_user: '',
      to_user: '',
      subject_name: '',
      test_name: '',
      notification_history_date: '',
    };

    if ('offset' in this.filteredValues) {
      delete this.filteredValues['offset'];
    }
  }

  viewHistory(data) {
    this.dialog
      .open(ViewHistoryComponent, {
        disableClose: true,
        width: '768px',
        minHeight: '435px',
        panelClass: 'certification-rule-pop-up',
        data: {
          viewMessageData: data,
          allHistory: this.historyList,
        },
      })
      .afterClosed()
      .subscribe((result) => (this.dialogRefViewHistory = null));
  }

  sendForwardMessage(data) {
    // console.log('data forward msg ', data);
    // data.notificationMessage = data.notificationMessage.replace(new RegExp('<a ([^]+)>[^"]+a>', 'g'), '');
    // const convertToMailSchema = {
    //   sender_property: { sender: data && data.from ? data.from : null },
    //   is_urgent_mail: false,
    //   recipient_properties: [{ recipient: data.to }],
    //   attachments: [],
    //   subject: data.notificationSubject,
    //   created_at: '2020-09-09T07:55:00.057Z',
    //   message: data.notificationMessage
    // }
    // console.log('convertToMailSchema to mimic mail data ', convertToMailSchema);
    // this.sendMailDialogComponent = this.dialog.open(SendMailDialogComponent, this.config);
    // this.sendMailDialogComponent.componentInstance.tags = ['foward-mail'];
    // this.sendMailDialogComponent.componentInstance.subjectName = data.notificationSubject;
    // this.sendMailDialogComponent.componentInstance.currentMailData = convertToMailSchema;
    // this.subs.sink = this.sendMailDialogComponent.afterClosed().subscribe((result) => this.sendMailDialogComponent = null);
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
            });
        }
      },
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

  getTodayTime(time) {
    return this.parseLocalToUTCPipe.transform(time);
  }
  filterBreadcrumbFormat() {
    // date and time
    const changeDate = {
      from_date: null,
      to_date: null,
      sent_date: null,
    };
    if (this.fromDateFilter?.value && this.filteredValues?.from_date) {
      changeDate.from_date = moment(this.fromDateFilter.value).format('DD/MM/YYYY');
    }
    if (this.toDateFilter?.value && this.filteredValues?.to_date) {
      changeDate.to_date = moment(this.toDateFilter.value).format('DD/MM/YYYY');
    }
    if (this.dateFilter?.value && this.filteredValues?.sent_date) {
      changeDate.sent_date = moment(this.dateFilter.value).format('DD/MM/YYYY');
    }
    const filteredValuesBreadCrumb = {
      ...this.filteredValues,
      from_date: changeDate?.from_date ? changeDate.from_date : this.filteredValues?.from_date,
      to_date: changeDate?.to_date ? changeDate.to_date : this.filteredValues?.to_date,
      sent_date: changeDate?.sent_date ? changeDate.sent_date : this.filteredValues?.sent_date,
      sent_time: this.timeFilter?.value && this.filteredValues?.sent_time ? this.timeFilter?.value : this.filteredValues?.sent_time,
    };
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'from_date', // name of the key in the object storing the filter
        column: 'FROM_HISTORY', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: filteredValuesBreadCrumb, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.fromDateFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'super_filter',
        name: 'to_date',
        column: 'TO_HISTORY',
        isMultiple: false,
        filterValue: filteredValuesBreadCrumb,
        filterList: null,
        filterRef: this.toDateFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
      },
      // table filter
      {
        type: 'table_filter',
        name: 'sent_date',
        column: 'MailBox.DATE',
        isMultiple: false,
        filterValue: filteredValuesBreadCrumb,
        filterList: null,
        filterRef: this.dateFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
      },
      {
        type: 'table_filter',
        name: 'sent_time',
        column: 'Time',
        isMultiple: false,
        filterValue: filteredValuesBreadCrumb,
        filterList: null,
        filterRef: this.timeFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
      },
      {
        type: 'table_filter',
        name: 'notif_ref',
        column: 'Notif. Ref',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: this.notifRefArray,
        filterRef: this.notifRefFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'notif_sub',
        column: 'Notif. Subject',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.notifSubjectFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'program_ids',
        column: 'Program',
        isMultiple: this.programFilter?.value?.length === this.programList.length ? false : true,
        filterValue: this.programFilter?.value?.length === this.programList.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.programFilter?.value?.length === this.programList.length ? null : this.programList,
        filterRef: this.programFilter,
        isSelectionInput: this.programFilter?.value?.length === this.programList.length ? false : true, // is it a dropdown input or a normal input/date
        displayKey: this.programFilter?.value?.length === this.programList.length ? null : 'program',
        savedValue: this.programFilter?.value?.length === this.programList.length ? null : '_id',
      },
      {
        type: 'table_filter',
        name: 'from_user',
        column: 'FROM_HISTORY',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.fromFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
        noTranslate: true,
      },
      {
        type: 'table_filter',
        name: 'to_user',
        column: 'TO_HISTORY',
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: this.toFilter,
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null,
        savedValue: null,
        noTranslate: true,
      },
    ];
    // action filter
    if (this.type === 'latest' && this.filteredValues.notification_history_date !== 'last_7_days') {
      filterInfo.push({
        type: 'action_filter',
        name: 'notification_history_date',
        column: null,
        isMultiple: false,
        filterValue: this.filteredValues,
        filterList: null,
        filterRef: null,
        isSelectionInput: false,
        displayKey: null,
        savedValue: null,
      });
    }
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
    console.log('cek data', this.filterBreadcrumbData);
  }
  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    if (filterItem) {
      if (this.type === 'latest') {
        if (filterItem.type === 'action_filter') {
          this.filteredValues.notification_history_date = 'last_7_days';
        } else {
          this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, this.filteredValues, this.filteredValues, this.filteredValues);
        }
      } else if (this.type === 'archived') {
        this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, this.filteredValues, this.filteredValues);
      }
      this.getNotificationhistories();
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  isAllDropdownSelected(type) {
    if (type === 'program') {
      const selected = this.programFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.programList.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if (type === 'program') {
      const selected = this.programFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.programList.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
    if (type === 'program') {
      if (event.checked) {
        const programData = this.programList.map((el) => el._id);
        this.programFilter.patchValue(programData, { emitEvent: false });
      } else {
        this.programFilter.patchValue(null, { emitEvent: false });
      }
    }
  }
}
