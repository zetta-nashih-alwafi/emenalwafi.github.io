import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InternshipService } from 'app/service/internship/internship.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'ms-internship-condition-agreement-tab',
  templateUrl: './internship-condition-agreement-tab.component.html',
  styleUrls: ['./internship-condition-agreement-tab.component.scss']
})
export class InternshipConditionAgreementTabComponent implements OnInit, OnDestroy {

  private subs = new SubSink();
  selectedIndex = 0;
  clickedTabIndex;
  firstTab = false;
  secondTab = false;
  schoolSelected = false;
  constructor(
    private internshipService: InternshipService, private translate: TranslateService) { }

  ngOnInit() {
    this.subs.sink = this.internshipService.indexStep.subscribe((val) => {
      this.selectedIndex = val;
    });
  }

  disableTab(value) {
    this.schoolSelected = value;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getTabIndex(tabName: string): number {
    if (tabName === this.translate.instant('INTERN_SETTING.Conditions agreement table')) {
      return 0;
    } else if (tabName === this.translate.instant('INTERN_SETTING.Set up conditions')) {
      return 1;
    } else {
      return -1;
    }
  }

  getValidTab(tabName: string): any {
    if (tabName === this.translate.instant('INTERN_SETTING.Conditions agreement table')) {
      return true;
    } else if (tabName === this.translate.instant('INTERN_SETTING.Set up conditions')) {
      return true;
    } else {
      return false;
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
            this.selectedIndex = this.clickedTabIndex;
            this.internshipService.setIndexStep(this.clickedTabIndex);
          }
        } else if (this.clickedTabIndex === 0) {
            this.selectedIndex = this.clickedTabIndex;
            this.internshipService.setIndexStep(this.clickedTabIndex);
        }
      }
    }
  }

}
