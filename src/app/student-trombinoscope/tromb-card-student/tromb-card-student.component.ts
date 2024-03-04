import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { InternshipEmailDialogComponent } from 'app/internship-file/internship-email-dialog/internship-email-dialog.component';
import { SendMailDialogComponent } from 'app/mailbox/send-mail-dialog/send-mail-dialog.component';
import { ApplicationUrls } from 'app/shared/settings';
import { SubSink } from 'subsink';

@Component({
  selector: 'ms-tromb-card-student',
  templateUrl: './tromb-card-student.component.html',
  styleUrls: ['./tromb-card-student.component.scss'],
})
export class TrombCardStudentComponent implements OnInit {
  isHover = false;

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  maleCandidateIcon = '../../../../../assets/img/student_icon.png';
  femaleCandidateIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  userProfilePic = '../../../../../assets/img/user-1.jpg';
  userProfilePic1 = '../../../../../assets/img/user-3.jpg';
  userProfilePic2 = '../../../../../assets/img/user-5.jpg';
  greenHeartIcon = '../../../../../assets/img/enagement_icon_green.png';
  selectedIndex = 0;
  @Input() student;
  private subs = new SubSink();

  dialogConfig: MatDialogConfig = {
    disableClose: true,
    minWidth: '750px',
    autoFocus: false,
  };

  constructor(private dialog: MatDialog, private router: Router) {}

  ngOnInit() {
    console.log('Student', this.student);
  }

  openSendSingleEmailDialog(student: any) {
    if (student) {
      const mappedData = {
        candidate_id: {
          candidate_admission_status: student?.candidate_id?.candidate_admission_status,
          civility: student?.candidate_id?.civility,
          email: student?.candidate_id?.email,
          emailDefault: student?.candidate_id?.school_mail,
          first_name: student?.candidate_id?.first_name,
          last_name: student?.candidate_id?.last_name,
        },
        financial_supports: student?.candidate_id?.payment_supports,
      };
      this.subs.sink = this.dialog
        .open(InternshipEmailDialogComponent, {
          width: '600px',
          minHeight: '100px',
          disableClose: true,
          data: mappedData,
        })
        .afterClosed()
        .subscribe((resp) => {});
    }
  }

  openStudentCard(id) {
    const query = {
      selectedCandidate: id,
    };
    const url = this.router.createUrlTree(['candidate-file'], { queryParams: query });
    window.open(url.toString(), '_blank');
  }
}
