import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTab, MatTabGroup, MatTabHeader } from '@angular/material/tabs';
import { TranslateService } from '@ngx-translate/core';
import { RNCPTitlesService } from 'app/service/rncpTitles/rncp-titles.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { CountryService } from 'app/shared/services/country.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-user-details-parent-tabs',
  templateUrl: './user-details-parent-tabs.component.html',
  styleUrls: ['./user-details-parent-tabs.component.scss']
})
export class UserDetailsParentTabsComponent implements OnInit, AfterViewInit, OnDestroy {
selectedIndex = 0;
@Input() userId: string;
@Input() selectedUserData: any;
@Input() isTeacherList;
@Input() tab;
@ViewChild(MatTabGroup, { static: true }) tabs: MatTabGroup;
private subs = new SubSink();

  countryCodeList = [];

  constructor(private rncpTitleService: RNCPTitlesService, private translate: TranslateService, private countryService: CountryService, private utilService: UtilityService) { }

  ngOnInit() {
    this.selectedIndex = this.tab === 'details' ? 1 : 0;
    this.getAllCountryCodes();
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

  ngAfterViewInit() {
    this.tabs._handleClick = this.checkIfAnyChildrenFormInvalid.bind(this);
  }

  checkIfAnyChildrenFormInvalid(tab: MatTab, tabHeader: MatTabHeader, idx: number) {
    if (!this.rncpTitleService.childrenFormValidationStatus) {
      return this.fireUnsavedDataWarningSwal(tab, tabHeader, idx);
    }
    return true && MatTabGroup.prototype._handleClick.apply(this.tabs, [tab, tabHeader, idx]);
  }

  getAllCountryCodes() {
    this.countryCodeList = this.countryService?.getAllCountriesNationality();
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
        this.rncpTitleService.childrenFormValidationStatus = true;
        return true && MatTabGroup.prototype._handleClick.apply(this.tabs, [tab, tabHeader, idx]);
      }
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
