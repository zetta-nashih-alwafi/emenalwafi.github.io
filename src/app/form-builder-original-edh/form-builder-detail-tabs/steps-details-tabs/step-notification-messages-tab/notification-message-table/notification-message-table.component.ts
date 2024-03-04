import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilderService } from 'app/form-builder-original-edh/form-builder.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-notification-message-table',
  templateUrl: './notification-message-table.component.html',
  styleUrls: ['./notification-message-table.component.scss'],
})
export class NotificationMessageTableComponent implements OnInit, OnDestroy, AfterViewInit {
  private subs = new SubSink();
  @Input() templateId: any;
  @Input() templateType: any;
  @Input() stepId: any;
  @Output() showDetailsNotifOrMessage: EventEmitter<any> = new EventEmitter();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = ['ref', 'action'];
  filterColumns: String[] = ['refFilter', 'actionFilter'];
  isLoading = false;

  dummyData = [
    {
      _id: '38392920',
      ref: 'Notification N1',
      type: 'Notif',
    },
    {
      _id: '3839292032211',
      ref: 'Notification N2',
      type: 'Message',
    },
  ];
  intVal: NodeJS.Timeout;
  timeOutVal: NodeJS.Timeout;
  dataCount;
  noData;

  constructor(private translate: TranslateService, private formBuilderService: FormBuilderService, private userService: AuthService) {}

  ngOnInit() {
    // this.isLoading = true;
    // this.dataSource.data = this.dummyData;
    // this.dataCount = this.dataSource.data.length;
    // this.dataSource.paginator = this.paginator;
    // this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
    // setTimeout(() => {
    //   this.isLoading = false;
    // }, 1000);
    this.getStepNotificationAndMessages();
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          this.getStepNotificationAndMessages();
        }),
      )
      .subscribe();
  }

  getStepNotificationAndMessagesForAlumni() {
    this.isLoading = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };

    this.subs.sink = this.formBuilderService
      .GetAllStepNotificationsAndMessagesForAlumni(this.templateId, this.stepId, pagination)
      .subscribe(
        (resp) => {
          if (resp && resp.length) {
            const stepNotif = resp;
            this.dataSource.data = stepNotif;
            this.paginator.length = resp.length;
            this.dataCount = resp.length;
          } else {
            this.dataSource.data = [];
            this.paginator.length = 0;
            this.dataCount = 0;
          }
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          this.isLoading = false;
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
          console.log(err);
          this.isLoading = false;
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
  }

  getStepNotificationAndMessagesFoContract() {
    this.isLoading = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };

    this.subs.sink = this.formBuilderService
      .GetAllStepNotificationsAndMessagesForContract(this.templateId, this.stepId, pagination)
      .subscribe(
        (resp) => {
          if (resp && resp.length) {
            const stepNotif = resp;
            this.dataSource.data = stepNotif;
            this.paginator.length = resp.length;
            this.dataCount = resp.length;
          } else {
            this.dataSource.data = [];
            this.paginator.length = 0;
            this.dataCount = 0;
          }
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          this.isLoading = false;
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
          console.log(err);
          this.isLoading = false;
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
  }

  getStepNotificationAndMessages() {
    if (this.templateType === 'alumni') {
      this.getStepNotificationAndMessagesForAlumni();
    } else if (this.templateType === 'teacher_contract' || this.templateType === 'fc_contract') {
      this.getStepNotificationAndMessagesFoContract();
    } else if (this.templateType === 'student_admission' || this.templateType === 'admission_document') {
      this.isLoading = true;
      const pagination = {
        limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
        page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
      };

      this.subs.sink = this.formBuilderService.GetAllStepNotificationsAndMessages(this.templateId, this.stepId, pagination).subscribe(
        (resp) => {
          if (resp && resp.length) {
            const stepNotif = resp;
            this.dataSource.data = stepNotif;
            this.paginator.length = resp.length;
            this.dataCount = resp.length;
          } else {
            this.dataSource.data = [];
            this.paginator.length = 0;
            this.dataCount = 0;
          }
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          this.isLoading = false;
        },
        (err) => {
          console.log(err);
          this.isLoading = false;
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
  }

  reloadTable() {
    this.getStepNotificationAndMessages();
  }

  refSelected(dataa) {
    console.log('_dataa', dataa);

    if (dataa && dataa.type === 'notification') {
      const emittedValue = {
        notification: false,
        message: false,
        data: dataa,
      };
      console.log('refSelected', emittedValue);
      emittedValue.notification = true;
      emittedValue.message = false;
      this.showDetailsNotifOrMessage.emit(emittedValue);
    } else if (dataa) {
      const emittedMessageValue = {
        notification: false,
        message: false,
        data: dataa,
      };
      emittedMessageValue.notification = false;
      emittedMessageValue.message = true;
      this.showDetailsNotifOrMessage.emit(emittedMessageValue);
    }
  }

  deleteRef(element?) {
    let timeDisabled = 3;
    Swal.fire({
      allowOutsideClick: false,
      type: 'question',
      title: this.translate.instant('NOTIF_MSG.title'),
      html: this.translate.instant('NOTIF_MSG.text'),
      showCancelButton: true,
      confirmButtonText: this.translate.instant('SWEET_ALERT.DELETE.CONFIRM'),
      cancelButtonText: this.translate.instant('SWEET_ALERT.DELETE.CANCEL'),
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
        // clearTimeout(this.timeOutVal);
      },
    }).then((isConfirm) => {
      if (isConfirm.value) {
        // call api
        clearTimeout(this.timeOutVal);
        this.isLoading = true;
        this.subs.sink = this.formBuilderService.deleteStepNotificationAndMessage(element._id).subscribe(
          (resp) => {
            this.isLoading = false;
            if (resp) {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                confirmButtonText: this.translate.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.reloadTable();
                const emittedValue = {
                  notification: false,
                  message: false,
                };
                emittedValue.notification = false;
                emittedValue.message = false;
                this.showDetailsNotifOrMessage.emit(emittedValue);
              });
            }
          },
          (err) => {
            this.isLoading = false;
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
            console.log(err);
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );

        // this old to delete dummy data =================
        // this.isLoading = true;
        // Swal.fire({
        //   type: 'success',
        //   title: this.translate.instant('Bravo!'),
        //   confirmButtonText: this.translate.instant('OK'),
        //   allowEnterKey: false,
        //   allowEscapeKey: false,
        //   allowOutsideClick: false,
        // }).then(() => {
        //   this.dummyData = this.dummyData.filter((res) => res._id !== element._id);
        //   this.dataSource.data = this.dummyData;
        //   this.dataCount = this.dummyData.length;
        //   setTimeout(() => {
        //     this.isLoading = false;
        //   }, 1000);
        // });
        // this old to delete dummy data END ==================
      } else {
        clearTimeout(this.timeOutVal);
        return;
      }
    });
  }

  ngOnDestroy() {
    //
    this.subs.unsubscribe();
  }
}
