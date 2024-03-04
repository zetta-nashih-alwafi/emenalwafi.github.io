import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { StudentsService } from 'app/service/students/students.service';
import { SchoolService } from 'app/service/schools/school.service';
import { SubSink } from 'subsink';
import { NgxPermissionsService } from 'ngx-permissions';
import { CertificationRuleService } from 'app/service/certification-rule/certification-rule.service';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { MailboxService } from 'app/service/mailbox/mailbox.service';
import { ReplyUrgentMessageDialogComponent } from 'app/mailbox/reply-urgent-message-dialog/reply-urgent-message-dialog.component';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-my-file-detail',
  templateUrl: './my-file-detail.component.html',
  styleUrls: ['./my-file-detail.component.scss'],
})
export class MyFileDetailComponent implements OnInit, OnDestroy {
  // private cardDetail: CardDetailComponent;
  userData;
  studentId = '';
  schoolId = '';
  titleId = '';
  classId = '';
  hasAcceptedCertRule: Boolean = false;
  private subs = new SubSink();
  replyUrgentMessageDialogComponent: MatDialogRef<ReplyUrgentMessageDialogComponent>;
  selectedRncpTitleLongName: any;
  selectedRncpTitleName: any;
  configCertificatioRule: MatDialogConfig = {
    disableClose: true,
    // maxHeight: '900px',
    maxWidth: '820px'
  };
  studentTabSelected: any;
  jobFullScreen = false;
  studentPrevCourseData = null;
  constructor(
    private route: ActivatedRoute,
    private utilService: UtilityService,
    private studentService: StudentsService,
    private schoolService: SchoolService,
    private mailboxService: MailboxService,
    private userService: AuthService,
    public dialog: MatDialog,
    private permissions: NgxPermissionsService,
    private certificationRuleService: CertificationRuleService,
    private rncpTitlesService: RNCPTitlesService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    const identity = this.route.snapshot.queryParamMap.get('identity');
    const studentId = this.route.snapshot.queryParamMap.get('student');
    const titleId = this.route.snapshot.queryParamMap.get('title');
    const classId = this.route.snapshot.queryParamMap.get('class');
    const schoolId = this.route.snapshot.queryParamMap.get('school');
    const type = this.route.snapshot.queryParamMap.get('type');
    if (type === 'jobfullscreen') {
      this.jobFullScreen = true;
      this.titleId = titleId;
      this.classId = classId;
      this.studentId = studentId;
      this.schoolId = schoolId;
    }
    this.studentTabSelected = identity;
    this.userData = this.utilService.getCurrentUser();

    this.subs.sink = this.studentService.getStudentId(this.userData._id).subscribe((resp) => {
      console.log(resp);
      if (resp && resp.student_id && resp.student_id._id) {
        if (resp.student_id._id) {
          this.studentId = resp.student_id._id;
        }
        if (resp.student_id.rncp_title && resp.student_id.rncp_title._id) {
          this.titleId = resp.student_id.rncp_title._id;
          this.schoolService.setSelectedRncpTitleId(this.titleId);
        }
        if (resp.student_id.current_class && resp.student_id.current_class._id) {
          this.classId = resp.student_id.current_class._id;
          this.schoolService.setSelectedClassId(this.classId);
        }

        if (!!this.permissions.getPermission('Student')) {
          this.getCertificationRule();
        } else {
          this.getUrgentMail();
        }
      }
      if (this.userData && this.userData.entities && this.userData.entities.length) {
        if (this.userData.entities[0] && this.userData.entities[0].type && this.userData.entities[0].type.name === 'Student') {
          this.schoolId = this.userData.entities[0].school._id;
        }
      }
    }, (err) => {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
  }

  getUrgentMail() {
    this.subs.sink = this.mailboxService.getUrgentMail().subscribe((mailList: any[]) => {
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
            this.subs.sink = this.mailboxService.getUrgentMail().subscribe((mailUrgent: any[]) => {
              if (mailUrgent && mailUrgent.length) {
                this.replyUrgentMessageDialogComponent = this.dialog.open(ReplyUrgentMessageDialogComponent, {
                  disableClose: true,
                  width: '825px',
                  panelClass: 'certification-rule-pop-up',
                  data: mailUrgent,
                });
              }
            }, (err) => {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            });
          });
      }
    }, (err) => {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
  }
  getCertificationRule() {
    const studentData = this.userService.getLocalStorageUser();
    console.log('ini data student', studentData);
    // const titleId = studentData.entities[0].assigned_rncp_title._id;
    // const classId = studentData.entities[0].class._id;
    const studentId = studentData._id;
    this.subs.sink = this.rncpTitlesService.getRncpTitleById(this.titleId).subscribe((resp) => {
      this.selectedRncpTitleName = resp.short_name;
      this.selectedRncpTitleLongName = resp.long_name;
    }, (err) => {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });

    this.subs.sink = this.certificationRuleService
      .getCertificationRuleSentWithStudent(this.titleId, this.classId, studentId)
      .subscribe((dataRule: any) => {
        if (dataRule) {
          this.showCertificationRule(this.titleId, this.classId, 'global');
        } else {
          // this.showCertificationRule(titleId, classId, 'showSecondTimeCertificationRule');
          this.getUrgentMail();
        }
      }, (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      });
  }

  showCertificationRule(selectedRncpTitleId, selectedClassId, callfrom) {
    // this.dialog
    //   .open(CertificationRulePopUpComponent, {
    //     panelClass: 'reply-message-pop-up',
    //     ...this.configCertificatioRule,
    //     data: {
    //       callFrom: callfrom,
    //       titleId: selectedRncpTitleId,
    //       classId: selectedClassId,
    //       titleName: this.selectedRncpTitleName,
    //       titleLongName: this.selectedRncpTitleLongName,
    //     },
    //   })
    //   .afterClosed()
    //   .subscribe((result) => {
    //     this.getUrgentMail();
    //     this.hasAcceptedCertRule = true;
    //     this.cardDetail.getCertificationRuleSent();
    //   });
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
    this.schoolService.resetSelectedTitleAndClass();
  }
}
