import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { AdmissionDashboardService } from 'app/service/admission-dashboard/dashboard.service';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { MatDialog } from '@angular/material/dialog';
import { ExportCsvService } from 'app/service/export-csv/export-csv.service';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CoreService } from 'app/service/core/core.service';
import { PermissionService } from 'app/service/permission/permission.service';
import Swal from 'sweetalert2';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-user-permission',
  templateUrl: './user-permission.component.html',
  styleUrls: ['./user-permission.component.scss'],
})
export class UserPermissionComponent implements OnInit, OnDestroy {
  today: Date;
  private subs = new SubSink();
  isPermission: string[];
  currentUserTypeId: any;
  currentUser: any;
  isWaitingForResponse = false;
  dataUserTypes = [];
  leftLabel = [];
  dataPermission = [];
  constructor(
    private translate: TranslateService,
    private userService: AuthService,
    private fb: UntypedFormBuilder,
    private router: ActivatedRoute,
    private coreService: CoreService,
    public permissionService: PermissionService,
    private pageTitleService: PageTitleService
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.coreService.sidenavOpen = false;
    }, 1000);
    this.currentUser = this.userService.getLocalStorageUser();
    this.isPermission = this.userService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.getAllUserTypes();
    this.pageTitleService.setTitle('NAV.SETTINGS.USER_PERMISSION');
  }

  getAllUserTypes() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.permissionService.getAllUserTypes().subscribe(
      (resp) => {
        if (resp?.length) {
          resp = resp.filter((res) => res?._id !== '5fe98eeadb866c403defdc6c');
          this.dataUserTypes = _.cloneDeep(resp);
          this.GetAllUserPermissionTable();
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  GetAllUserPermissionTable() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.permissionService.getAllUserPermissionTable().subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          this.dataPermission = _.cloneDeep(resp);
          this.leftLabel = [];
          if (resp?.menus?.length) {
            resp.menus.forEach((element) => {
              if (element?.sub_menu?.length) {
                element.sub_menu.forEach((sub, indexSub) => {
                  // we hide menu contracts since contract management move to as sub menu of Teacher Management
                  if (element?.menu !== 'contracts') {
                    const data = {
                      menu: element?.menu ? element.menu : '',
                      sub_menu: sub?.name ? sub.name : '',
                      permissions: sub?.permissions ? sub.permissions : '',
                      isFirst: indexSub === 0 ? true : false,
                    };
                    this.leftLabel.push(data);
                  }
                });
              }
            });
          }

          // we hide sub menu with null or empty string value
          const tempData = this.leftLabel?.filter((value) => value?.sub_menu);
          this.leftLabel = tempData;

          // console.log('this.leftLabel', this.leftLabel);
        }
      },
      (err) => {
        this.userService.postErrorLog(err);
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
}
