import { SubSink } from 'subsink';
import { FinancesService } from 'app/service/finance/finance.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-registration-profile-parent',
  templateUrl: './registration-profile-parent.component.html',
  styleUrls: ['./registration-profile-parent.component.scss'],
})
export class RegistrationProfileParentComponent implements OnInit, OnDestroy {
  private subs: SubSink = new SubSink();
  public scholarSeasons: Array<{ _id: string; scholar_season: string; is_published: boolean }> = [];

  constructor(private translate: TranslateService, private financeService: FinancesService, private authService: AuthService) {}

  ngOnInit(): void {
    this.getScholarSeasons();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getScholarSeasons(): void {
    // Docs on Playground. Search: ScholarSeasonFilterInput.
    const filter = { is_published: true };
    this.subs.sink = this.financeService.getAllScholarSeasonsNameAndID(filter).subscribe(
      (res) => {
        if (res && res.length > 0) {
          this.scholarSeasons.push(...res);
        }
      },
      (err) => {
        // Record error log
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
}
