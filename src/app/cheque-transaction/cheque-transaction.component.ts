import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTab, MatTabGroup, MatTabHeader } from '@angular/material/tabs';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-cheque-transaction',
  templateUrl: './cheque-transaction.component.html',
  styleUrls: ['./cheque-transaction.component.scss'],
})
export class ChequeTransactionComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatTabGroup, { static: false }) tabs: MatTabGroup;
  private subs = new SubSink();
  selected = 0;
  tabIndex = 0;
  clickedTabIndex;
  firstTab = false;
  secondTab = false;
  thirdTab = false;
  fourthTab = false;
  constructor(private pageTitleService: PageTitleService, private financeService: FinancesService, private translate: TranslateService) {}

  ngOnInit() {
    this.financeService.setDataEntityCheque(null);
    // this.financeService.setCurrentStep(0);
    this.subs.sink = this.financeService.statusStepOneCheque.subscribe((val: any) => {
      if (val) {
        this.selected = 1;
        this.secondTab = true;
      }
    });
    this.subs.sink = this.financeService.statusStepTwoCheque.subscribe((val: any) => {
      if (val) {
        this.selected = 2;
        this.thirdTab = true;
      }
    });
    this.subs.sink = this.financeService.statusStepThreeCheque.subscribe((val: any) => {
      if (val) {
        this.selected = 3;
        this.fourthTab = true;
      }
    });
    this.subs.sink = this.financeService.statusStepFourCheque.subscribe((val: any) => {
      if (val) {
        this.selected = 0;
      }
    });
    this.subs.sink = this.financeService.currentStep.subscribe((val) => {
      this.selected = val;
      if (this.selected === 1) {
        this.secondTab = true;
      } else if (this.selected === 2) {
        this.thirdTab = true;
      } else if (this.selected === 3) {
        this.fourthTab = true;
      }
    });
  }

  ngAfterViewInit() {
    this.tabs._handleClick = this.checkIfAnyChildrenFormInvalid.bind(this);
  }

  //below function we check if any of the children has an unsaved forms
  checkIfAnyChildrenFormInvalid(tab: MatTab, tabHeader: MatTabHeader, idx: number) {
    if (!this.financeService.childrenFormValidationStatus) {
      return this.fireUnsavedDataWarningSwal(tab, tabHeader, idx);
    }
    return true && MatTabGroup.prototype._handleClick.apply(this.tabs, [tab, tabHeader, idx]);
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
        this.financeService.childrenFormValidationStatus = true;
        return true && MatTabGroup.prototype._handleClick.apply(this.tabs, [tab, tabHeader, idx]);
      }
    });
  }

  ngOnDestroy() {
    this.financeService.setCurrentStep(0);
  }

  getTabIndex(tabName: string): number {
    if (tabName === this.translate.instant('FINANCE_IMPORT.Step 1') + ' ' + this.translate.instant('Entity & Bank')) {
      return 0;
    } else if (tabName === this.translate.instant('FINANCE_IMPORT.Step 2') + ' ' + this.translate.instant('Cheques to Banking')) {
      return 1;
    } else if (tabName === this.translate.instant('FINANCE_IMPORT.Step 3') + ' ' + this.translate.instant('Confirmation')) {
      return 2;
    } else if (tabName === this.translate.instant('FINANCE_IMPORT.Step 4') + ' ' + this.translate.instant('Cheque Deposit Slip')) {
      return 3;
    } else if (
      tabName === this.translate.instant('Next') ||
      tabName === this.translate.instant('Previous') ||
      tabName === this.translate.instant('Retour Tableau de suivi des paiement')
    ) {
      this.subs.sink = this.financeService.currentStep.subscribe((val) => {
        this.selected = val;
      });
    } else {
      return -1;
    }
  }

  getValidTab(tabName: string): any {
    if (tabName === this.translate.instant('FINANCE_IMPORT.Step 1') + ' ' + this.translate.instant('Entity & Bank')) {
      return true;
    } else if (tabName === this.translate.instant('FINANCE_IMPORT.Step 2') + ' ' + this.translate.instant('Cheques to Banking')) {
      return true;
    } else if (tabName === this.translate.instant('FINANCE_IMPORT.Step 3') + ' ' + this.translate.instant('Confirmation')) {
      return true;
    } else if (tabName === this.translate.instant('FINANCE_IMPORT.Step 4') + ' ' + this.translate.instant('Cheque Deposit Slip')) {
      return true;
    } else if (
      tabName === this.translate.instant('Next') ||
      tabName === this.translate.instant('Previous') ||
      tabName === this.translate.instant('Retour Tableau de suivi des paiement')
    ) {
      return true;
    } else {
      return false;
    }
  }

  getTabFromParam(tabName: string): number {
    if (tabName === this.translate.instant('cheque-entity-bank')) {
      return 0;
    } else if (tabName === this.translate.instant('cheque-to-bank')) {
      return 1;
    } else if (tabName === this.translate.instant('confirmation-step')) {
      return 2;
    } else if (tabName === this.translate.instant('cheque-deposit-slip')) {
      return 3;
    } else {
      return -1;
    }
  }

  canDeactivate(): Promise<boolean> | boolean {
    if (!this.financeService.childrenFormValidationStatus) {
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
          } else if (result.dismiss) {
            this.financeService.childrenFormValidationStatus = true;
            resolve(true);
          }
        });
      });
    } else {
      this.financeService.childrenFormValidationStatus = true;
      return true;
    }
  }

  // checkValidation(clickEvent: any) {
  //   let validation: Boolean;
  //   let validTab: Boolean;
  //   validation = false;
  //   if (clickEvent && clickEvent.target) {
  //     validTab = this.getValidTab(clickEvent.target.textContent);
  //     if (validTab) {
  //       this.clickedTabIndex = this.getTabIndex(clickEvent.target.innerText);
  //       if (this.clickedTabIndex === 1) {
  //         if (this.secondTab) {
  //           this.selected = this.clickedTabIndex;
  //           this.financeService.setCurrentStep(this.clickedTabIndex);
  //         }
  //       } else if (this.clickedTabIndex === 2) {
  //         if (this.thirdTab) {
  //           this.selected = this.clickedTabIndex;
  //           this.financeService.setCurrentStep(this.clickedTabIndex);
  //         }
  //       } else if (this.clickedTabIndex === 3) {
  //         if (this.fourthTab) {
  //           this.selected = this.clickedTabIndex;
  //           this.financeService.setCurrentStep(this.clickedTabIndex);
  //         }
  //       } else if (this.clickedTabIndex === 0) {
  //           this.selected = this.clickedTabIndex;
  //           this.financeService.setCurrentStep(this.clickedTabIndex);
  //       }
  //     }
  //   }
  // }
}
