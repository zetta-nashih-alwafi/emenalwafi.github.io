import { Component, OnInit, Input, OnDestroy, Output, EventEmitter, OnChanges, ChangeDetectorRef, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import Swal from 'sweetalert2';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { removeSpaces } from 'app/service/customvalidator.validator';
import * as _ from 'lodash';
import * as moment from 'moment';
import { ParseStringDatePipe } from 'app/shared/pipes/parse-string-date.pipe';
import { ParseLocalToUtcPipe } from 'app/shared/pipes/parse-local-to-utc.pipe';
import { ParseUtcToLocalPipe } from 'app/shared/pipes/parse-utc-to-local.pipe';
import { DateAdapter } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatTabGroup } from '@angular/material/tabs';
import { forkJoin } from 'rxjs';
import { AfterViewChecked } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoreService } from 'app/service/core/core.service';
import { TutorialService } from 'app/service/tutorial/tutorial.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { FinancesService } from 'app/service/finance/finance.service';

@Component({
  selector: 'ms-scholar-seasons-detail',
  templateUrl: './scholar-seasons-detail.component.html',
  styleUrls: ['./scholar-seasons-detail.component.scss'],
  providers: [ParseStringDatePipe, ParseLocalToUtcPipe, ParseUtcToLocalPipe],
})
export class ScholarSeasonComponent implements OnInit, OnDestroy, OnChanges, AfterViewChecked {
  private subs = new SubSink();
  @Input() selectedRncpTitleId: string;
  @Input() selectedClassId: string;
  @Input() selectedClassName: string;
  @Output() updateClassParam = new EventEmitter();
  @ViewChild('sliderMatTabGroup', { static: false }) sliderMatTabGroup: MatTabGroup;

  isTutorialAdded = false;
  dataTutorial: any;
  tutorialData: any;

  selectedIndex = 0;
  isWaitingForResponse = false;
  contractActive = false;
  jobActive = false;
  problemActive = false;
  esActive = false;
  mentorActive = false;
  identityActive = false;
  isDisabledButton = false;
  firstForm: any;

  today = new Date();
  classData = null;
  // ************* For Job Desc Template
  quetionaireList: any;
  originalQuetionaireList: any;
  // ************ For Problematic Tempalte
  problematicQuetionaireList: any;
  classParameterForm: UntypedFormGroup;
  isPermission: any;

  timeOutVal;
  maxDate;
  minDate;
  // Variables related to specialization in class
  specialization_input = new UntypedFormControl('', removeSpaces);
  scholarSeasons: any;
  scholarSeasonId: any;
  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private rncpTitleService: RNCPTitlesService,
    public translate: TranslateService,
    private parseStringDatePipe: ParseStringDatePipe,
    private parseLocalToUTCPipe: ParseLocalToUtcPipe,
    private parseUTCToLocalPipe: ParseUtcToLocalPipe,
    private cdr: ChangeDetectorRef,
    private dateAdapter: DateAdapter<Date>,
    private route: ActivatedRoute,
    public coreService: CoreService,
    private authService: AuthService,
    public tutorialService: TutorialService,
    private pageTitleService: PageTitleService,
    private financeService: FinancesService,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((res) => {
      console.log('_res', res);
      if (res && res.scholarSeasonId) {
        this.scholarSeasonId = res.scholarSeasonId;
      }
      if (res && res.title) {
        this.scholarSeasons = res.title;
      } else {
        this.scholarSeasons = '';
      }
    });
    this.isPermission = this.authService.getPermission();
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.dateAdapter.setLocale(this.translate.currentLang);
    });
    const names = this.translate.instant('Scholar Season Detail');
    this.pageTitleService.setTitle(names + (this.scholarSeasons ? ' - ' + this.scholarSeasons : ''));
    // this.pageTitleService.setIcon('login');
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      const name = this.translate.instant('Scholar Season Detail');
      this.pageTitleService.setTitle(name + (this.scholarSeasons ? ' - ' + this.scholarSeasons : ''));
      // this.pageTitleService.setIcon('login');
    });

    this.initClassParameterForm();
    this.getDataScholarDetail();
  }

  ngOnChanges() {
    const names = this.translate.instant('Scholar Season Detail');
    this.pageTitleService.setTitle(names + (this.scholarSeasons ? ' - ' + this.scholarSeasons : ''));
    // this.pageTitleService.setIcon('login');
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      const name = this.translate.instant('Scholar Season Detail');
      this.pageTitleService.setTitle(name + (this.scholarSeasons ? ' - ' + this.scholarSeasons : ''));
      // this.pageTitleService.setIcon('login');
    });
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  initClassParameterForm() {
    this.classParameterForm = this.fb.group({
      scholar_season: [null],
      from: this.fb.group({
        date_utc: [null, Validators.required],
        time_utc: ['15:59'],
      }),
      to: this.fb.group({
        date_utc: [null, Validators.required],
        time_utc: ['15:59'],
      }),
      description: [null],
      is_published: [false],
    });
    this.firstForm = _.cloneDeep(this.classParameterForm.value);
  }

  getDataScholarDetail() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.financeService.getOneScholarSeason(this.scholarSeasonId).subscribe((resp) => {
      this.isWaitingForResponse = false;
      if (resp) {
        const payload = _.cloneDeep(resp);
        if (resp.from && resp.from.date_utc) {
          const finalTime = resp.from.time_utc ? resp.from.time_utc : '15:59';
          payload.from.date_utc = this.parseStringDatePipe.transformStringToDate(
            this.parseUTCToLocalPipe.transformDate(payload.from.date_utc, finalTime),
          );
          this.minDate = moment(payload.from.date_utc).format('DD/MM/YYYY');
        }
        if (resp.from && resp.to.date_utc) {
          const finalTime = resp.to.time_utc ? payload.to.time_utc : '15:59';
          payload.to.date_utc = this.parseStringDatePipe.transformStringToDate(
            this.parseUTCToLocalPipe.transformDate(payload.to.date_utc, finalTime),
          );
          this.maxDate = moment(payload.to.date_utc).format('DD/MM/YYYY');
        }
        this.classParameterForm.patchValue(payload);
        this.firstForm = _.cloneDeep(this.classParameterForm.value);
        console.log(payload, this.classParameterForm, resp);
      }
    }, (error) => {
      this.isWaitingForResponse = false
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
        confirmButtonText: this.translate.instant('OK'),
      });
    })
  }

  checkFormValidity(): boolean {
    if (this.classParameterForm.invalid) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('FormSave_S1.TITLE'),
        html: this.translate.instant('FormSave_S1.TEXT'),
        confirmButtonText: this.translate.instant('FormSave_S1.BUTTON'),
      });
      this.classParameterForm.markAllAsTouched();
      return true;
    } else {
      return false;
    }
  }

  save() {
    if (this.checkFormValidity()) {
      return;
    }
    console.log(this.classParameterForm.controls);
    // return;
    const payload = this.classParameterForm.value;
    const currentTime = moment(this.today).format('HH:mm');
    let dateFrom = this.classParameterForm.get('from').get('date_utc').value
      ? this.classParameterForm.get('from').get('date_utc').value
      : moment(this.today).format('DD/MM/YYYY');
    dateFrom = moment(dateFrom).format('DD/MM/YYYY');
    let dateTo = this.classParameterForm.get('to').get('date_utc').value
      ? this.classParameterForm.get('to').get('date_utc').value
      : moment(this.today).format('DD/MM/YYYY');
    dateTo = moment(dateTo).format('DD/MM/YYYY');
    payload.from.date_utc = this.parseLocalToUTCPipe.transformDate(dateFrom, currentTime);
    payload.to.date_utc = this.parseLocalToUTCPipe.transformDate(dateTo, currentTime);
    payload.from.time_utc = this.parseLocalToUTCPipe.transform(currentTime);
    payload.to.time_utc = this.parseLocalToUTCPipe.transform(currentTime);
    this.isWaitingForResponse = true;
    this.subs.sink = this.financeService.UpdateScholarSeason(payload, this.scholarSeasonId).subscribe(
      (response) => {
        console.log(response);
        if (response) {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: 'Bravo!',
          }).then((result) => {
            this.firstForm = _.cloneDeep(this.classParameterForm.value);
          });
        }
        if (response.errors && response.errors.length && response.errors[0].message) {
        }
        this.scholarSeasons = response.scholar_season;
        const names = this.translate.instant('Scholar Season Detail');
        this.pageTitleService.setTitle(names + (this.scholarSeasons ? ' - ' + this.scholarSeasons : ''));
        // this.pageTitleService.setIcon('login');
        this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
          const name = this.translate.instant('Scholar Season Detail');
          this.pageTitleService.setTitle(name + (this.scholarSeasons ? ' - ' + this.scholarSeasons : ''));
          // this.pageTitleService.setIcon('login');
        });
        this.router.navigate(['/scholar-card/admission-entrypoint'], {
          queryParams: { scholarSeasonId: this.scholarSeasonId, title: response.scholar_season },
        });
      },
      (err) => {
        if (
          err && err['message'] && (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.authService.handlerSessionExpired();
          return;
        }
        if (err['message'] === 'GraphQL error: scholar season name already exist') {
          Swal.fire({
            title: this.translate.instant('USERADD_S2.TITLE'),
            html: this.translate.instant('scholar season name already exist'),
            type: 'warning',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('USERADD_S2.BUTTON'),
          });
        } else if (err['message'] === 'GraphQL error: scholar season name contain invalid character') {
          Swal.fire({
            title: this.translate.instant('USERADD_S2.TITLE'),
            html: this.translate.instant('scholar season name contain invalid character'),
            type: 'warning',
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('USERADD_S2.BUTTON'),
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  /* comparison() {
    const firstForm = JSON.stringify(this.firstForm);
    const form = JSON.stringify(this.classParameterForm.value);
    if (firstForm === form) {
      return true;
    } else {
      return false;
    }
  } */

  getConvertDate(date, time) {
    const today = moment(date).format('DD/MM/YYYY');
    return this.parseLocalToUTCPipe.transformDate(today, time);
  }

  getTodayTime(time) {
    return this.parseLocalToUTCPipe.transform(time);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  checkTabActive() {
    if (this.jobActive || this.problemActive || this.mentorActive || this.esActive || this.identityActive) {
      if (this.jobActive) {
        this.selectedIndex = 0;
      } else if (this.problemActive) {
        this.selectedIndex = 1;
      } else if (this.mentorActive) {
        this.selectedIndex = 2;
      } else if (this.esActive) {
        this.selectedIndex = 3;
      } else if (this.identityActive) {
        this.selectedIndex = 4;
      }
    }
  }
}
