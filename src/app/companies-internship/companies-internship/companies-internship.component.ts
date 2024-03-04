import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, OnDestroy, AfterViewInit, AfterViewChecked, ViewChild, ChangeDetectorRef } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UtilityService } from 'app/service/utility/utility.service';
import { debounceTime, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'ms-companies-internship',
  templateUrl: './companies-internship.component.html',
  styleUrls: ['./companies-internship.component.scss'],
})
export class CompaniesInternshipComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {
  private subs = new SubSink();

  // Table Configuration
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  disabledExport = true;
  isLoading = false;
  selectType: any;
  dataCount = 0;
  noData;
  sortValue = null;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  userSelected: any[];
  userSelectedId: any[];
  isCheckedAll = false;

  displayedColumns: string[] = [
    'select',
    'name',
    'brand',
    'industry',
    'country',
    'city',
    'address',
    'connected',
    'members',
    'internshipOffer',
    'alternance',
    'professional',
    'jobOffer',
    'action',
  ];
  filterColumns: string[] = [
    'selectFilter',
    'nameFilter',
    'brandFilter',
    'industryFilter',
    'countryFilter',
    'cityFilter',
    'addressFilter',
    'connectedFilter',
    'membersFilter',
    'internshipOfferFilter',
    'alternanceFilter',
    'professionalFilter',
    'jobOfferFilter',
    'actionFilter',
  ];
  dataDummy = [
    {
      company_name: 'Kmart',
      brand: 'Kmart',
      industry: 'Everyday use',
      country: 'France',
      city: 'Paris',
      address: '05 rue des faisans',
      connected_schools: 'EFAP ICART',
      job_offer: '2',
      members_registered: '2',
      internship_offer: '2',
      alternance_offer: '5',
      professional_offer: '12',
      count_document: 3,
    },
    {
      company_name: 'Decathlon',
      brand: 'Decathlon',
      industry: 'Sport',
      country: 'France',
      city: 'Lyon',
      address: '45 rue des bois',
      connected_schools: 'BRASSARD',
      job_offer: '5',
      members_registered: '1',
      internship_offer: '2',
      alternance_offer: '9',
      professional_offer: '21',
      count_document: 3,
    },
    {
      company_name: 'Fastfood service',
      brand: 'Macdonald',
      industry: 'Food',
      country: 'France',
      city: 'Bordeaux',
      address: '39 avenue des colombes',
      connected_schools: 'EFAP',
      job_offer: '12',
      members_registered: '3',
      internship_offer: '2',
      alternance_offer: '13',
      professional_offer: '30',
      count_document: 3,
    },
  ];
  // End Configuration Table

  // Filter Configuration
  companyNameFilter = new UntypedFormControl(null);
  countryFilter = new UntypedFormControl(null);
  cityFilter = new UntypedFormControl(null);
  addressFilter = new UntypedFormControl(null);
  filteredValues = {
    company_name: '',
    country: null,
    city: null,
    address: '',
  };
  countryList = [];
  cityList = [];
  // End Filter Configuration
  constructor(
    private cdr: ChangeDetectorRef,
    private utilService: UtilityService,
    private router: Router,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.initFilter();
    this.getCompaniesData('start');
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getCompaniesData('ngAfterViewInit');
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getCompaniesData(type) {
    console.log('Load table from', type);
    this.dataSource.data = [];
    this.paginator.length = 0;
    this.dataCount = 0;
    this.isLoading = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterData();
    this.dataSource.data = this.dataDummy;
    this.paginator.length = this.dataDummy[0].count_document;
    this.dataCount = this.dataDummy[0].count_document;
    this.isLoading = false;
  }

  initFilter() {
    this.subs.sink = this.companyNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        if (statusSearch.length < 3) {
          return;
        } else if (statusSearch === '') {
          this.companyNameFilter.setValue('');
          this.filteredValues.company_name = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getCompaniesData('companyNameFilter 1');
          }
        }
        this.filteredValues.company_name = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCompaniesData('companyNameFilter 2');
        }
      } else {
        this.companyNameFilter.setValue('');
        this.filteredValues.company_name = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCompaniesData('companyNameFilter 3');
        }
      }
    });

    this.subs.sink = this.addressFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        if (statusSearch.length < 3) {
          return;
        } else if (statusSearch === '') {
          this.addressFilter.setValue('');
          this.filteredValues.address = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getCompaniesData('addressFilter 1');
          }
        }
        this.filteredValues.address = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCompaniesData('addressFilter 2');
        }
      } else {
        this.addressFilter.setValue('');
        this.filteredValues.address = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCompaniesData('addressFilter 3');
        }
      }
    });

    this.subs.sink = this.countryFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.country = statusSearch === '' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCompaniesData('countryFilter');
      }
    });

    this.subs.sink = this.cityFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.city = statusSearch === '' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCompaniesData('cityFilter');
      }
    });
  }

  resetTable() {
    this.selection.clear();
    this.isReset = true;
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.filteredValues = {
      company_name: '',
      country: null,
      city: null,
      address: '',
    };
    this.companyNameFilter.setValue(null);
    this.countryFilter.setValue(null);
    this.cityFilter.setValue(null);
    this.addressFilter.setValue(null);
    this.userSelected = [];
    this.userSelectedId = [];
    this.selectType = '';
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.getCompaniesData('resetTable');
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCompaniesData('Sort');
      }
    }
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
      }
    });
    return 'filter: {' + filterQuery + '}';
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.isCheckedAll = false;
    } else {
      this.isCheckedAll = true;
      this.dataSource.data.forEach((row) => this.selection.select(row));
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  showOptions(info) {
    const numSelected = this.selection.selected.length;
    if (numSelected > 0) {
      this.disabledExport = false;
    } else {
      this.disabledExport = true;
    }
    this.userSelected = [];
    this.userSelectedId = [];
    this.selectType = info;
    const data = this.selection.selected;
    data.forEach((user) => {
      this.userSelected.push(user);
      this.userSelectedId.push(user._id);
    });
  }

  viewProfileInfo(profileId, tab?) {
    const query = {
      selectedProfile: '5ffdab2d9ac26d65aa9d1dbd',
      tab: tab ? tab : '',
    };
    const url = this.router.createUrlTree(['company-file'], { queryParams: query });
    window.open(url.toString(), '_blank');
  }

  createCompany() {
    window.open('./company-creation/create', '_blank');
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
