import { MatTabGroup } from '@angular/material/tabs';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild, AfterViewInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import Swal from 'sweetalert2';
import { AuthService } from 'app/service/auth-service/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'ms-student-tab',
  templateUrl: './student-tab.component.html',
  styleUrls: ['./student-tab.component.scss'],
})
export class StudentTabComponent implements OnInit, OnDestroy, OnChanges {
  @Input() scholarSeasons;
  @Input() showFinancement;
  @Input() subTab;
  @Input() countryCodeList;
  @Output() loadingData: EventEmitter<boolean> = new EventEmitter();
  @Output() reloadData: EventEmitter<boolean> = new EventEmitter();
  @Output() reloadDataDetail: EventEmitter<boolean> = new EventEmitter();
  @Output() candidatePrograms: EventEmitter<boolean> = new EventEmitter();
  private subs = new SubSink();

  isWaitingForResponse = false;
  tabIndex: any;
  listScholar: any;
  childTabIndex = 0;
  currentUser;
  listStatusAdmitted = [
    { value: 'resigned', key: 'Resign' },
    // { value: 'deactivated', key: 'Deactivated' },
  ];

  listStatusResigned = [
    { value: 'admission_in_progress', key: 'Admitted' },
    // { value: 'deactivated', key: 'Deactivated' },
  ];

  listStatusAdmittedFC = [
    { value: 'resigned', key: 'Resign' },
    { value: 'financement_validated', key: 'Financement valided' },
    // { value: 'deactivated', key: 'Deactivated' },
  ];

  listStatusEngaged = [
    { value: 'resigned_after_engaged', key: 'Resign after engaged' },
    // { value: 'deactivated', key: 'Deactivated' },
  ];

  listStatusEngagedFC = [
    { value: 'resigned_after_engaged', key: 'Resign after engaged' },
    { value: 'financement_validated', key: 'Financement valided' },
    // { value: 'deactivated', key: 'Deactivated' },
  ];

  listStatusRegistered = [
    { value: 'resigned_after_registered', key: 'Resign after registered' },
    { value: 'report_inscription', key: 'Report Inscription +1' },
    { value: 'resignation_missing_prerequisites', key: 'resignation_missing_prerequisites' },
    { value: 'resign_after_school_begins', key: 'resign_after_school_begins' },
    { value: 'no_show', key: 'no_show' },
    // { value: 'deactivated', key: 'Deactivated' },
  ];

  listStatusPostphone = [
    { value: 'registered', key: 'Registered' },
    // { value: 'deactivated', key: 'Deactivated' },
  ];

  listStatusResignBegins = [{ value: 'registered', key: 'Registered' }];

  listStatusBillValidatedFC = [
    { value: 'financement_validated', key: 'Financement valided' },
    { value: 'resigned', key: 'Resign' },
  ];

  listStatusFinancementValidated = [
    { value: 'resigned', key: 'Resign' },
    { value: 'report_inscription', key: 'Report Inscription +1' },
    { value: 'registered', key: 'Registered' },
    // { value: 'admission_in_progress', key: 'Admitted' },
    // { value: 'bill_validated', key: 'Bill validated' },
    // { value: 'engaged', key: 'Engaged' },
  ];

  listStatusMissingPrerequisites = [
    { value: 'registered', key: 'Registered' },
  ]

  listStatusInScholarship = [{ value: 'resigned', key: 'Resign' }];
  listStatusForResignRegistered = [{ value: 'registered', key: 'Registered' }];
  listStatusForResignEngaged = [{ value: 'admission_in_progress', key: 'Admitted' }];
  listStatusForNoShow = [{ value: 'registered', key: 'Registered' }];
  currentProgramSelected: string;

  constructor(
    private candidateService: CandidatesService,
    private translate: TranslateService,
    private authService: AuthService,
    private pageTitleService: PageTitleService,
    private router: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.updatePageTitle();
    // this.moveToTab("Forms");
    this.currentProgramSelected = this.router.snapshot.queryParamMap.get('currentProgram');
  }

  ngOnChanges() {
    this.getCandidateData();
  }

  updatePageTitle() {
    this.pageTitleService.setTitle(this.translate.instant('Student Card Student'));
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.pageTitleService.setTitle(this.translate.instant('Student Card Student'));
    });
  }

  getStatusDropdown() {
    if (this.scholarSeasons?.length) {
      this.scholarSeasons.forEach((scholarCandidateData) => {
        const isFC = scholarCandidateData?.type_of_formation_id?.type_of_formation !== 'classic' ? true : false;
        if (
          scholarCandidateData?.candidate_admission_status === 'admission_in_progress' ||
          scholarCandidateData?.candidate_admission_status === 'admitted' ||
          scholarCandidateData?.candidate_admission_status === 'resigned'
        ) {
          if (isFC) {
            scholarCandidateData['studentStatusList'] = this.listStatusAdmittedFC;
          } else {
            if (scholarCandidateData?.candidate_admission_status === 'resigned') {
              scholarCandidateData['studentStatusList'] = this.listStatusResigned;
            } else {
              scholarCandidateData['studentStatusList'] = this.listStatusAdmitted;
            }
          }
        } else if (scholarCandidateData?.candidate_admission_status === 'engaged') {
          if (isFC) {
            scholarCandidateData['studentStatusList'] = this.listStatusEngagedFC;
          } else {
            scholarCandidateData['studentStatusList'] = this.listStatusEngaged;
          }
        } else if (scholarCandidateData?.candidate_admission_status === 'registered') {
          scholarCandidateData['studentStatusList'] = this.listStatusRegistered;
        } else if (scholarCandidateData?.candidate_admission_status === 'report_inscription') {
          scholarCandidateData['studentStatusList'] = this.listStatusPostphone;
        } else if (scholarCandidateData?.candidate_admission_status === 'resign_after_school_begins') {
          scholarCandidateData['studentStatusList'] = this.listStatusResignBegins;
        } else if (scholarCandidateData?.candidate_admission_status === 'bill_validated') {
          scholarCandidateData['studentStatusList'] = this.listStatusBillValidatedFC;
        } else if (scholarCandidateData?.candidate_admission_status === 'financement_validated') {
          scholarCandidateData['studentStatusList'] = this.listStatusFinancementValidated;
        } else if (scholarCandidateData?.candidate_admission_status === 'resigned_after_registered') {
          scholarCandidateData['studentStatusList'] = this.listStatusForResignRegistered;
        } else if (scholarCandidateData?.candidate_admission_status === 'resignation_missing_prerequisites') {
          scholarCandidateData['studentStatusList'] = this.listStatusMissingPrerequisites;
        } else if (scholarCandidateData?.candidate_admission_status === 'resigned_after_engaged') {
          if (isFC) {
            scholarCandidateData['studentStatusList'] = [];
          } else {
            scholarCandidateData['studentStatusList'] = this.listStatusForResignEngaged;
          }
        } else if (scholarCandidateData?.candidate_admission_status === 'in_scholarship') {
          scholarCandidateData['studentStatusList'] = this.listStatusInScholarship;
        } else if (scholarCandidateData?.candidate_admission_status === 'no_show') {
          scholarCandidateData['studentStatusList'] = this.listStatusForNoShow;
        } else {
          scholarCandidateData['studentStatusList'] = [];
        }

        // Inserting Permission Financement into data of scholar/candidate.
        if (scholarCandidateData?.type_of_formation_id?.type_of_formation) {
          scholarCandidateData['showFinancement'] = scholarCandidateData.type_of_formation_id.type_of_formation !== 'classic' ? true : false;
        } else {
          scholarCandidateData['showFinancement'] = false;
        }
      });
    }
  }

  getCandidateData() {
    this.currentProgramSelected = this.router?.snapshot?.queryParamMap?.get('selectedProgram') ? this.router?.snapshot?.queryParamMap?.get('selectedProgram') : '';
    if(!this.currentProgramSelected) {
      this.currentProgramSelected = this.router?.snapshot?.queryParamMap?.get('currentProgram') ? this.router?.snapshot?.queryParamMap?.get('currentProgram') : '';
    }
    this.isWaitingForResponse = true;
    if (this.scholarSeasons?.length) {
      this.scholarSeasons = this.scholarSeasons
        .filter((scholar) => !(scholar?.candidate_admission_status === 'admitted' && !scholar?.is_program_assigned))
        ?.sort((scholar1, scholar2) =>
          scholar1?.intake_channel?.scholar_season_id?.scholar_season < scholar2?.intake_channel?.scholar_season_id?.scholar_season
            ? -1
            : scholar1?.intake_channel?.scholar_season_id?.scholar_season > scholar2?.intake_channel?.scholar_season_id?.scholar_season
            ? 1
            : 0,
        );
      this.scholarSeasons[this.scholarSeasons.length - 1]['last_index'] = true;
      if (this.scholarSeasons?.length) {
        if (this.currentProgramSelected) {
          const currIndex = this.scholarSeasons.findIndex((element) => element?.intake_channel?._id === this.currentProgramSelected);
          this.tabIndex = currIndex >= 0 ? currIndex : this.scholarSeasons.length - 1;
        } else {
          const currIndex = this.scholarSeasons.findIndex((element) => element?.program_status === 'active');
          this.tabIndex = currIndex >= 0 ? currIndex : this.scholarSeasons.length - 1;
        }
      }

      this.moveToTab(this.subTab);
      this.isWaitingForResponse = false;
      this.getStatusDropdown();
    }
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

    return mappedProgram;
  }

  combinedProgram(data) {
    if (data && data.intake_channel) {
      return `${data.intake_channel.scholar_season_id.scholar_season} - ${data.intake_channel.program}`;
    }
  }

  moveToTab(tab) {
    const indexTab = this.tabIndex

    if (tab) {
      switch (tab) {
        case 'Contact':
          this.childTabIndex = 1;
          break;
        case 'Finance':
          this.childTabIndex = 2;
          break;
        case 'Documents':
          this.childTabIndex = 3;
          break;
        case 'VisaDocument':
          this.childTabIndex = 4;
          break;
        case 'Forms':
          // this code for handling when the "Visa document" tab is active or not, following changes in the index value in the tab-group
          if(this.scholarSeasons[indexTab]?.require_visa_permit){
            this.childTabIndex = 5;
          } else if(!this.scholarSeasons[indexTab]?.require_visa_permit){
            this.childTabIndex = 4;
          }
          break;
        case 'Financement':
          // this code for handling when the "Visa document" tab is active or not, following changes in the index value in the tab-group
          if(this.scholarSeasons[indexTab]?.require_visa_permit){
            this.childTabIndex = 6;
          } else if(!this.scholarSeasons[indexTab]?.require_visa_permit){
            this.childTabIndex = 5;
          }
          break;
        case 'Contract/Convention':
          // this code for handling when the "Visa document" tab is active or not, following changes in the index value in the tab-group
          if(this.scholarSeasons[indexTab]?.require_visa_permit){
            this.childTabIndex = 7;
          } else if(!this.scholarSeasons[indexTab]?.require_visa_permit){
            this.childTabIndex = 6;
          }
          break;
        default:
          this.childTabIndex = 0;
      }
    }
  }

  reload(value) {
    if (value) {
      this.reloadData.emit(value);
    }
  }

  reloadDetail(value) {
    if (value) {
      this.reloadData.emit(value);
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
