import { Component, OnInit, OnDestroy, OnChanges, AfterViewInit } from '@angular/core';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { UntypedFormControl } from '@angular/forms';
import { InternshipService } from 'app/service/internship/internship.service';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { AddScholarDialogComponent } from 'app/internship-file/add-scholar-dialog/add-scholar-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { UtilityService } from 'app/service/utility/utility.service';
import { startWith } from 'rxjs/operators';
import { NgxPermissionsService } from 'ngx-permissions';
import { AuthService } from 'app/service/auth-service/auth.service';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ms-scholar-card',
  templateUrl: './scholar-card.component.html',
  styleUrls: ['./scholar-card.component.scss'],
})
export class ScholarCardComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  scholarSeasons: any[] = [];
  searchForm = new UntypedFormControl('');
  selectedCertifier = '';
  private subs = new SubSink();
  tabIndex;
  schoolId;
  currentUser;
  isCompanyUser: boolean;
  filteredSchoolSeasons: any[];

  listSchool = [];
  isWaitingForResponse = false;
  isOPERATORAdmin: boolean;
  isOPERATORDir: boolean;
  isPermission: any;

  constructor(
    private internshipService: InternshipService,
    private admissionService: AdmissionDashboardService,
    private dialog: MatDialog,
    private utilService: UtilityService,
    private userService: AuthService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.currentUser = this.utilService.getCurrentUser();
    this.isPermission = this.userService.getPermission();
    this.scholarSeasons = [];
    this.initScholarSeason();
    this.getAllCandidateSchool();
    this.resetSearch();
  }

  ngOnChanges() {
    this.subs.unsubscribe();
    this.scholarSeasons = [];
    this.isCompanyUser = false;
    this.initScholarSeason();
    this.resetSearch();
  }

  ngAfterViewInit() {
    this.initScholarSeason();
  }

  getAllCandidateSchool() {
    let userType;
    this.currentUser.entities.filter((res) => {
      if (res.type.name === this.isPermission[0]) {
        userType = res.type._id;
      }
    });
    this.subs.sink = this.admissionService.GetAllSchoolCandidatesUserType(userType).subscribe((resp) => {
      console.log('_list sch', resp);
      if (resp) {
        this.listSchool = resp;
      }
    }, (error) => {
      Swal.fire({
        type: 'info',
        title: this.translateService.instant('SORRY'),
        text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
        confirmButtonText: this.translateService.instant('OK'),
      });
    })
  }

  initScholarSeason(filter?) {
    this.subs.sink = this.internshipService.getAllScholarSeasons(filter).subscribe((res) => {
      console.log('_schol', res);
      if (res) {
        this.scholarSeasons = res;
        this.filteredSchoolSeasons = res;
        this.isWaitingForResponse = false;
      }
    }, (error) => {
      Swal.fire({
        type: 'info',
        title: this.translateService.instant('SORRY'),
        text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
        confirmButtonText: this.translateService.instant('OK'),
      });
    })
    if (!filter) {
      this.filterScholarSeason();
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  filterScholarSeason() {
    this.subs.sink = this.searchForm.valueChanges.pipe(startWith('')).subscribe((searchString: string) => {
      if (this.tabIndex !== 0) {
        this.tabIndex = 0;
      }
      setTimeout(() => {
        this.filteredSchoolSeasons = this.scholarSeasons.filter((scholar) => {
          if (scholar.scholar_season) {
            return (
              this.utilService
                .simpleDiacriticSensitiveRegex(scholar.scholar_season)
                .toLowerCase()
                .indexOf(this.utilService.simpleDiacriticSensitiveRegex(searchString).toLowerCase().trim()) !== -1
            );
          } else {
            return false;
          }
        });
      }, 500);
    });
  }

  // Filter title by certifier
  filterScholarSeaon(schoolSelected: string, event: any) {
    this.isWaitingForResponse = true;
    let foundSchool;
    if (schoolSelected) {
      foundSchool = this.listSchool.filter((res) => res.short_name === schoolSelected);
    }
    if (schoolSelected === 'all' || schoolSelected === '' || schoolSelected === 'All' || schoolSelected === 'Tous') {
      this.initScholarSeason();
    } else {
      if (foundSchool.length) {
        const filter = {
          candidate_school_id: foundSchool[0]._id,
        };
        this.initScholarSeason(filter);
      }
    }
  }

  resetSearch() {
    this.tabIndex = 0;
    this.searchForm.setValue('');
    this.filteredSchoolSeasons = this.scholarSeasons;
  }

  addScholarSeason() {
    this.subs.sink = this.dialog
      .open(AddScholarDialogComponent, {
        width: '600px',
        minHeight: '100px',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.initScholarSeason();
        }
      });
  }
}
