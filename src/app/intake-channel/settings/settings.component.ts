import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTab, MatTabGroup, MatTabHeader } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  @ViewChild('settingMatGroup', { static: false }) settingMatGroup: MatTabGroup;
  dataNotValid = false;
  scholarId: any;
  selectedIndex = 0;
  isBoardingMerchantSaved = true;
  isWaitingForResponse = false;

  constructor(
    private pageTitleService: PageTitleService,
    public permission: PermissionService,
    private router: ActivatedRoute,
    private financeService: FinancesService,
    private translate: TranslateService,
    private route: Router,
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.settingMatGroup._handleClick = this.interceptTabChange.bind(this);
    }, 500);

    const hasLegalEntityId = this.router.snapshot.queryParamMap.get('legalEntityId') ? true : false;
    const hasLegalEntityIdFromAdyen = this.router.snapshot.queryParamMap.get('amp;openLegalEntities') ? true : false;
    const openLegalEntities = this.router.snapshot.queryParamMap.get('openLegalEntities') ? true : false;

    if (hasLegalEntityIdFromAdyen) {
      this.route.navigateByUrl('/', { skipLocationChange: true }).then(() =>
        this.route.navigate([`/settings`], {
          queryParams: {
            openLegalEntities: true,
          },
        }),
      );
      this.moveToTab('LegalEntities');
    }
    if (hasLegalEntityId || openLegalEntities) {
      this.moveToTab('LegalEntities');
    }
  }

  moveToTab(tab) {
    this.isWaitingForResponse = true;
    if (tab) {
      switch (tab) {
        case 'LegalEntities':
          setTimeout(() => {
            this.selectedIndex = 4;
            this.isWaitingForResponse = false;
          }, 1000);
          break;
        default:
          this.selectedIndex = 0;
          this.isWaitingForResponse = false;
      }
    }
  }

  interceptTabChange(tab: MatTab, tabHeader: MatTabHeader, idx: number) {
    const hasLegalEntityId = this.router.snapshot.queryParamMap.get('legalEntityId') ? true : false;
    if (hasLegalEntityId) {
      this.route.navigate(['.'], {
        relativeTo: this.router,
        queryParams: {
          title: this.router.snapshot.queryParamMap.get('title'),
        },
      });
    }
    let validation: Boolean;
    validation = false;
    if (!this.isBoardingMerchantSaved) {
      validation = true;
    }
    if (validation) {
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
          this.financeService.setDataMerchantBoardingSaved(false);
          setTimeout(() => {
            this.selectedIndex = 12;
          }, 5);
          return MatTabGroup.prototype._handleClick.apply(this.settingMatGroup, arguments);
        } else {
          this.financeService.setDataMerchantBoardingSaved(true);
          this.selectedIndex = idx;
          return MatTabGroup.prototype._handleClick.apply(this.settingMatGroup, arguments);
        }
      });
    } else {
      this.financeService.setDataMerchantBoardingSaved(true);
      return MatTabGroup.prototype._handleClick.apply(this.settingMatGroup, arguments);
    }
  }

  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    let validation: Boolean;
    validation = false;
    if (!this.isBoardingMerchantSaved) {
      validation = true;
    }
    if (validation) {
      return new Promise((resolve, reject) => {
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
            resolve(false);
          } else {
            resolve(true);
          }
        });
      });
    } else {
      return true;
    }
  }

  ngOnDestroy(): void {
    this.pageTitleService.setTitle('');
  }
}
