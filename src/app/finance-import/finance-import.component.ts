import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { SubSink } from 'subsink';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ms-finance-import',
  templateUrl: './finance-import.component.html',
  styleUrls: ['./finance-import.component.scss'],
})
export class FinanceImportComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  selected = 0;
  tabIndex = 0;
  clickedTabIndex;
  firstTab = false;
  secondTab = false;
  thirdTab = false;
  fourthTab = false;
  fiveTab = false;
  constructor(private pageTitleService: PageTitleService, private financeService: FinancesService, private translate: TranslateService) {
    // this.pageTitleService.setTitle('Import Finance');
    this.pageTitleService.setIcon('export');
  }

  ngOnInit() {
    // this.financeService.setCurrentStep(0);
    this.subs.sink = this.financeService.statusStepOne.subscribe((val: any) => {
      if (val) {
        this.selected = 1;
        this.secondTab = true;
      }
    });
    this.subs.sink = this.financeService.statusStepTwo.subscribe((val: any) => {
      if (val) {
        this.selected = 2;
        this.thirdTab = true;
      }
    });
    this.subs.sink = this.financeService.statusStepThree.subscribe((val: any) => {
      if (val) {
        this.selected = 3;
        this.fourthTab = true;
      }
    });
    this.subs.sink = this.financeService.statusStepFour.subscribe((val: any) => {
      if (val) {
        this.selected = 4;
        this.fiveTab = true;
      }
    });
    this.subs.sink = this.financeService.statusStepFive.subscribe((val: any) => {
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
      } else if (this.selected === 4) {
        this.fiveTab = true;
      }
    });
  }

  getTabIndex(tabName: string): number {
    if (tabName === this.translate.instant('FINANCE_IMPORT.Step 1') + ' ' + this.translate.instant('Import')) {
      return 0;
    } else if (tabName === this.translate.instant('FINANCE_IMPORT.Step 2') + ' ' + this.translate.instant('Confirm Reconciliations')) {
      return 1;
    } else if (tabName === this.translate.instant('FINANCE_IMPORT.Step 3') + ' ' + this.translate.instant('Assign Reconciliations')) {
      return 2;
    } else if (tabName === this.translate.instant('FINANCE_IMPORT.Step 4') + ' ' + this.translate.instant('Confirm Lettrage')) {
      return 3;
    } else if (tabName === this.translate.instant('FINANCE_IMPORT.Step 5') + ' ' + this.translate.instant('Assign Lettrage')) {
      return 4;
    } else if (tabName === this.translate.instant('Validate') || tabName === this.translate.instant('Start Reconciliation')) {
      this.subs.sink = this.financeService.currentStep.subscribe((val) => {
        this.selected = val;
        if (this.selected === 1) {
          this.secondTab = true;
        } else if (this.selected === 2) {
          this.thirdTab = true;
        } else if (this.selected === 3) {
          this.fourthTab = true;
        } else if (this.selected === 4) {
          this.fiveTab = true;
        }
      });
    } else {
      return -1;
    }
  }

  getValidTab(tabName: string): any {
    if (tabName === this.translate.instant('FINANCE_IMPORT.Step 1') + ' ' + this.translate.instant('Import')) {
      return true;
    } else if (tabName === this.translate.instant('FINANCE_IMPORT.Step 2') + ' ' + this.translate.instant('Confirm Reconciliations')) {
      return true;
    } else if (tabName === this.translate.instant('FINANCE_IMPORT.Step 3') + ' ' + this.translate.instant('Assign Reconciliations')) {
      return true;
    } else if (tabName === this.translate.instant('FINANCE_IMPORT.Step 4') + ' ' + this.translate.instant('Confirm Lettrage')) {
      return true;
    } else if (tabName === this.translate.instant('FINANCE_IMPORT.Step 5') + ' ' + this.translate.instant('Assign Lettrage')) {
      return true;
    } else if (tabName === this.translate.instant('Validate') || tabName === this.translate.instant('Start Reconciliation')) {
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
    } else if (tabName === this.translate.instant('cheque-deposit-slip')) {
      return 4;
    } else {
      return -1;
    }
  }

  checkValidation(clickEvent: any) {
    let validation: Boolean;
    let validTab: Boolean;
    validation = false;
    if (clickEvent && clickEvent.target) {
      validTab = this.getValidTab(clickEvent.target.textContent);
      if (validTab) {
        this.clickedTabIndex = this.getTabIndex(clickEvent.target.innerText);
        if (this.clickedTabIndex === 1) {
          if (this.secondTab) {
            this.selected = this.clickedTabIndex;
            this.financeService.setCurrentStep(this.clickedTabIndex);
          }
        } else if (this.clickedTabIndex === 2) {
          if (this.thirdTab) {
            this.selected = this.clickedTabIndex;
            this.financeService.setCurrentStep(this.clickedTabIndex);
          }
        } else if (this.clickedTabIndex === 3) {
          if (this.fourthTab) {
            this.selected = this.clickedTabIndex;
            this.financeService.setCurrentStep(this.clickedTabIndex);
          }
        } else if (this.clickedTabIndex === 0) {
            this.selected = this.clickedTabIndex;
            this.financeService.setCurrentStep(this.clickedTabIndex);
        }
      }
    }
  }

  ngOnDestroy() {
    this.pageTitleService.setTitle('');
    this.financeService.setCurrentStep(0);
    this.pageTitleService.setIcon('');
  }
}
