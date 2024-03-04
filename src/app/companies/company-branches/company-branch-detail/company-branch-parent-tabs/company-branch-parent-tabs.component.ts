import { SchoolService } from './../../../../service/schools/school.service';
import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTab, MatTabGroup, MatTabHeader } from '@angular/material/tabs';
import { CompanyService } from 'app/service/company/company.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { PermissionService } from 'app/service/permission/permission.service';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-company-branch-parent-tabs',
  templateUrl: './company-branch-parent-tabs.component.html',
  styleUrls: ['./company-branch-parent-tabs.component.scss'],
})
export class CompanyBranchParentTabsComponent implements OnInit, AfterViewInit {
  selectedIndex = 0;
  @Input() companyId;
  @Input() quickSearchMentorId;
  @ViewChild('companyMatGroup', { static: false }) companyMatGroup: MatTabGroup;

  isWaitingForResponse = false;
  userData;

  constructor(
    private schoolService: SchoolService,
    private companyService: CompanyService,
    private translate: TranslateService,
    private authService: AuthService,
    public permissionService: PermissionService,
  ) {}

  ngOnInit() {
    // console.log('quickSearchMentorId::', this.quickSearchMentorId);
    if (this.quickSearchMentorId) {
      this.selectedIndex = 1;
    }
    this.getAllUsers();
  }

  ngAfterViewInit() {
    this.companyMatGroup._handleClick = this.checkIfAnyChildrenFormInvalid.bind(this);
  }

  getAllUsers() {
    this.userData = [];
    this.isWaitingForResponse = true;
    this.schoolService.getAllUserNote().subscribe(
      (respAdmtc) => {
        this.isWaitingForResponse = false;
        this.userData = respAdmtc;
      },
      (err) => {
        this.authService.postErrorLog(err);
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
        this.userData = [];
        this.isWaitingForResponse = false;
      },
    );
  }

  checkIfAnyChildrenFormInvalid(tab: MatTab, tabHeader: MatTabHeader, idx: number) {
    if (!this.companyService.childrenFormValidationStatus) {
      return this.fireUnsavedDataWarningSwal(tab, tabHeader, idx);
    }
    return true && MatTabGroup.prototype._handleClick.apply(this.companyMatGroup, [tab, tabHeader, idx]);
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
      } else {
        this.companyService.childrenFormValidationStatus = true;
        return true && MatTabGroup.prototype._handleClick.apply(this.companyMatGroup, [tab, tabHeader, idx]);
      }
    });
  }
}
