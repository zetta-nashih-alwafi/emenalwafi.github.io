import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UtilityService } from 'app/service/utility/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'ms-student-new-contacts-tab',
  templateUrl: './student-new-contacts-tab.component.html',
  styleUrls: ['./student-new-contacts-tab.component.scss']
})
export class StudentNewContactsTabComponent implements OnInit, OnDestroy {
  @Input() candidate;
  @Input() countryCodeList;
  @Input() showFinacment;
  @Output() reloadDataParent: EventEmitter<boolean> = new EventEmitter();
  private subs = new SubSink();

  constructor(private utilService: UtilityService, private translate: TranslateService) { }

  ngOnInit(): void {
    this.subs.sink = this.translate.onLangChange.subscribe(() => {
      this.sortCountryCode();
    })
  }

  sortCountryCode() {
    this.countryCodeList = this.countryCodeList.sort((firstData, secondData) => {
      if (this.utilService.simplifyRegex(this.translate.instant(firstData?.name)) < this.utilService.simplifyRegex(this.translate.instant(secondData?.name))) {
        return -1;
      } else if (this.utilService.simplifyRegex(this.translate.instant(firstData?.name)) > this.utilService.simplifyRegex(this.translate.instant(secondData?.name))) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  reload(value) {
    if (value) {
      this.reloadDataParent.emit(value);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
