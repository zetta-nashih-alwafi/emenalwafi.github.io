import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { MatDialog } from '@angular/material/dialog';
import { DuplicateScholarSeasonComponent } from './duplicate-scholar-season/duplicate-scholar-season.component';
import { PermissionService } from 'app/service/permission/permission.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-school-scholar-season',
  templateUrl: './school-scholar-season.component.html',
  styleUrls: ['./school-scholar-season.component.scss'],
})
export class SchoolScholarSeasonComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  schoolId;
  schoolData;
  scholarSeasonData;
  programsData;
  scholarId;

  isWaitingForResponse = false;

  selectedIndex;
  tabIndex = 0;
  isLoading: boolean;

  constructor(
    private intakeService: IntakeChannelService,
    private pageTitleService: PageTitleService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    public permissionService: PermissionService,
    private authService:AuthService
  ) {}

  ngOnInit() {
    this.pageTitleService.setTitle(this.translate.instant('Schools'));
    this.subs.sink = this.route.paramMap.subscribe((param) => {
      this.schoolId = param.get('id');
    });
    if (this.schoolId) {
      this.getSchoolData();
    }
    this.getAllSchoolarSeason();
  }

  checkDataCreateFromZero(scholarSeason) {
    let isThere = false;
    if (this.schoolData && this.schoolData.empty_scholar_seasons && this.schoolData.empty_scholar_seasons.length) {
      if (scholarSeason && scholarSeason._id) {
        this.schoolData.empty_scholar_seasons.forEach((element) => {
          if (element._id === scholarSeason._id) {
            isThere = true;
          }
        });
      }
    }
    return isThere;
  }

  createFromZero(scholarSeason) {
    if (this.schoolData && this.schoolData._id) {
      let scholar =
        this.schoolData.empty_scholar_seasons && this.schoolData.empty_scholar_seasons.length
          ? this.schoolData.empty_scholar_seasons.map((list) => list._id)
          : [];
      scholar.push(scholarSeason._id);
      scholar = _.uniqBy(scholar);
      const payload = {
        empty_scholar_seasons: scholar,
      };
      this.isWaitingForResponse = true;
      this.subs.sink = this.intakeService.updateCommonCandidateSchool(this.schoolData._id, payload).subscribe(
        (list) => {
          this.isWaitingForResponse = false;
          if (this.schoolId) {
            this.getSchoolData();
          }
          this.getAllSchoolarSeason();
          this.getSchoolPrograms(scholarSeason._id);
        },
        (err) => {
          this.isWaitingForResponse = true;
          this.authService.postErrorLog(err)
          if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('BAD_CONNECTION.Title'),
              html: this.translate.instant('BAD_CONNECTION.Text'),
              confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            });
          } else {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('Invalid_Form_Warning.TITLE'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        },
      );
    }
  }

  getSchoolData() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.intakeService.GetOneSchool(this.schoolId).subscribe(
      (resp) => {
        if (resp) {
          this.schoolData = _.cloneDeep(resp);
          console.log('SchoolData', this.schoolData);
          this.refreshTitle();
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err)
        if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('BAD_CONNECTION.Title'),
            html: this.translate.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('Invalid_Form_Warning.TITLE'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  refreshTitle() {
    if (this.schoolData) {
      this.pageTitleService.setTitle(this.translate.instant('Schools') + ' - ' + this.schoolData.short_name);
      this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.pageTitleService.setTitle(this.translate.instant('Schools') + ' - ' + this.schoolData.short_name);
      });
    } else {
      this.pageTitleService.setTitle(this.translate.instant('Schools'));
      this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
        this.pageTitleService.setTitle(this.translate.instant('Schools'));
      });
    }
  }

  selectTab(scholar_season) {
    console.log('tab', scholar_season);
    this.programsData = [];
    this.scholarId = '';
    if (scholar_season !== 'schoolDetail') {
      this.scholarId = scholar_season;
      this.getSchoolPrograms(scholar_season);
    }
  }

  selectedTabIndex(label, idx) {
    console.log('tab', label, idx, this.tabIndex);
  }

  getSchoolPrograms(scholar_season) {
    if (!this.schoolId) {
      this.programsData = [];
    } else {
      const filter = {
        school_id: this.schoolId,
        scholar_season_id: scholar_season,
      };
      this.isLoading = true;
      this.subs.sink = this.intakeService.GetAllSchoolProgram(filter).subscribe(
        (resp) => {
          this.isLoading = false;
          if (resp) {
            this.programsData = _.cloneDeep(resp);
            console.log('ProgramData', this.programsData);
          }
        },
        (err) => {
          this.isLoading = false;
          this.authService.postErrorLog(err)
          if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('BAD_CONNECTION.Title'),
              html: this.translate.instant('BAD_CONNECTION.Text'),
              confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
              allowOutsideClick: false,
              allowEnterKey: false,
              allowEscapeKey: false,
            });
          } else {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('Invalid_Form_Warning.TITLE'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          }
        },
      );
    }
  }

  getAllSchoolarSeason() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.intakeService.GetAllPublishedScholarSeasons(true).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.scholarSeasonData = _.cloneDeep(resp);
          console.log('PublishedScholarSeason', this.scholarSeasonData);
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err)
        if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('BAD_CONNECTION.Title'),
            html: this.translate.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('Invalid_Form_Warning.TITLE'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  openSelectExisting() {
    this.subs.sink = this.dialog
      .open(DuplicateScholarSeasonComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
        data: {
          scholar_season_destination_id: this.scholarId,
          school_id: this.schoolId,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getSchoolPrograms(resp);
        }
      });
  }

  openForm() {}

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
