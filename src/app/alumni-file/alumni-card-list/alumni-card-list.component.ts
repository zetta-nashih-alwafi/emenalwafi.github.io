import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApplicationUrls } from 'app/shared/settings';

@Component({
  selector: 'ms-alumni-card-list',
  templateUrl: './alumni-card-list.component.html',
  styleUrls: ['./alumni-card-list.component.scss'],
})
export class AlumniCardListComponent implements OnInit {
  @Input() candidatesList;
  @Input() selectedCandidateId;
  @Output() selectedCandidateChange = new EventEmitter<string>();
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
  constructor() {}
  ngOnInit() {
    console.log(this.candidatesList);
    console.log(this.selectedCandidateId);
  }
  selectCandidate = (candidateId) => {
    if (this.selectedCandidateId !== candidateId) {
      this.selectedCandidateId = candidateId;
      console.log('_candi', this.selectedCandidateId);

      this.selectedCandidateChange.emit(this.selectedCandidateId);
    }
  };
  // *************** To Get Height window screen and put in style css height
  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 231;
    return this.myInnerHeight;
  }

  // *************** To Get Height window screen and put in style css height
  getCardHeight() {
    this.myInnerHeight = window.innerHeight - 263;
    return this.myInnerHeight;
  }
}
