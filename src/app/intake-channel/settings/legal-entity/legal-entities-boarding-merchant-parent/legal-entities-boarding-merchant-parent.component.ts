import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { MatTab, MatTabGroup, MatTabHeader } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'apollo-link';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { BoardingMerchantBankAccountDetailComponent } from './boarding-merchant-bank-account-detail/boarding-merchant-bank-account-detail.component';
import { BoardingMerchantCompanyDetailComponent } from './boarding-merchant-company-detail/boarding-merchant-company-detail.component';
import { BoardingMerchantShareholderDetailComponent } from './boarding-merchant-shareholder-detail/boarding-merchant-shareholder-detail.component';
import { BoardingMerchantSignatoryDetailComponent } from './boarding-merchant-signatory-detail/boarding-merchant-signatory-detail.component';

@Component({
  selector: 'ms-legal-entities-boarding-merchant-parent',
  templateUrl: './legal-entities-boarding-merchant-parent.component.html',
  styleUrls: ['./legal-entities-boarding-merchant-parent.component.scss'],
})
export class LegalEntitiesBoardingMerchantParentComponent implements OnInit {
  @Output() backToTable: EventEmitter<boolean> = new EventEmitter();
  private subs = new SubSink();
  @ViewChild('merchantMatGroup', { static: false }) merchantMatGroup: MatTabGroup;
  @ViewChild('companyMerchant', { static: false }) companyMerchant: BoardingMerchantCompanyDetailComponent;
  @ViewChild('bankMerchant', { static: false }) bankMerchant: BoardingMerchantBankAccountDetailComponent;
  @ViewChild('shareholderMerchant', { static: false }) shareholderMerchant: BoardingMerchantShareholderDetailComponent;
  @ViewChild('signMerchant', { static: false }) signMerchant: BoardingMerchantSignatoryDetailComponent;
  selectedIndex = 0;
  legalEntityId;
  tabIndex = 0;
  clickedTabIndex;
  disableStepTwo = true;
  disableStepThree = true;
  disableStepFour = true;
  disableStepFive = true;
  statusLegalEntity;

  constructor(
    private router: ActivatedRoute,
    private translate: TranslateService,
    private financeService: FinancesService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.legalEntityId = null;
    this.router.queryParams.subscribe((res) => {
      if (res && res.legalEntityId) {
        this.legalEntityId = res.legalEntityId;
      }
    });
    this.getOneLegalEntity(true);
    // ************* Used for validation
    setTimeout(() => {
      this.merchantMatGroup._handleClick = this.interceptTabChange.bind(this);
    }, 500);

    // ************** Used for routing to tab
    if (this.router.snapshot.queryParamMap.get('tab')) {
      setTimeout(() => this.goToTab(this.router.snapshot.queryParamMap.get('tab')), 500);
    }
  }

  getOneLegalEntity(event) {
    // console.log('legalEntityId', this.legalEntityId);
    if (this.legalEntityId) {
      this.subs.sink = this.financeService.checkStatusLegalEntity(this.legalEntityId).subscribe(
        (resp) => {
          if (resp && resp._id) {
            this.statusLegalEntity = resp.online_payment_status;
            if (resp.account_holder_code) {
              this.disableStepTwo = false;
            }
            if (
              resp.account_holder_details &&
              resp.account_holder_details.bank_account_details &&
              resp.account_holder_details.bank_account_details.length &&
              resp.account_holder_details.bank_account_details[0] &&
              resp.account_holder_details.bank_account_details[0].owner_name
            ) {
              this.disableStepThree = false;
            }
            if (
              resp.account_holder_details &&
              resp.account_holder_details.business_detail &&
              resp.account_holder_details.business_detail.shareholders &&
              resp.account_holder_details.business_detail.shareholders.length &&
              resp.account_holder_details.business_detail.shareholders[0] &&
              resp.account_holder_details.business_detail.shareholders[0].first_name
            ) {
              this.disableStepFour = false;
            }
            if (
              resp.account_holder_details &&
              resp.account_holder_details.business_detail &&
              resp.account_holder_details.business_detail.signatories &&
              resp.account_holder_details.business_detail.signatories.length &&
              resp.account_holder_details.business_detail.signatories[0] &&
              resp.account_holder_details.business_detail.signatories[0].signatory_name &&
              (resp.online_payment_status === 'verification_in_progress' ||
                resp.online_payment_status === 'rejected' ||
                resp.online_payment_status === 'publish' ||
                resp.online_payment_status === 'pci_not_complete')
            ) {
              this.disableStepFive = false;
            }
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
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
  }

  openTable() {
    this.backToTable.emit(true);
  }

  selectedTab(event) {
    this.selectedIndex = event;
  }

  getIdLegalEntity(event) {
    this.legalEntityId = event;
  }

  checkValidation(clickEvent: any) {}

  interceptTabChange(tab: MatTab, tabHeader: MatTabHeader, idx: number) {
    // console.log(tab, tabHeader, idx);
    let result = false;
    let validation = false;
    // console.log('Validation Deactivate', this.bankMerchant, this.companyMerchant, this.signMerchant, this.shareholderMerchant);
    if (this.merchantMatGroup.selectedIndex === idx) {
      result = true;
      return result && MatTabGroup.prototype._handleClick.apply(this.merchantMatGroup, arguments);
    } else {
      if (this.merchantMatGroup.selectedIndex === 0) {
        // ************* For step 1 company resutl
        if (this.companyMerchant && this.companyMerchant.formCompanyDetail && this.companyMerchant.firstForm) {
          validation = this.companyMerchant.comparison();
        }
      } else if (this.merchantMatGroup.selectedIndex === 1) {
        // ************* For step 2 bank detail result
        if (this.bankMerchant && this.bankMerchant.bankAccountForm && this.bankMerchant.firstForm) {
          validation = this.bankMerchant.comparison();
        }
      } else if (this.merchantMatGroup.selectedIndex === 2) {
        // ************* For step 3 shareholder result
        if (
          this.shareholderMerchant &&
          this.shareholderMerchant.shareholderForm &&
          this.shareholderMerchant.firstForm &&
          !this.disableStepThree
        ) {
          validation = this.shareholderMerchant.comparison();
        }
      } else if (this.merchantMatGroup.selectedIndex === 3) {
        // ************* For step 3 signatory result
        if (this.signMerchant && this.signMerchant.signatoryForm && this.signMerchant.firstForm && !this.disableStepFour) {
          validation = this.signMerchant.comparison();
        }
      } else {
        validation = true;
      }
      if (!validation) {
        let dontShowSwal = false;
        if (idx === 1) {
          dontShowSwal = this.disableStepTwo ? true : false;
        } else if (idx === 2) {
          dontShowSwal = this.disableStepThree ? true : false;
        } else if (idx === 3) {
          dontShowSwal = this.disableStepFour ? true : false;
        }
        if (!dontShowSwal) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('TMTC_S01.TITLE'),
            text: this.translate.instant('TMTC_S01.TEXT'),
            confirmButtonText: this.translate.instant('TMTC_S01.BUTTON_1'),
            showCancelButton: true,
            cancelButtonText: this.translate.instant('TMTC_S01.BUTTON_2'),
            allowOutsideClick: false,
          }).then((res) => {
            if (res.dismiss) {
              result = true;
              return result && MatTabGroup.prototype._handleClick.apply(this.merchantMatGroup, arguments);
            }
          });
        } else {
          result = true;
          return result && MatTabGroup.prototype._handleClick.apply(this.merchantMatGroup, arguments);
        }
      } else {
        result = true;
        return result && MatTabGroup.prototype._handleClick.apply(this.merchantMatGroup, arguments);
      }
    }
  }

  goToTab(destination: string) {
    if (this.merchantMatGroup) {
      let index = 0;
      this.merchantMatGroup._tabs.forEach((tab, tabIndex) => {
        // console.log(tab);
        if (tab.textLabel === destination) {
          index = tabIndex;
        }
      });
      this.selectedIndex = index;
    }
  }
}
