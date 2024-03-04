import { MatTabGroup } from '@angular/material/tabs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { PermissionService } from 'app/service/permission/permission.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';
@Component({
  selector: 'ms-operation-lines-parent',
  templateUrl: './operation-lines-parent.component.html',
  styleUrls: ['./operation-lines-parent.component.scss']
})
export class OperationLinesParentComponent implements OnInit {

  isLoading = false;

  @ViewChild('operationMatGroup', { static: false }) templateMatGroup: MatTabGroup;
  selectedIndex;
  tabIndex = 0;

  allowShowNotExportedTab = false;
  allowShowExportedTab = false;

  constructor(
    private permissions: PermissionService,
    private pageTitleService: PageTitleService
  ) { }

  ngOnInit(): void {
    this.getPermissions();
    this.pageTitleService.setTitle('Operation Lines');
  }

  getPermissions(): void {
    this.allowShowNotExportedTab = Boolean(this.permissions.operationLinesShowNotExportedTabPermission());
    this.allowShowExportedTab = Boolean(this.permissions.operationLinesShowExportedTabPermission());
  }

  selectTab(tab) {
    console.log('tab', tab);
  }

  selectedTabIndex(label, idx) {
    console.log('tab', label, idx, this.tabIndex);
  }
  
  ngOnDestroy(){
    this.pageTitleService.setTitle(null);
  }
}
