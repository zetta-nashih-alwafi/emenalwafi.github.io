import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FinancesService } from 'app/service/finance/finance.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { Observable } from 'apollo-link';
import { TranslateService } from '@ngx-translate/core';
import { MatTab, MatTabGroup, MatTabHeader } from '@angular/material/tabs';

@Component({
  selector: 'ms-admission-entrypoint-tab-group',
  templateUrl: './admission-entrypoint-tab-group.component.html',
  styleUrls: ['./admission-entrypoint-tab-group.component.scss'],
})
export class AdmissionEntrypointTabGroupComponent implements OnInit {
  @ViewChild('studentMatGroup', { static: false }) studentMatGroup: MatTabGroup;
  dataNotValid = false;
  private subs = new SubSink();
  scholarId: any;
  selectedIndex = 0;
  isBoardingMerchantSaved = true;
  isWaitingForResponse = false;
  constructor(
    private router: ActivatedRoute,
    private financeService: FinancesService,
    private translate: TranslateService,
    private route: Router,
    private translateService: TranslateService,
  ) {}

  ngOnInit() {
    this.router.queryParams.subscribe((res) => {
      if (res && res.scholarSeasonId) {
        this.scholarId = res.scholarSeasonId;
      }
    });

    this.subs.sink = this.financeService.isAccountingHaveInvalidData.subscribe((val) => {
      this.dataNotValid = val;
    });
    this.subs.sink = this.financeService.isDataMerchantBoardingSaved.subscribe((val) => {
      this.isBoardingMerchantSaved = val;
    });
    // ************* Used for validation
    setTimeout(() => {
      this.studentMatGroup._handleClick = this.interceptTabChange.bind(this);
    }, 500);

    this.getAllAccountingData();
    const hasLegalEntityId = this.router.snapshot.queryParamMap.get('legalEntityId') ? true : false;
    const hasLegalEntityIdFromAdyen = this.router.snapshot.queryParamMap.get('amp;openLegalEntities') ? true : false;
    const openDocumentTab = this.router.snapshot.queryParamMap.get('openDocumentTab') ? true : false;
    const openLegalEntities = this.router.snapshot.queryParamMap.get('openLegalEntities') ? true : false;
    if (hasLegalEntityIdFromAdyen) {
      this.route.navigateByUrl('/', { skipLocationChange: true }).then(() =>
        this.route.navigate([`/scholar-card/admission-entrypoint`], {
          queryParams: {
            scholarSeasonId: this.scholarId,
            title: this.router.snapshot.queryParamMap.get('amp;title'),
            openLegalEntities: true,
          },
        }),
      );
      this.moveToTab('LegalEntities');
    }
    if (hasLegalEntityId || openLegalEntities) {
      this.moveToTab('LegalEntities');
    }

    if (openDocumentTab) {
      this.moveToTab('DocumentBuilder');
    }
  }

  moveToTab(tab) {
    this.isWaitingForResponse = true;
    if (tab) {
      switch (tab) {
        case 'LegalEntities':
          setTimeout(() => {
            this.selectedIndex = 12;
            this.isWaitingForResponse = false;
          }, 1000);
          break;
        case 'DocumentBuilder':
          setTimeout(() => {
            this.selectedIndex = 14;
            this.isWaitingForResponse = false;
          }, 1000);
          break;
        default:
          this.selectedIndex = 0;
          this.isWaitingForResponse = false;
      }
    }
  }

  getAllAccountingData() {
    const pagination = {
      limit: 10,
      page: 0,
    };
    let filter = '';
    filter += ` scholar_season_ids: ["${this.scholarId}"]`;
    filter = 'filter: {' + filter + '}';
    this.subs.sink = this.financeService.checkAdmissionIntakeData(pagination, filter).subscribe(
      (registrationProfile: any) => {
        if (registrationProfile && registrationProfile.length) {
          if (registrationProfile.is_completed) {
            this.financeService.setIsAccountingHaveInvalidData(false);
            this.dataNotValid = false;
          } else {
            this.financeService.setIsAccountingHaveInvalidData(true);
            this.dataNotValid = true;
            //  console.log('empty data');
          }
        }
      },
      (error) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translateService.instant('OK'),
        });
      },
    );
  }

  interceptTabChange(tab: MatTab, tabHeader: MatTabHeader, idx: number) {
    const hasLegalEntityId = this.router.snapshot.queryParamMap.get('legalEntityId') ? true : false;
    if (hasLegalEntityId) {
      this.route.navigate(['.'], {
        relativeTo: this.router,
        queryParams: {
          scholarSeasonId: this.scholarId,
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
          return MatTabGroup.prototype._handleClick.apply(this.studentMatGroup, arguments);
        } else {
          this.financeService.setDataMerchantBoardingSaved(true);
          this.selectedIndex = idx;
          return MatTabGroup.prototype._handleClick.apply(this.studentMatGroup, arguments);
        }
      });
    } else {
      this.financeService.setDataMerchantBoardingSaved(true);
      return MatTabGroup.prototype._handleClick.apply(this.studentMatGroup, arguments);
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
}
