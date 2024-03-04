import { FilterBreadCrumbItem } from './../../models/bread-crumb-filter.model';
import { FilterBreadCrumbInput } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { debounceTime, startWith } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from 'app/service/auth-service/auth.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-campus',
  templateUrl: './campus.component.html',
  styleUrls: ['./campus.component.scss'],
})
export class CampusComponent implements OnInit, OnDestroy {
  searchForm = new UntypedFormControl('');
  private subs = new SubSink();
  currentUser;
  listCampusCards = [];
  listBlackCampus = [];
  isWaitingForResponse = false;
  tabIndex = 0;
  filteredValues = {
    scholar_season_id: null,
    school_id: null,
  };
  fromBlackCard = false;
  filterBreadcrumbData = [];

  constructor(
    private intakeChannelService: IntakeChannelService,
    private utilService: UtilityService,
    private translate: TranslateService,
    private route: Router,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private authService: AuthService,
    private pageTitleService: PageTitleService
  ) {}

  ngOnInit() {
    this.currentUser = this.utilService.getCurrentUser();
    this.getAllCampus();
    this.initForm();
    this.pageTitleService.setTitle('INTAKE_CHANNEL.PAGE_TITLE.Campus');
  }

  getAllCampus() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.intakeChannelService.GetAllCampuses(this.filteredValues).subscribe(
      (resp) => {
        this.listCampusCards = [];
        this.listBlackCampus = [];
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          resp.forEach((element, idx) => {
            if (element.name) {
              resp[idx].name = element.name.toLowerCase();
            }
            if (element.sites && element.sites.length) {
              element.sites.forEach((site, idxSite) => {
                if (site.is_main_address) {
                  const address = element.sites[idxSite].site_id.name;
                  resp[idx].site_name = address;
                }
              });
            }
          });
          // resp = _.uniqBy(resp, 'name');
          this.listCampusCards = _.cloneDeep(resp);
          this.listBlackCampus = _.cloneDeep(resp);
        }
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.listCampusCards = [];
        this.listBlackCampus = [];
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

  initForm() {
    this.subs.sink = this.searchForm.valueChanges.pipe(startWith('')).subscribe((searchString: string) => {
      setTimeout(() => {
        if (this.fromBlackCard) {
          this.tabIndex = 0;
        }
        this.listCampusCards = this.listBlackCampus.filter((campus) => {
          if (campus.name) {
            return (
              this.utilService
                .simpleDiacriticSensitiveRegex(campus.name)
                .toLowerCase()
                .indexOf(this.utilService.simpleDiacriticSensitiveRegex(searchString).toLowerCase().trim()) !== -1
            );
          } else {
            return false;
          }
        });
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
      }, 500);
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
  goToCampus(data) {
    this.route.navigate([`/campus/campus-form/${data._id}`]);
  }

  addCampus() {
    this.route.navigate([`/campus/campus-form`]);
  }

  getFontSize(titleShortName: string) {
    return 26;
  }

  filterBlackCard(schoolSelected: string) {
    if (schoolSelected === 'all' || schoolSelected === '' || schoolSelected === 'All' || schoolSelected === 'Tous') {
      this.listCampusCards = this.listBlackCampus;
      this.fromBlackCard = false;
    } else {
      this.listCampusCards = this.listBlackCampus.filter((campus) =>
        campus.name.toLowerCase().trim().includes(schoolSelected.toLowerCase()),
      );
      this.fromBlackCard = true;
    }
    if (this.fromBlackCard) {
      this.searchForm.patchValue('', { emitEvent: false });
      this.filterBreadcrumbData = [];
    }
    console.log('schoolSelected', schoolSelected, this.listCampusCards, this.listBlackCampus);
  }

  resetSearch() {
    this.tabIndex = 0;
    this.filteredValues = {
      scholar_season_id: null,
      school_id: null,
    };
    this.searchForm.patchValue('');
    this.listCampusCards = this.listBlackCampus;
    this.filterBreadcrumbData = [];
  }
  filterBreadcrumbFormat() {
    const filterCampus = this.searchForm.value;
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: null, // name of the key in the object storing the filter
        column: 'Search by name', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: filterCampus, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.searchForm, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }
  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    if (filterItem) {
      this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, null, null, true);
    }
  }
}
