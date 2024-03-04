import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ApplicationUrls } from 'app/shared/settings';

@Component({
  selector: 'ms-job-offer-card-list',
  templateUrl: './job-offer-card-list.component.html',
  styleUrls: ['./job-offer-card-list.component.scss']
})
export class JobOfferCardListComponent implements OnInit {

  @Output() selectedJobChange = new EventEmitter<string>();
  @Input() jobOfferList: any[];
  @Input() selectedJobId: string;

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  myInnerHeight = 1920;

  constructor() { }

  ngOnInit() {
  }

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

  selectJob(candidateId: string) {
    if (this.selectedJobId !== candidateId) {
      this.selectedJobId = candidateId;
      this.selectedJobChange.emit(this.selectedJobId);
    }
  }

}
