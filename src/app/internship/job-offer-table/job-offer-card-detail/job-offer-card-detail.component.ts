import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { JobOfferService } from 'app/service/internship/job-offer.service';
import { ApplicationUrls } from 'app/shared/settings';

@Component({
  selector: 'ms-job-offer-card-detail',
  templateUrl: './job-offer-card-detail.component.html',
  styleUrls: ['./job-offer-card-detail.component.scss']
})
export class JobOfferCardDetailComponent implements OnInit, OnChanges {

  @Input() selectedJobId: string;

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  jobOfferList = []
  jobData: any;

  constructor(
    private jobOfferService: JobOfferService
  ) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.jobOfferService.getJobOfferList().subscribe(resp => {
      this.jobOfferList = resp;
      this.jobData = this.jobOfferList.find(job => job._id === this.selectedJobId);
    })
  }

}
