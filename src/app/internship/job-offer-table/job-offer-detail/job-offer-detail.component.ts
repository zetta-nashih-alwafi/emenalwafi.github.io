import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JobOfferService } from 'app/service/internship/job-offer.service';

@Component({
  selector: 'ms-job-offer-detail',
  templateUrl: './job-offer-detail.component.html',
  styleUrls: ['./job-offer-detail.component.scss']
})
export class JobOfferDetailComponent implements OnInit {

  jobOfferList = []
  myInnerHeight = 1920;
  selectedJobId: string;

  constructor(
    private route: ActivatedRoute,
    private jobOfferService: JobOfferService
  ) { }

  ngOnInit() {
    this.selectedJobId = this.route.snapshot.paramMap.get('jobId');
    this.jobOfferService.getJobOfferList().subscribe(resp => {
      this.jobOfferList = resp;
    })
  }

  updatedSelectedJob(newSelection) {
    this.selectedJobId = newSelection;
  }

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
