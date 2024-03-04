import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { startWith } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from 'app/service/auth-service/auth.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-school',
  templateUrl: './school.component.html',
  styleUrls: ['./school.component.scss'],
})
export class SchoolComponent implements OnInit, OnDestroy {
  searchForm = new UntypedFormControl('');
  private subs = new SubSink();
  currentUser;
  listSchoolCards = [];
  listBlackSchool = [];
  isWaitingForResponse = false;
  tabIndex = 0;
  fromBlackCard = false;
  isPermission: string[];
  currentUserTypeId: any;
  filteredValue = { search: '' };
  filterBreadcrumbData = [];

  constructor(
    private intakeService: IntakeChannelService,
    private utilService: UtilityService,
    private translate: TranslateService,
    private authService: AuthService,
    private router: Router,
    public permission: PermissionService,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private pageTitleService: PageTitleService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.getAllSchools();
    this.initForm();
    this.pageTitleService.setTitle('INTAKE_CHANNEL.PAGE_TITLE.Schools');
  }

  getAllSchools() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.intakeService.GetAllSchools(this.currentUserTypeId).subscribe(
      (resp) => {
        this.listSchoolCards = [];
        this.listBlackSchool = [];
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          resp.forEach((element, idx) => {
            if (element.short_name) {
              resp[idx].short_name = element.short_name.toLowerCase();
            }
          });
          // resp = _.uniqBy(resp, 'name');
          this.listSchoolCards = _.cloneDeep(resp);
          this.listBlackSchool = _.cloneDeep(resp);
        }
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.listSchoolCards = [];
        this.listBlackSchool = [];
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
      this.filteredValue.search = searchString;
      setTimeout(() => {
        if (this.fromBlackCard) {
          this.tabIndex = 0;
        }
        this.listSchoolCards = this.listBlackSchool.filter((school) => {
          if (school.short_name) {
            return (
              this.utilService
                .simpleDiacriticSensitiveRegex(school.short_name)
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

  schoolDetail(_id?) {
    const url = '/schools/school-detail';
    if (_id) {
      const urls = this.router.createUrlTree([url + '/' + _id]);
      window.open(urls.toString(), '_blank');
    } else {
      const urls = this.router.createUrlTree([url]);
      window.open(urls.toString(), '_blank');
    }
  }

  getFontSize(titleShortName: string) {
    return 26;
  }

  filterBlackCard(schoolSelected: string) {
    if (schoolSelected === 'all' || schoolSelected === '' || schoolSelected === 'All' || schoolSelected === 'Tous') {
      this.listSchoolCards = this.listBlackSchool;
      this.fromBlackCard = false;
    } else {
      this.listSchoolCards = this.listBlackSchool.filter((school) => school.short_name.toLowerCase() === schoolSelected.toLowerCase());
      this.fromBlackCard = true;
    }
    if (this.fromBlackCard) {
      this.searchForm.patchValue('', { emitEvent: false });
    }
    console.log('schoolSelected', schoolSelected, this.listSchoolCards, this.listBlackSchool);
  }

  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'super_filter', // type of filter super_filter | table_filter | action_filter
        name: 'search', // name of the key in the object storing the filter
        column: 'Search by name', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValue, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
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
    this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, this.filteredValue);
    this.searchForm.setValue('');
  }

  resetSearch() {
    this.tabIndex = 0;
    this.filteredValue.search = '';
    this.filterBreadcrumbData = [];
    this.searchForm.patchValue('');
    this.listSchoolCards = this.listBlackSchool;
  }
}
