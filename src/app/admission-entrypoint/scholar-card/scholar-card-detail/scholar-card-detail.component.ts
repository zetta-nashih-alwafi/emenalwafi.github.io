import { Component, OnInit, Input, OnDestroy, OnChanges } from '@angular/core';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../service/auth-service/auth.service';
import { UserProfileData } from '../../../users/user.model';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { ReplyUrgentMessageDialogComponent } from 'app/mailbox/reply-urgent-message-dialog/reply-urgent-message-dialog.component';
import { MailboxService } from 'app/service/mailbox/mailbox.service';
import { SubSink } from 'subsink';
import { ApplicationUrls } from 'app/shared/settings';
import { DomSanitizer } from '@angular/platform-browser';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';

@Component({
  selector: 'ms-scholar-card-detail',
  templateUrl: './scholar-card-detail.component.html',
  styleUrls: ['./scholar-card-detail.component.scss'],
  providers: [ParseUtcToLocalPipe],
})
export class ScholarCardDetailComponent implements OnInit, OnDestroy, OnChanges {
  @Input() scholarSeason: any[] = [];

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  schoolId;
  myInnerHeight = 600;
  replyUrgentMessageDialogComponent: MatDialogRef<ReplyUrgentMessageDialogComponent>;
  private subs = new SubSink();

  constructor(
    private rncpTitleService: RNCPTitlesService,
    private router: Router,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private mailboxService: MailboxService,
    private sanitizer: DomSanitizer,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
  ) {}

  ngOnInit() {
    // if (this.route.snapshot.queryParamMap.get('schoolId')) {
    //   this.schoolId = this.route.snapshot.queryParamMap.get('schoolId');
    // }
    this.rncpTitleService.setTitleIntake('')
    if (this.scholarSeason) {
      this.scholarSeason = this.scholarSeason.map((res) => {
        res['local_start'] = this.parseUTCToLocalPipe.transformDate(res.from.date_utc, res.from.time_utc);
        res['local_end'] = this.parseUTCToLocalPipe.transformDate(res.to.date_utc, res.to.time_utc);
        return res;
      });
      console.log('_sea', this.scholarSeason);
    }
  }

  ngOnChanges() {
    console.log('this.scholarSeason', this.scholarSeason);
    if (this.scholarSeason) {
      this.scholarSeason = this.scholarSeason.map((res) => {
        res['local_start'] = this.parseUTCToLocalPipe.transformDate(res.from.date_utc, res.from.time_utc);
        res['local_end'] = this.parseUTCToLocalPipe.transformDate(res.to.date_utc, res.to.time_utc);
        return res;
      });
    }
  }

  goToScholarSeason(data) {
    // const url = this.router.createUrlTree([`scholar-card/admission-entrypoint`], { queryParams: { scholarSeasonId: data._id } });
    // window.open(url.toString(), '_blank');
    this.router.navigate(['/scholar-card/admission-entrypoint'], {
      queryParams: { scholarSeasonId: data._id, title: data.scholar_season },
    });
    // window.open(url.toString(), '_self');
  }

  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 266;
    return this.myInnerHeight;
  }

  imgUrl(src: string) {
    return src ? this.sanitizer.bypassSecurityTrustUrl(this.serverimgPath + src) : '';
  }

  getFontSize(titleShortName: string) {
    return 26;
    // let fontSize = 24;
    // if (titleShortName.length >= 15) {
    //   fontSize = 22;
    // }
    // if (titleShortName.length >= 17) {
    //   fontSize = 20;
    // }
    // if (titleShortName.length >= 18) {
    //   fontSize = 18;
    // }
    // if (titleShortName.length >= 20) {
    //   fontSize = 15;
    // }
    // if (titleShortName.length >= 26) {
    //   fontSize = 13;
    // }
    // return fontSize;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
