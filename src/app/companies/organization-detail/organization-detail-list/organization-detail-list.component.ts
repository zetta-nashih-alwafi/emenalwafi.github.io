import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoreService } from 'app/service/core/core.service';
import { ApplicationUrls } from 'app/shared/settings';

@Component({
  selector: 'ms-organization-detail-list',
  templateUrl: './organization-detail-list.component.html',
  styleUrls: ['./organization-detail-list.component.scss'],
})
export class OrganizationDetailListComponent implements OnInit {
  @Input() organizationList;
  @Input() selectedOrganizationId;
  @Output() selectedOrgChange = new EventEmitter<string>();

  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  myInnerHeight = 1920;
  isWaitingForResponse = false;
  constructor(private coreService: CoreService) {}
  ngOnInit() {
    this.coreService.sidenavOpen = false;
  }
  selectOrganization(orgId) {
    if (this.selectedOrganizationId !== orgId) {
      this.selectedOrganizationId = orgId;
      this.selectedOrgChange.emit(this.selectedOrganizationId);
    }
  }
  // *************** To Get Height window screen and put in style css height
  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 322;
    return this.myInnerHeight;
  }

  // *************** To Get Height window screen and put in style css height
  getCardHeight() {
    this.myInnerHeight = window.innerHeight - 403;
    return this.myInnerHeight;
  }
}
