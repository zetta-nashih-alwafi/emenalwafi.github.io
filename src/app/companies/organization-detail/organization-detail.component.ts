import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { CoreService } from 'app/service/core/core.service';
import { Observable, of } from 'rxjs';
import { debounceTime, startWith, take, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { UserService } from 'app/service/user/user.service';
import { UsersService } from 'app/service/users/users.service';
import { UserManagementService } from '../../user-management/user-management.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { FormFillingService } from 'app/form-filling/form-filling.service';

@Component({
  selector: 'ms-organization-detail',
  templateUrl: './organization-detail.component.html',
  styleUrls: ['./organization-detail.component.scss'],
})
export class OrganizationDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  isWaitingForResponse: Boolean = true;
  toggleCardList: Boolean = false;
  dataCount = 0;
  private selectedIndex;
  organizationType = ['OPCO', 'CPF', 'Transition Pro', 'Pôle Emploi', 'Région'];
  nameFilter = new UntypedFormControl(null);
  organizationTypeFilter = new UntypedFormControl(null);
  myInnerHeight = 1920;
  currSelectedOrgId = '';
  currSelectedOrg: any;
  organizationList = [];
  tab = '';
  filteredValues = {
    organization_type: null,
    organization_name: null,
  };
  isFirstLoad = true;
  isReset = false;
  sortValue = null;
  private subs = new SubSink();
  isPermission: any;

  constructor(
    private route: ActivatedRoute,
    private pageTitleService: PageTitleService,
    private translate: TranslateService,
    private coreService: CoreService,
    private formFillingService: FormFillingService,
  ) {}

  ngOnInit() {
    this.paginator.pageIndex = 0;
    this.setupRefreshListener();
    this.route.queryParams.subscribe((query) => {
      this.sortValue = query.sortValue || null;
      // const pagination = JSON.parse(query.paginator);
      // this.paginator = Object.assign(this.paginator, pagination);
      // this.filteredValues = JSON.parse(query.filteredValues);
      this.tab = query.tab;

      if (query.organization) {
        // if param includes a user Id, fetch that single user first
        this.getOneOrganization(query.organization);
      } else {
        this.getAllOrganizations();
      }

      this.updatePageTitle();
      this.initFilter();

      this.coreService.sidenavOpen = false;
    });
  }

  setupRefreshListener() {
    // listen to changes from the children tabs on user information update
    this.subs.sink = this.formFillingService.refresh.subscribe((resp) => {
      if (resp) {
        this.getAllOrganizations();
      }
    });
  }

  updatePageTitle() {
    this.pageTitleService.setTitle(this.translate.instant('Organization Detail'));
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.pageTitleService.setTitle(this.translate.instant('Organization Detail'));
    });
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        tap(() => {
          if (!this.isFirstLoad) {
            this.getAllOrganizations();
          }
        }),
      )
      .subscribe();
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 240; //351
    return this.myInnerHeight;
  }

  getCardHeight() {
    this.myInnerHeight = window.innerHeight - 250; //340
    return this.myInnerHeight;
  }
  initFilter() {
    this.subs.sink = this.organizationTypeFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.organization_type = statusSearch === '' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAllOrganizations();
      }
    });

    this.subs.sink = this.nameFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      this.filteredValues.organization_name = statusSearch === '' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getAllOrganizations();
      }
    });
  }

  getOneOrganization(orgId: string) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.formFillingService.getOneOrganizationForCardList(orgId).subscribe(
      (org) => {
        this.isWaitingForResponse = false;
        this.organizationList.unshift(org);
        this.getAllOrganizations(true);
      },
      (error) => {
        console.log(error);
        this.isWaitingForResponse = false;
      },
    );
  }

  // Get candidate data
  getAllOrganizations(queryParamHasUserId: boolean = false) {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: 8,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.filteredValues;

    this.subs.sink = this.formFillingService.getAllOrganizations(filter, pagination, null).subscribe(
      (res) => {
        if (res && res.length) {
          if (queryParamHasUserId) {
            this.organizationList.push(res); // this will be in the form of [{}, []]
            this.organizationList = [].concat(...this.organizationList); // flatten array above with the user data fetched from param
            this.organizationList = _.uniqBy([...this.organizationList], '_id'); // make it unique by id to prevent displaying duplicates
          } else {
            this.organizationList = res;
          }
          this.organizationList = this.organizationList.filter((res) => res.name);
          if (!this.currSelectedOrgId) {
            this.currSelectedOrg = this.organizationList[0];
            this.currSelectedOrgId = this.currSelectedOrg._id || null;
          }
          this.paginator.length = res[0].count_document;
          this.dataCount = res && res.length > 0 && res[0].count_document ? res[0].count_document : 0;
        } else {
          this.organizationList = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.isFirstLoad = false;
        this.isReset = false;
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.organizationList = [];
        this.paginator.length = 0;
        this.dataCount = 0;
        this.isReset = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getStringFormatOfFilteredValue(): string {
    let filter = ``;
    filter += this.filteredValues.organization_type ? `organization_type: "${this.filteredValues.organization_type}"` : '';
    filter += this.filteredValues.organization_name ? `name: "${this.filteredValues.organization_name}"` : '';
    return filter;
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
      }
    });
    return 'filter: {' + filterQuery + '}';
  }

  updatedSelectedOrg(newSelection) {
    this.currSelectedOrgId = null;
    this.currSelectedOrgId = newSelection;
    const filteredOrg = this.organizationList.filter((item) => newSelection === item._id);
    this.currSelectedOrg = filteredOrg[0];
  }

  // resetUsers() {
  //   this.isReset = true;
  //   this.paginator.pageIndex = 0;
  //   this.filteredValues = {
  //     organization_type: null,
  //     organization_name: null,
  //   };
  //   this.organizationTypeFilter.setValue(null, { emitEvent: false });
  //   this.nameFilter.setValue(null, { emitEvent: false });
  //   this.sortValue = null;
  //   this.getAllOrganizations();
  // }

  reload(value) {
    if (value) {
      this.getAllOrganizations();
    }
  }

  loadingCommentTab(value) {
    this.isWaitingForResponse = value;
  }

  heandleReset() {
    this.isReset = true;
    this.paginator.pageIndex = 0;
    this.filteredValues = {
      organization_type: null,
      organization_name: null,
    };
    this.organizationTypeFilter.setValue(null, { emitEvent: false });
    this.nameFilter.setValue(null, { emitEvent: false });
    this.sortValue = null;
    this.getAllOrganizations();
  }
}
