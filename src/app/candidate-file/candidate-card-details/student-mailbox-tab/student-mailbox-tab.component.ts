import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { CoreService } from 'app/service/core/core.service';
import { AdmissionService } from 'app/service/admission/admission.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ms-student-mailbox-tab',
  templateUrl: './student-mailbox-tab.component.html',
  styleUrls: ['./student-mailbox-tab.component.scss'],
})
export class StudentMailboxTabComponent implements OnInit, OnDestroy, OnChanges {
  @Input() candidateId;
  @Input() userData;
  @Output() loadingData: EventEmitter<boolean> = new EventEmitter();
  @Output() reload: EventEmitter<boolean> = new EventEmitter();
  private subs = new SubSink();

  selectedIndex = 0;
  userId: any;
  currentCandidate

  constructor(
    private coreService: CoreService,
    private admissionService: AdmissionService,
    private pageTitleService: PageTitleService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.updatePageTitle();
    console.log('_id', this.candidateId);

    setTimeout(() => {
      this.coreService.sidenavOpen = false;
    }, 1000);
    if (this.candidateId) {
      this.getOneUserId();
    }
  }

  updatePageTitle() {
    this.pageTitleService.setTitle(this.translate.instant('Student Card Mailbox'));
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.pageTitleService.setTitle(this.translate.instant('Student Card Mailbox'));
    });
  }

  ngOnDestroy() {}
  ngOnChanges() {
    console.log('_test !');
    this.reload.emit(true);
    if (this.candidateId) {
      this.getOneUserId();
    }
  }

  getOneUserId() {
    this.admissionService.getOneCandidateUserId(this.candidateId).subscribe((res) => {
      if (res?.user_id) {
        this.userId = res.user_id._id;
        this.currentCandidate = _.cloneDeep(res)
      }
    });
  }
}
