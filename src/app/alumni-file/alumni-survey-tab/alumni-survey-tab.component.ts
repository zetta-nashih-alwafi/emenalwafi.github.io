import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { AlumniService } from 'app/service/alumni/alumni.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { Router } from '@angular/router';
import { CoreService } from 'app/service/core/core.service';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-alumni-survey-tab',
  templateUrl: './alumni-survey-tab.component.html',
  styleUrls: ['./alumni-survey-tab.component.scss'],
  providers: [ParseStringDatePipe, ParseUtcToLocalPipe],
})
export class AlumniSurveyTabComponent implements OnInit, OnChanges, OnDestroy {
  private subs = new SubSink();
  @Input() candidate;
  @Output() reloadData: EventEmitter<boolean> = new EventEmitter();
  @Output() continue = new EventEmitter<boolean>();
  alumniSurveyData;
  alumniSelected = '';
  isWaitingForResponse = false;
  private intVal: any;
  private timeOutVal: any;

  constructor(
    private router: Router,
    private translate: TranslateService,
    public permissionService: PermissionService,
    public alumniService: AlumniService,
    public coreService: CoreService,
    private parseUtcToLocalPipe: ParseUtcToLocalPipe,
    public pageTitleService: PageTitleService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    if (this.candidate && this.candidate._id) {
      this.alumniSelected = this.candidate._id;
    }
    this.populateDataSurvey();
  }

  ngOnChanges() {
    if (this.candidate && this.candidate._id) {
      this.alumniSelected = this.candidate._id;
    } else {
      this.alumniSelected = null;
    }
    this.populateDataSurvey();
  }

  updatePageTitle() {
    this.pageTitleService.setTitle(this.translate.instant('NAV.alumni-cards'));
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.pageTitleService.setTitle(this.translate.instant('NAV.alumni-cards'));
    });
  }

  populateDataSurvey() {
    if (this.alumniSelected) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.alumniService.getOneAlumniSurveyDetail(this.alumniSelected).subscribe(
        (alumni) => {
          if (alumni) {
            this.alumniSurveyData = alumni;
            this.isWaitingForResponse = false;
          }
        },
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
        },
      );
    }
  }

  parseDateToLocal(createdAt) {
    const date = createdAt.date;
    const time = createdAt.time;

    if (date && time) {
      const parsed = this.parseUtcToLocalPipe.transformDate(date, time);
      return parsed;
    } else {
      return '';
    }
  }

  parseTimeToLocal(createdAt) {
    const time = createdAt.time;

    if (time) {
      const parsed = this.parseUtcToLocalPipe.transform(time);
      return parsed;
    } else {
      return '';
    }
  }

  openForm(survey) {
    // const query = { formId: survey._id, alumniId: this.alumniSelected, formType: 'alumni' };
    // const url = this.router.createUrlTree(['/form-survey'], { queryParams: query });
    // window.open(url.toString(), '_blank');

    const userTypeId = '60b99bd0d824c52eec246fcb';
    const query = { formId: survey._id, formType: 'alumni', userId: this.alumniSelected, userTypeId: userTypeId };
    const url = this.router.createUrlTree(['/form-fill'], { queryParams: query });
    window.open(url.toString(), '_blank');
  }

  ngOnDestroy() {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
  }
}
