import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { TutorialService } from 'app/service/tutorial/tutorial.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'ms-tutorial-tab',
  templateUrl: './tutorial-tab.component.html',
  styleUrls: ['./tutorial-tab.component.scss'],
})
export class TutorialTabComponent implements OnInit, OnDestroy {
  private subs = new SubSink();
  selected = 0;
  tabIndex = 0;
  clickedTabIndex;
  firstTab = false;
  secondTab = false;
  thirdTab = false;
  fourthTab = false;
  constructor(
    private translate: TranslateService, 
    private tutorialService: TutorialService,
    private pageTitleService: PageTitleService
  ) {}

  ngOnInit() {
    this.subs.sink = this.tutorialService.tutorialStep.subscribe((val) => {
      console.log('step', val);
      if (val === 1) {
        if (this.secondTab === true) {
          this.selected = val;
        }
      } else {
        this.selected = 0;
      }
    });
    this.pageTitleService.setTitle('InApp Tutorials');
  }

  ngOnDestroy() {
    // this.pageTitleService.setTitle('');
    // this.pageTitleService.setIcon('');
    // this.financeService.setCurrentStep(0);
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }

  getTabIndex(tabName: string): number {
    console.log('Click tabName', tabName);
    if (tabName === this.translate.instant('InApp Tutorials')) {
      return 0;
    } else if (tabName === this.translate.instant('Add an InApp Tutorial')) {
      return 1;
    } else if (tabName === 'add ' + this.translate.instant('Add an InApp Tutorial')) {
      return 1;
      // } else if (tabName === 'edit') {
      //   return 1;
    } else if (tabName === this.translate.instant('Cancel')) {
      return 0;
    } else if (tabName === this.translate.instant('Save')) {
      return 0;
    } else if (tabName === this.translate.instant('Save and Publish')) {
      return 0;
    } else {
      return -1;
    }
  }

  getValidTab(tabName: string): any {
    // console.log('Click tabName', tabName, this.translate.instant('InApp Tutorials'));
    if (tabName === this.translate.instant('InApp Tutorials')) {
      return true;
    } else if (tabName === this.translate.instant('Add an InApp Tutorial')) {
      return true;
    } else if (tabName === 'add ' + this.translate.instant('Add an InApp Tutorial')) {
      return true;
      // } else if (tabName === 'edit') {
      //   return true;
    } else if (tabName === this.translate.instant('Cancel')) {
      return true;
    } else if (tabName === this.translate.instant('Save')) {
      return true;
    } else if (tabName === this.translate.instant('Save and Publish')) {
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
    } else {
      return -1;
    }
  }

  checkValidation(clickEvent: any) {
    let validation: Boolean;
    let validTab: Boolean;
    validation = false;
    // console.log('Click Event', clickEvent, clickEvent.target.innerText);
    if (clickEvent && clickEvent.target) {
      validTab = this.getValidTab(clickEvent.target.innerText);
      if (validTab) {
        this.clickedTabIndex = this.getTabIndex(clickEvent.target.innerText);
        // console.log('Click clickedTabIndex', this.clickedTabIndex);
        this.selected = this.clickedTabIndex;
        if (this.clickedTabIndex === 1) {
          this.secondTab = true;
          this.selected = this.clickedTabIndex;
          this.tutorialService.setTutorialStep(this.clickedTabIndex);
        } else if (this.clickedTabIndex === 0) {
          this.selected = this.clickedTabIndex;
          this.tutorialService.setCurrentStep(this.clickedTabIndex);
          this.tutorialService.setTutorialView(null);
          this.tutorialService.setTutorialEdit(null);
        }
      }
    }
  }
}
