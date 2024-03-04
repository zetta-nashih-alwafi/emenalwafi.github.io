import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import Swal from 'sweetalert2';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-student-convention-tab',
  templateUrl: './student-convention-tab.component.html',
  styleUrls: ['./student-convention-tab.component.scss'],
})
export class StudentConventionTabComponent implements OnInit, OnChanges, OnDestroy {
  @Input() candidateId;
  @Input() userData;
  @Output() loadingData: EventEmitter<boolean> = new EventEmitter();
  private subs = new SubSink();

  isWaitingForResponse = false;
  scholarSeasons: any[] = [];
  candidate: any;
  tabIndex: any;
  listScholar: any;

  constructor(
    private candidateService: CandidatesService,
    private translate: TranslateService,
    private authService: AuthService,
    private pageTitleService: PageTitleService,
  ) {}

  ngOnInit() {
    this.updatePageTitle();
  }

  ngOnChanges() {
    this.scholarSeasons = [];
    this.getCandidateData();
  }

  updatePageTitle() {
    this.pageTitleService.setTitle(this.translate.instant('Student Card Student'));
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.pageTitleService.setTitle(this.translate.instant('Student Card Student'));
    });
  }

  getCandidateData() {
    this.isWaitingForResponse = true;
    this.loadingData.emit(true);
    this.scholarSeasons = [];
    this.subs.sink = this.candidateService.getCandidateDetails(this.candidateId).subscribe(
      (resp) => {
        if (resp) {
          // console.log(resp);
          this.candidate = _.cloneDeep(resp);

          const mappedIntake = this.mapIntakeChannel(resp);
          this.scholarSeasons = mappedIntake;
          this.tabIndex = this.scholarSeasons?.length - 1;

          // this.scholarSeasons = [resp];
          // console.log(this.scholarSeasons);
          this.isWaitingForResponse = false;
          this.loadingData.emit(false);
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.loadingData.emit(false);
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.authService.handlerSessionExpired();
          return;
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  intakeChannel(data) {
    let intakeChannel = '';
    if (
      data &&
      data.intake_channel &&
      data.intake_channel.program &&
      data.scholar_season &&
      data.scholar_season.scholar_season &&
      data.school.short_name &&
      data.campus.name &&
      data.level.name
    ) {
      const scholarSeason = data.scholar_season.scholar_season ? data.scholar_season.scholar_season : '';
      const school = data.school && data.school.short_name ? data.school.short_name : '';
      const campus = data.campus && data.campus.name ? data.campus.name : '';
      const level = data.level && data.level.name ? data.level.name : '';
      const specialities = data.speciality && data.speciality.name ? ' - ' + data.speciality.name : '';
      intakeChannel = scholarSeason + ' - ' + school + ' - ' + campus + ' - ' + level + specialities;
      return intakeChannel;
    } else {
      return '';
    }
  }

  combinedProgram(data) {
    if (data && data.intake_channel) {
      return `${data.intake_channel.scholar_season_id.scholar_season} - ${data.intake_channel.program}`;
    }
  }

  mapIntakeChannel(resp) {
    let mappedProgram = [];
    if (resp && resp.previous_programs && resp.previous_programs.length > 0) {
      resp.previous_programs.forEach((elem) => {
        if (elem.intake_channel && elem.intake_channel.program === resp.initial_intake_channel) {
          elem['is_current'] = false;
          elem['is_initial'] = true;
          elem['is_previous'] = false;
          mappedProgram.push(elem);
        } else if (elem.intake_channel && elem.intake_channel._id === resp.latest_previous_program._id) {
          elem['is_current'] = false;
          elem['is_initial'] = false;
          elem['is_previous'] = true;
          mappedProgram.push(elem);
        }
      });
    }

    if (resp.intake_channel) {
      let dataIntake = resp;
      dataIntake['is_current'] = true;
      dataIntake['is_initial'] = false;
      dataIntake['is_previous'] = false;
      mappedProgram.push(dataIntake);
    }

    mappedProgram = mappedProgram.sort((a, b) => {
      if (a.is_initial) {
        return -1;
      } else if (a.is_current) {
        return 1;
      } else if (b.is_initial) {
        return 1;
      }
    });

    console.log('_test', mappedProgram);

    return mappedProgram;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
