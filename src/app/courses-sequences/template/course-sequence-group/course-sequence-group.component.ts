import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTab, MatTabGroup, MatTabHeader } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CourseSequenceService } from 'app/service/course-sequence/course-sequence.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-course-sequence-group',
  templateUrl: './course-sequence-group.component.html',
  styleUrls: ['./course-sequence-group.component.scss'],
})
export class CourseSequenceGroupComponent implements OnInit, AfterViewInit, OnDestroy {
  private subs = new SubSink();
  @ViewChild('templateMatGroup', { static: false }) templateMatGroup: MatTabGroup;
  isWaitingForResponse = false;
  selectedIndex;
  tabIndex = 0;

  programId;
  sequenceGroup;
  sequenceId;

  constructor(
    private translate: TranslateService,
    public permissionService: PermissionService,
    private courseSequenceService: CourseSequenceService,
    private router: ActivatedRoute,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.subs.sink = this.router.paramMap.subscribe((param) => {
      this.sequenceId = param.get('id');
      this.getSequenceGroup();
    });
  }

  ngAfterViewInit() {
    this.templateMatGroup._handleClick = this.checkIfAnyChildrenFormInvalid.bind(this);
  }

  checkIfAnyChildrenFormInvalid(tab: MatTab, tabHeader: MatTabHeader, idx: number) {
    if (!this.courseSequenceService.childrenFormValidationStatus) {
      return this.fireUnsavedDataWarningSwal(tab, tabHeader, idx);
    }
    return true && MatTabGroup.prototype._handleClick.apply(this.templateMatGroup, [tab, tabHeader, idx]);
  }

  fireUnsavedDataWarningSwal(tab: MatTab, tabHeader: MatTabHeader, idx: number) {
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('TMTC_S01.TITLE'),
      text: this.translate.instant('TMTC_S01.TEXT'),
      confirmButtonText: this.translate.instant('TMTC_S01.BUTTON_1'),
      showCancelButton: true,
      cancelButtonText: this.translate.instant('TMTC_S01.BUTTON_2'),
      allowEscapeKey: false,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.value) {
        return false;
      } else if (result.dismiss) {
        this.courseSequenceService.childrenFormValidationStatus = true;
        return true && MatTabGroup.prototype._handleClick.apply(this.templateMatGroup, [tab, tabHeader, idx]);
      }
    });
  }

  getSequenceGroup() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.courseSequenceService.GetOneProgramCourseSequenceTab(this.sequenceId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.sequenceGroup = resp;
        }
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
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
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  selectTab(tab) {
    // console.log('tab', tab);
  }

  selectedTabIndex(label, idx) {
    // console.log('tab', label, idx, this.tabIndex);
  }

  reloadData(event) {
    // console.log('reloadData?', event);
    if (event) {
      this.getSequenceGroup();
    }
  }

  getNewTabClassGroup(event) {
    // console.log('EVENTDATAEMIT', event);
    if (event) {
      // console.log('THEREIS EVENT');
      this.getNewSequenceGroup(event);
    }
  }

  getNewSequenceGroup(event) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.courseSequenceService.GetOneProgramCourseSequenceTab(this.sequenceId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.sequenceGroup = resp;
          this.getTabGroup(event);
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        // Record error log
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
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
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  getTabGroup(event) {
    if (event) {
      setTimeout(() => this.goToTab(event), 1500);
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  // ************** Function to auto route tab
  goToTab(destination: string) {
    if (this.templateMatGroup) {
      let index = 0;
      this.templateMatGroup._tabs.forEach((tab, tabIndex) => {
        if (tab.textLabel === destination) {
          index = tabIndex;
        }
      });
      this.selectedIndex = index;
    }
  }
}
