import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTabGroup } from '@angular/material/tabs';
import { TranslateService } from '@ngx-translate/core';
import { UsersService } from 'app/service/users/users.service';
import { ApplicationUrls } from 'app/shared/settings';
import { UserEmailDialogComponent } from 'app/users/user-email-dialog/user-email-dialog.component';
import * as moment from 'moment';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { AuthService } from 'app/service/auth-service/auth.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'ms-alumni-card-details',
  templateUrl: './alumni-card-details.component.html',
  styleUrls: ['./alumni-card-details.component.scss'],
})
export class AlumniCardDetailsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  @Input() candidateId = {};
  @Input() candidateList = [];
  @Input() tab;
  @Output() reload: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('candidateMatGroup', { static: false }) candidateMatGroup: MatTabGroup;
  candidate: any = {};
  isWaitingForResponse: Boolean = true;
  private subs = new SubSink();
  tabs = {
    'note-tab': 'Add a Note',
    'history-tab': 'Candidate history',
    'information-tab': 'INFORMATION',
  };

  maleCandidateIcon = '../../../../../assets/img/student_icon.png';
  femaleCandidateIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  userProfilePic = '../../../../../assets/img/user-1.jpg';
  userProfilePic1 = '../../../../../assets/img/user-3.jpg';
  userProfilePic2 = '../../../../../assets/img/user-5.jpg';
  greenHeartIcon = '../../../../../assets/img/enagement_icon_green.png';
  selectedIndex = 0;
  userData = [];
  datePipe: DatePipe;
  constructor(
    private dialog: MatDialog,
    private translate: TranslateService,
    private userService: UsersService,
    private authService: AuthService,
  ) {}
  ngOnInit() {
    this.datePipe = new DatePipe(this.translate.currentLang);
    this.subs.sink = this.translate.onLangChange.subscribe(() => {
      this.datePipe = new DatePipe(this.translate.currentLang);
    });
    this.moveToTab(this.tab);
    if (this.candidateList && this.candidateList.length) {
      const datas = this.candidateList.filter((lists) => lists._id === this.candidateId);
      if (datas && datas.length) {
        this.candidate = datas[0];
      } else {
        this.isWaitingForResponse = false;
      }
      this.isWaitingForResponse = false;
    } else {
      this.isWaitingForResponse = false;
    }
  }

  ngAfterViewInit() {
    this.moveToTab(this.tab);
  }

  translateDate(date) {
    const check = moment(date).format('DD/MM/YYYY');
    return check;
  }

  translateLocaleDate(dateRaw) {
    if (dateRaw) {
      const datee = moment(dateRaw).format('MM/DD/YYYY');
      return this.datePipe.transform(datee, 'MMM dd, y');
    } else {
      return '';
    }
  }

  formatUpdateBy(data) {
    let display = _.cloneDeep(data);
    if (display) {
      if (display.includes('MRS')) {
        display = display.replace('MRS', this.translate.instant('MRS'));
      } else {
        display = display.replace('MR', this.translate.instant('MR'));
      }
      display = display.replace('neutral', '');
    }
    return display;
  }

  ngOnChanges() {
    if (this.candidateList && this.candidateList.length) {
      this.isWaitingForResponse = true;
      const datas = this.candidateList.filter((lists) => lists._id === this.candidateId);
      if (datas && datas.length) {
        this.candidate = datas[0];
      } else {
        this.isWaitingForResponse = false;
      }
      this.isWaitingForResponse = false;
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getAllUsers() {
    this.userData = [];
    this.subs.sink = this.userService.getAllUserNote().subscribe(
      (respAdmtc) => {
        this.userData = respAdmtc;
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.userData = [];
        this.isWaitingForResponse = false;
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.authService.handlerSessionExpired();
          return;
        } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('BAD_CONNECTION.Title'),
            html: this.translate.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        }
      },
    );
  }

  moveToTab(tab) {
    if (tab) {
      switch (tab) {
        case 'note-tab':
          this.selectedIndex = 1;
          break;
        case 'information-tab':
          this.selectedIndex = 2;
          break;
        default:
          this.selectedIndex = 0;
      }
    }
  }

  internshipMailDialog(datas) {
    datas.civility = datas.civility ? datas.civility : '';
    datas.first_name = datas.first_name;
    datas.last_name = datas.last_name;
    this.subs.sink = this.dialog
      .open(UserEmailDialogComponent, {
        width: '750px',
        minHeight: '100px',
        disableClose: true,
        data: datas,
      })
      .afterClosed()
      .subscribe((resp) => {});
  }



  sendSurvey(datas) {
    Swal.fire({
      type: 'info',
      title: this.translate.instant('ALUMNI_S1.TITLE'),
      html: this.translate.instant('ALUMNI_S1.TEXT'),
      showCancelButton: true,
      allowEscapeKey: true,
      allowOutsideClick: false,
      confirmButtonText: this.translate.instant('ALUMNI_S1.BUTTON_1'),
      cancelButtonText: this.translate.instant('ALUMNI_S1.BUTTON_2'),
    }).then((res) => {
      if (res.value) {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('ALUMNI_S2.TITLE'),
          html: this.translate.instant('ALUMNI_S2.TEXT'),
          allowOutsideClick: false,
          confirmButtonText: this.translate.instant('ALUMNI_S2.BUTTON'),
        }).then((resss) => {});
      }
    });
  }

  reloadData(value) {
    if (value) {
      this.reload.emit(true);
    }
  }
}
