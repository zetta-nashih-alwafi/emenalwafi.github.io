import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'ms-success-page',
  templateUrl: './success-page.component.html',
  styleUrls: ['./success-page.component.scss']
})
export class SuccessPageComponent implements OnInit {
  candidateId;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.candidateId = this.route.snapshot.queryParamMap.get('candidate');
  }

  goToForm() {
    const query = { candidate: this.candidateId };
    const url = this.router.createUrlTree(['/session/register'], { queryParams: query });
    window.open(url.toString(), '_self');
  }

}
