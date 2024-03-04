import { cloneDeep } from 'lodash';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { SubSink } from 'subsink';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'ms-user-details-teacher-details-parent',
  templateUrl: './user-details-teacher-details-parent.component.html',
  styleUrls: ['./user-details-teacher-details-parent.component.scss'],
})
export class UserDetailsTeacherDetailsParentComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  @Input() userId;
  isLoading = false;
  scholarSeasons = [];
  selectedIndex = 0;

  constructor(private candidateService: CandidatesService, private translate: TranslateService, private authService: AuthService) {}

  ngOnInit(): void {
    this.getScholarSeasons();
  }
  getScholarSeasons() {
    const filter = {
      is_published: true,
    };
    this.isLoading = true;
    this.subs.sink = this.candidateService.getAllScholarSeasons(filter).subscribe(
      (resp) => {
        this.isLoading = false;
        if (resp?.length) {
          this.scholarSeasons = cloneDeep(resp);
        } else {
          this.scholarSeasons = [];
        }
      },
      (err) => {
        this.isLoading = false;
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: 'Error!',
          text: err && err.message ? this.translate.instant(err.message.replaceAll('GraphQL error: ')) : err,
          allowOutsideClick: false,
        });
      },
    );
  }
  selectedTab(value) {
    if (value && this.scholarSeasons?.length) {
      const selectedScholarSeason = this.scholarSeasons.findIndex((scholar) => scholar?.scholar_season === value);
      this.selectedIndex = selectedScholarSeason >= 0 ? selectedScholarSeason : 0;
    }
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
