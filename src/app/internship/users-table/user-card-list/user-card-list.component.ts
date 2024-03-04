import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MailCanidateDialogComponent } from 'app/candidates/mail-candidates-dialog/mail-candidates-dialog.component';
import { SendMailDialogComponent } from 'app/mailbox/send-mail-dialog/send-mail-dialog.component';
import { ApplicationUrls } from 'app/shared/settings';

@Component({
  selector: 'ms-user-card-list',
  templateUrl: './user-card-list.component.html',
  styleUrls: ['./user-card-list.component.scss'],
})
export class UserCardListComponent implements OnInit, OnChanges {
  @Input() userList;
  @Input() selectedUserId;
  @Input() isWaitingForResponse;
  @Output() selectedUserChange = new EventEmitter<string>();

  maleCandidateIcon = '../../../../../assets/img/student_icon.png';
  femaleCandidateIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');

  constructor(private dialog: MatDialog) {}

  ngOnInit() {}

  ngOnChanges() {
    console.log(this.userList, this.selectedUserId);
  }

  selectCandidate(id) {
    if (this.selectedUserId !== id) {
      this.selectedUserId = id;
      console.log('_candi', this.selectedUserId);

      this.selectedUserChange.emit(this.selectedUserId);
    }
  }

  sendMail() {
    const dialog = this.dialog.open(SendMailDialogComponent, {
      disableClose: true,
      width: '750px',
    });
  }
}
