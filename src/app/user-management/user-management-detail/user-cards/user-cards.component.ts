import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoreService } from 'app/service/core/core.service';
import { ApplicationUrls } from 'app/shared/settings';

@Component({
  selector: 'ms-user-cards',
  templateUrl: './user-cards.component.html',
  styleUrls: ['./user-cards.component.scss']
})
export class UserCardsComponent implements OnInit {
  @Input() userList;
  @Input() isTeacherList;
  @Input() selectedUserId;
  @Output() selectedUserChange = new EventEmitter<string>();
  maleCandidateIcon = '../../../../../assets/img/student_icon.png';
  femaleCandidateIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  userProfilePic = '../../../../../assets/img/user-1.jpg';
  userProfilePic1 = '../../../../../assets/img/user-3.jpg';
  userProfilePic2 = '../../../../../assets/img/user-5.jpg';
  greenHandShakeIcon = '../../../../../assets/img/hand-shake-green.png';
  redHandShakeIcon = '../../../../../assets/img/hand-shake-red.png';
  blackHandShakeIcon = '../../../../../assets/img/hand-shake-black.png';
  orangeHandShakeIcon = '../../../../../assets/img/hand-shake-orange.png';
  greyHandShakeIcon = '../../../../../assets/img/hand-shake-grey.png';

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  myInnerHeight = 1920;
  isWaitingForResponse = false;
  constructor(private coreService: CoreService) {}
  ngOnInit() {
    this.coreService.sidenavOpen = false;
  }
  selectUser = (userId) => {
    if (this.selectedUserId !== userId) {
      this.selectedUserId = userId;
      this.selectedUserChange.emit(this.selectedUserId);
    }
  };
  // *************** To Get Height window screen and put in style css height
  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 251;
    return this.myInnerHeight-32
  }

  // *************** To Get Height window screen and put in style css height
  getCardHeight() {
    this.myInnerHeight = window.innerHeight - 263;
    return this.myInnerHeight-32
  }

}
