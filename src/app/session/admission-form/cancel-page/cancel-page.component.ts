import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'ms-cancel-page',
  templateUrl: './cancel-page.component.html',
  styleUrls: ['./cancel-page.component.scss']
})
export class CancelPageComponent implements OnInit {
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
