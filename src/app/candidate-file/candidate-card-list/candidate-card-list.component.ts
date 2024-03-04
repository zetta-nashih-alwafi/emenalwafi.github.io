import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoreService } from 'app/service/core/core.service';
import { ApplicationUrls } from 'app/shared/settings';

@Component({
  selector: 'ms-candidate-card-list',
  templateUrl: './candidate-card-list.component.html',
  styleUrls: ['./candidate-card-list.component.scss'],
})
export class CandidateCardListComponent implements OnInit {
  @Input() candidatesList;
  @Input() selectedCandidateId;
  @Input() isWaitingForResponse;
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
  constructor(private coreService: CoreService) {}
  ngOnInit() {
    this.coreService.sidenavOpen = false;
  }
  selectCandidate = (candidateData) => {
    if (this.selectedCandidateId !== candidateData?._id) {
      this.selectedCandidateId = candidateData?._id;
      this.selectedCandidateChange.emit(candidateData);
    }
  };
  // *************** To Get Height window screen and put in style css height
  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 251;
    return this.myInnerHeight-32;
  }

  // *************** To Get Height window screen and put in style css height
  getCardHeight() {
    this.myInnerHeight = window.innerHeight - 263;
    return this.myInnerHeight-32;
  }
}
