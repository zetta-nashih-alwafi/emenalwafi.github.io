import { cloneDeep, uniqBy } from 'lodash';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { UserService } from 'app/service/user/user.service';
import { map, scan, startWith, take, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { ImportContractProcessDialogComponent } from 'app/shared/components/import-contract-process-dialog/import-contract-process-dialog.component';
import { AuthService } from 'app/service/auth-service/auth.service';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { UntypedFormControl } from '@angular/forms';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { MatSelect } from '@angular/material/select';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { UtilityService } from 'app/service/utility/utility.service';
import { MatOptionSelectionChange } from '@angular/material/core';
import { count } from 'console';

@Component({
  selector: 'ms-country-nationality',
  templateUrl: './country-nationality.component.html',
  styleUrls: ['./country-nationality.component.scss'],
})
export class CountryNationalityComponent implements OnInit, OnDestroy, AfterViewInit {
  private subs = new SubSink();
  isWaitingForResponse: boolean = false;
  displayedColumns: string[] = [];
  filterColumns: string[] = [];
  dataSource = new MatTableDataSource([]);
  noData: any;
  dataCount: number;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  tempDataTable = [];
  sortValue = null;
  listOfCountry = [];
  listOfNationality = [];
  originalListOfCountry = [];
  originalListOfNationality = [];
  listOfVisaPermitStatus: any[] = [];
  countryFilter = new UntypedFormControl(null);
  nationalityFilter = new UntypedFormControl(null);
  visaFilter = new UntypedFormControl(null);
  filteredValues = {
    country_ids: null,
    nationality_ids: null,
    require_visa_permits: null,
  };
  filteredValuesAll = {
    country_ids: 'All',
    nationality_ids: 'All',
    require_visa_permits: 'All',
  };
  isReset = false;

  filterBreadcrumbData: any[] = [];

  // custom column
  @ViewChild('templateColumn') templateColumnRef: MatSelect;
  columnCtrl = new UntypedFormControl(null);
  tempDraggableColumn = [];
  tempDraggableColumnFilter = [];
  currentUser;
  latestSelectedColumn;
  tempColumnListTable;
  isFirstLoad = true;
  isLoading = false;
  defaultDisplayedColumns = [
    {
      name: 'COUNTRY_NATIONALITY.COUNTRY',
      colName: 'country',
      filterName: 'countryFilter',
    },
    {
      name: 'COUNTRY_NATIONALITY.NATIONALITY',
      colName: 'nationality',
      filterName: 'nationalityFilter',
    },
    {
      name: 'COUNTRY_NATIONALITY.VISA_PERMIT',
      colName: 'visaPermit',
      filterName: 'visaPermitFilter',
    },
    {
      name: 'Action',
      colName: 'action',
      filterName: 'actionFilter',
    },
  ];
  conditionalGraphqlField = {
    country: true,
    nationality: true,
    visaPermit: true,
  };
  constructor(
    private translate: TranslateService,
    private pageTitleService: PageTitleService,
    private userService: UserService,
    private dialog: MatDialog,
    private authService: AuthService,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private utilService: UtilityService,
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getLocalStorageUser();
    this.getAllDropdownFilter(true, 'oninit');
    this.setPageTitle();
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.setPageTitle();
    });
    this.getDropdownStatic();

    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.getDropdownStatic();
      this.changeLocalizationCountryNationality();
      this.getAllCountryCodes();
    });
    this.checkTemplateTable();
  }
  getLabel(label) {
    const text = label === 'Åland Islands' ? 'Aland Islands' : label;
    return this.utilService.simplifyRegex(text?.toLowerCase());
  }
  getNationalityDropdown() {
    if (this.listOfNationality?.length) {
      this.listOfNationality = this.listOfNationality
        ?.map((country) => {
          return {
            ...country,
            label: country?.value ? this.translateNationality(country?.value) : country?.value,
          };
        })
        ?.sort((val1, val2) => {
          if (this.getLabel(val1?.label) < this.getLabel(val2?.label)) {
            return -1;
          } else if (this.getLabel(val1?.label) > this.getLabel(val2?.label)) {
            return 1;
          } else {
            return 0;
          }
        });
      this.listOfNationality = uniqBy(this.listOfNationality, 'value');
    }
    if (this.listOfCountry?.length) {
      this.listOfCountry = this.listOfCountry
        ?.map((country) => {
          return {
            ...country,
            label: country?.value && this.translateCountry(country?.value) ? this.translateCountry(country?.value) : country?.value,
          };
        })
        ?.sort((val1, val2) => {
          if (this.getLabel(val1?.label) < this.getLabel(val2?.label)) {
            return -1;
          } else if (this.getLabel(val1?.label) > this.getLabel(val2?.label)) {
            return 1;
          } else {
            return 0;
          }
        });
      this.listOfCountry = uniqBy(this.listOfCountry, 'value');
    }
  }

  getDropdownStatic() {
    this.listOfVisaPermitStatus = [
      {
        key: this.translate.instant('ERP_009_TEACHER_CONTRACT.Not Required'),
        value: false,
      },
      {
        key: this.translate.instant('ERP_009_TEACHER_CONTRACT.Required'),
        value: true,
      },
    ];
  }

  setPageTitle() {
    this.pageTitleService.setTitle(this.translate.instant('NAV.SETTINGS.COUNTRY_NATIONALITY'));
  }

  unSetPageTitleIcon() {
    this.pageTitleService.setTitle('');
    this.pageTitleService.setIcon('');
  }

  templateForImport() {
    const inputOptions = {
      ',': this.translate.instant('IMPORT_TEMPLATE_S1.COMMA'),
      ';': this.translate.instant('IMPORT_TEMPLATE_S1.SEMICOLON'),
      tab: this.translate.instant('IMPORT_TEMPLATE_S1.TAB'),
    };

    Swal.fire({
      type: 'question',
      title: this.translate.instant('IMPORT_TEMPLATE_S1.TITLE'),
      width: 465,
      allowEscapeKey: true,
      showCancelButton: true,
      cancelButtonText: this.translate.instant('IMPORT_TEMPLATE_S1.CANCEL'),
      confirmButtonText: this.translate.instant('IMPORT_TEMPLATE_S1.OK'),
      input: 'radio',
      inputValue: ';',
      inputOptions: inputOptions,
    }).then((separator) => {
      console.log(separator);
      if (separator && separator.value) {
        this.downloadCSVTemplate(separator.value);
      }
    });
  }

  downloadCSVTemplate(fileType) {
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const path = '';
    const lang = this.translate.currentLang.toLowerCase();
    let importCountryTemplate = 'downloadImportCountryTemplate';
    importCountryTemplate = importCountryTemplate + '/' + fileType + '/' + lang;
    element.href = url + importCountryTemplate + path;

    element.target = '_blank';
    element.download = 'Template Import CSV';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  csvTypeSelectionUpload() {
    const inputOptions = {
      ',': this.translate.instant('IMPORT_DECISION_S1.COMMA'),
      ';': this.translate.instant('IMPORT_DECISION_S1.SEMICOLON'),
      tab: this.translate.instant('IMPORT_DECISION_S1.TAB'),
    };

    Swal.fire({
      type: 'question',
      title: this.translate.instant('IMPORT_DECISION_S1.TITLE'),
      width: 465,
      allowEscapeKey: true,
      showCancelButton: true,
      cancelButtonText: this.translate.instant('IMPORT_DECISION_S1.CANCEL'),
      confirmButtonText: this.translate.instant('IMPORT_DECISION_S1.OK'),
      input: 'radio',
      inputOptions: inputOptions,
      inputValue: ';',
      inputValidator: (value) => {
        return new Promise((resolve, reject) => {
          if (value) {
            resolve('');
            Swal.enableConfirmButton();
          } else {
            Swal.disableConfirmButton();
            reject(this.translate.instant('IMPORT_DECISION_S1.INVALID'));
          }
        });
      },
      onOpen: function () {
        Swal.disableConfirmButton();
        Swal.getContent().addEventListener('click', function (e) {
          Swal.enableConfirmButton();
        });
        const input = Swal.getInput();
        const inputValue = input.getAttribute('value');
        if (inputValue === ';') {
          Swal.enableConfirmButton();
        }
      },
    }).then((separator) => {
      if (separator.value) {
        const fileType = separator.value;
        this.openImportDialog(fileType);
      }
    });
  }

  openImportDialog(fileType) {
    let delimeter = null;
    switch (fileType) {
      case ',':
        delimeter = ',';
        break;
      case ';':
        delimeter = ';';
        break;
      case 'tab':
        delimeter = 'tab';
        break;
      default:
        delimeter = null;
        break;
    }
    this.dialog
      .open(ImportContractProcessDialogComponent, {
        width: '500px',
        panelClass: 'certification-rule-pop-up',
        minHeight: '200px',
        disableClose: true,
        data: {
          delimeter: delimeter,
          type: 'country',
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getAllDropdownFilter(false, 'import');
        }
      });
  }

  getAllCountryCodes(from?) {
    this.isWaitingForResponse = true;

    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterData();
    this.checkConditionalGraphql();
    this.checkFilterAndSorting();
    this.subs.sink = this.userService.getAllCountries(pagination, filter, this.sortValue, this.conditionalGraphqlField).subscribe(
      (resp) => {
        if (resp && resp?.length) {
          const temp = cloneDeep(resp);
          this.tempDataTable = temp.map((data) => {
            return {
              ...data,
              label_country: this.translate.currentLang === 'fr' ? data?.country_id?.country_fr : data?.country_id?.country,
              label_nationality:
                this.translate.currentLang === 'fr' ? data?.nationality_id?.nationality_fr : data?.nationality_id?.nationality_en,
            };
          });
          this.dataSource.data = this.tempDataTable;
          this.noData = this.dataSource.connect().pipe(map((tableData) => tableData.length === 0));
          this.dataCount = this.tempDataTable?.length && this.tempDataTable[0]?.count_document ? this.tempDataTable[0]?.count_document : 0;
          this.isWaitingForResponse = false;
        } else {
          this.tempDataTable = [];
          this.dataSource.data = [];
          this.noData = this.dataSource.connect().pipe(map((tableData) => tableData.length === 0));
          this.dataCount = 0;
          this.isWaitingForResponse = false;
        }
        this.isReset = false;
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        this.isReset = false;
      },
    );
  }
  cleanFilterData() {
    const filterData = cloneDeep(this.filteredValues);
    Object.keys(filterData).forEach((key) => {
      if (!filterData[key] && filterData[key] !== false) {
        delete filterData[key];
      }
    });
    return filterData;
  }

  isAllDropdownSelected(type) {
    if (type === 'country') {
      const selected = this.countryFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listOfCountry?.length;
      return isAllSelected;
    } else if (type === 'nationality') {
      const selected = this.nationalityFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listOfNationality?.length;
      return isAllSelected;
    } else if (type === 'require_visa_permits') {
      const selected = this.visaFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.listOfVisaPermitStatus?.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if (type === 'country') {
      const selected = this.countryFilter.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.listOfCountry?.length;
      return isIndeterminate;
    } else if (type === 'nationality') {
      const selected = this.nationalityFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length !== this.listOfNationality?.length;
      return isAllSelected;
    } else if (type === 'require_visa_permits') {
      const selected = this.visaFilter.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length !== this.listOfVisaPermitStatus?.length;
      return isAllSelected;
    }
  }

  selectAllData(event, type) {
    if (type === 'country') {
      if (event.checked) {
        const data = this.listOfCountry.map((el) => el?.value);
        this.countryFilter.patchValue(data, { emitEvent: false });
      } else {
        this.countryFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'nationality') {
      if (event.checked) {
        const data = this.listOfNationality.map((el) => el?.value);
        this.nationalityFilter.patchValue(data, { emitEvent: false });
      } else {
        this.nationalityFilter.patchValue(null, { emitEvent: false });
      }
    } else if (type === 'require_visa_permits') {
      if (event.checked) {
        const data = this.listOfVisaPermitStatus.map((el) => el?.value);
        this.visaFilter.patchValue(data, { emitEvent: false });
      } else {
        this.visaFilter.patchValue(null, { emitEvent: false });
      }
    }
  }
  translateNationality(nat) {
    let text;
    if (nat) {
      text = this.translate.instant('ERP_066_NATIONALITY.' + nat);
      if (text.includes('ERP_066_NATIONALITY.')) {
        text = this.translate.instant('NATIONALITY.' + nat);
      }
    }
    return text;
  }
  transformCountry(word) {
    // to transform data country from uppercase to titlecase. Currently, the data country from be is uppercase
    if (word) {
      return word
        .split(' ')
        .map((w, index) => {
          if (
            index !== 0 &&
            (w.toLowerCase() === 'and' ||
              w.toLowerCase() === 'of' ||
              w.toLowerCase() === 'the' ||
              w.toLowerCase() === 'of)' ||
              w.toLowerCase() === 'the)' ||
              w.toLowerCase() === '(the)')
          ) {
            return w.toLowerCase();
          } else if (w.includes('(')) {
            return w[0] + w[1].toUpperCase() + w.substring(2).toLowerCase();
          } else {
            return w[0].toUpperCase() + w.substring(1).toLowerCase();
          }
        })
        .join(' ');
    }
  }
  translateCountry(country) {
    let text;
    const transformCountry = this.transformCountry(country);
    if (country) {
      if (this.translate.instant('ERP_066_COUNTRY.' + country).includes('ERP_066_COUNTRY.')) {
        if (this.translate.instant('ERP_066_COUNTRY.' + transformCountry).includes('ERP_066_COUNTRY.')) {
          let string;
          if (country.toLowerCase() === 'bolivia (plurinational state of)') {
            string = 'Bolivia (Plurinational State of)';
          } else if (country.toLowerCase() === 'cocos (keeling) islands') {
            string = 'Cocos (Keeling) Islands';
          } else if (country.toLowerCase() === 'micronesia (federated states of)') {
            string = 'Micronesia (Federated States of)';
          } else if (country.toLowerCase() === 'south georgia and the south sandwich islands') {
            string = 'South Georgia and the South Sandwich Islands';
          } else if (country.toLowerCase() === 'guinea-bissau') {
            string = 'Guinea-Bissau';
          } else if (country.toLowerCase() === 'isle of man') {
            string = 'Isle of Man';
          } else if (country.toLowerCase() === 'saint martin (french part)') {
            string = 'Saint Martin (French Part)';
          } else if (country.toLowerCase() === 'réunion') {
            string = 'Reunion';
          } else if (country.toLowerCase() === 'timor-leste') {
            string = 'Timor-Leste';
          } else if (country.toLowerCase() === 'venezuela (bolivarian republic of)') {
            string = 'Venezuela (Bolivarian Republic of)';
          } else if (country.toLowerCase() === 'saint vincent and the grenadines') {
            string = 'Saint Vincent and the Grenadines';
          } else if (country.toLowerCase() === 'united states of america') {
            string = 'United States of America';
          } else if (country.toLowerCase() === 'tanzania, united republic of') {
            string = 'Tanzania, United Republic of';
          } else if (country.toLowerCase() === "côte d'ivoire") {
            string = "Côte d'Ivoire";
          } else if (country.toLowerCase() === 'sint maarten (dutch part)') {
            string = 'Sint Maarten (Dutch part)';
          } else if (!this.translate.instant('COUNTRY.' + transformCountry).includes('COUNTRY.')) {
            string = transformCountry;
          } else {
            string = country
              .split(' ')
              .map((w) => {
                if (w.toLowerCase() === 'and') {
                  return 'and';
                } else {
                  return w[0].toUpperCase() + w.substring(1).toLowerCase();
                }
              })
              .join(' ');
          }
          text = this.translate.instant('COUNTRY.' + string);
        } else {
          text = this.translate.instant('ERP_066_COUNTRY.' + transformCountry);
        }
      } else {
        text = this.translate.instant('ERP_066_COUNTRY.' + country);
      }
    }
    return text;
  }
  getAllDropdownFilter(isLoading?, from?) {
    this.isLoading = isLoading ? true : false;
    this.isWaitingForResponse = !isLoading && from === 'import' ? true : false;
    this.subs.sink = this.userService.getAllCountriesDropdown().subscribe(
      (resp) => {
        if (resp && resp?.length) {
          const temp = cloneDeep(resp);
          this.originalListOfCountry = temp?.map((country) => {
            const country_fr = country?.country_id?.country_fr;
            const country_en = country?.country_id?.country;
            return {
              country_en,
              country_fr,
              value: country?.country_id?._id,
            };
          });

          this.originalListOfNationality = temp?.map((country) => {
            const nationality_fr = country?.nationality_id?.nationality_fr;
            const nationality_en = country?.nationality_id?.nationality_en;
            return {
              nationality_en,
              nationality_fr,
              value: country?.nationality_id?._id,
            };
          });

          this.changeLocalizationCountryNationality();
        } else {
          this.listOfCountry = [];
          this.listOfNationality = [];
          this.originalListOfCountry = [];
          this.originalListOfNationality = [];
        }
        this.isLoading = false;
        if (from === 'import' && !isLoading) {
          this.resetFilter();
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isLoading = false;
        if (from === 'import' && !isLoading) {
          this.resetFilter();
        }
      },
    );
  }
  changeLocalizationCountryNationality() {
    if (this.originalListOfCountry?.length) {
      this.listOfCountry = this.originalListOfCountry
        .map((data) => {
          return {
            ...data,
            label: this.translate.currentLang === 'fr' ? data?.country_fr : data?.country_en,
          };
        })
        ?.filter((country) => country?.label)
        ?.sort((val1, val2) => {
          if (this.getLabel(val1?.label) < this.getLabel(val2?.label)) {
            return -1;
          } else if (this.getLabel(val1?.label) > this.getLabel(val2?.label)) {
            return 1;
          } else {
            return 0;
          }
        });
      this.listOfCountry = uniqBy(this.listOfCountry, 'value');
    }else{
      this.listOfCountry = [];
    }
    if (this.originalListOfNationality?.length) {
      this.listOfNationality = this.originalListOfNationality
        .map((data) => {
          return {
            ...data,
            label: this.translate.currentLang === 'fr' ? data?.nationality_fr : data?.nationality_en,
          };
        })
        ?.filter((country) => country?.label)
        ?.sort((val1, val2) => {
          if (this.getLabel(val1?.label) < this.getLabel(val2?.label)) {
            return -1;
          } else if (this.getLabel(val1?.label) > this.getLabel(val2?.label)) {
            return 1;
          } else {
            return 0;
          }
        });
      this.listOfNationality = uniqBy(this.listOfNationality, 'value');
    }else{
      this.listOfNationality = [];
    }
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active && sort.direction ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (!this.isReset && !this.isFirstLoad) {
      this.paginator.pageIndex = 0;
      this.getAllCountryCodes('sort');
    }
  }

  resetFilter() {
    this.isReset = true;
    this.countryFilter.setValue(null, { emitEvent: false });
    this.nationalityFilter.setValue(null, { emitEvent: false });
    this.visaFilter.setValue(null, { emitEvent: false });
    this.tempDataTable = [];
    this.paginator.pageIndex = 0;
    this.sortValue = null;
    this.sort.direction = '';
    this.sort.active = '';
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.filteredValues = {
      country_ids: null,
      nationality_ids: null,
      require_visa_permits: null,
    };
    this.filterBreadcrumbData = [];
    this.tempDraggableColumn = [];
    this.tempDraggableColumnFilter = [];
    this.checkTemplateTable();
  }
  selectedCountry() {
    const isSame = JSON.stringify(this.filteredValues.country_ids) === JSON.stringify(this.countryFilter.value);
    if (isSame) {
      return;
    } else if (this.countryFilter.value?.length) {
      this.filteredValues.country_ids = this.countryFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllCountryCodes();
      }
    } else {
      if (this.filteredValues.country_ids?.length && !this.countryFilter.value?.length) {
        this.filteredValues.country_ids = this.countryFilter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllCountryCodes();
        }
      } else {
        return;
      }
    }
  }
  selectedNationality() {
    const isSame = JSON.stringify(this.filteredValues.nationality_ids) === JSON.stringify(this.nationalityFilter.value);
    if (isSame) {
      return;
    } else if (this.nationalityFilter.value?.length) {
      this.filteredValues.nationality_ids = this.nationalityFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllCountryCodes();
      }
    } else {
      if (this.filteredValues.nationality_ids?.length && !this.nationalityFilter.value?.length) {
        this.filteredValues.nationality_ids = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllCountryCodes();
        }
      } else {
        return;
      }
    }
  }
  selectedVisa() {
    const isSame = JSON.stringify(this.filteredValues.require_visa_permits) === JSON.stringify(this.visaFilter.value);
    if (isSame) {
      return;
    } else if (this.visaFilter.value?.length) {
      this.filteredValues.require_visa_permits = this.visaFilter.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllCountryCodes();
      }
    } else {
      if (this.filteredValues.require_visa_permits?.length && !this.visaFilter.value?.length) {
        this.filteredValues.require_visa_permits = this.visaFilter.value;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllCountryCodes();
        }
      } else {
        return;
      }
    }
  }
  filterBreadcrumbFormat() {
    const dropdownVisa = this.listOfVisaPermitStatus?.map((visa) => {
      return {
        ...visa,
        label: visa?.value ? 'Required' : 'Not Required',
      };
    });
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'country_ids', // name of the key in the object storing the filter
        column: 'COUNTRY_NATIONALITY.COUNTRY', // name of the column in the table or the field if super filter
        isMultiple: this.countryFilter?.value?.length === this.listOfCountry?.length ? false : true,
        filterValue: this.countryFilter?.value?.length === this.listOfCountry?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.countryFilter?.value?.length === this.listOfCountry?.length ? null : this.listOfCountry,
        filterRef: this.countryFilter,
        isSelectionInput: this.countryFilter?.value?.length === this.listOfCountry?.length ? false : true,
        displayKey: this.countryFilter?.value?.length === this.listOfCountry?.length ? null : 'label',
        savedValue: this.countryFilter?.value?.length === this.listOfCountry?.length ? null : 'value',
        noTranslate: this.countryFilter?.value?.length === this.listOfCountry?.length ? false : true,
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'nationality_ids', // name of the key in the object storing the filter
        column: 'COUNTRY_NATIONALITY.NATIONALITY', // name of the column in the table or the field if super filter
        isMultiple: this.nationalityFilter?.value?.length === this.listOfNationality?.length ? false : true,
        filterValue:
          this.nationalityFilter?.value?.length === this.listOfNationality?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.nationalityFilter?.value?.length === this.listOfNationality?.length ? null : this.listOfNationality,
        filterRef: this.nationalityFilter,
        isSelectionInput: this.nationalityFilter?.value?.length === this.listOfNationality?.length ? false : true,
        displayKey: this.nationalityFilter?.value?.length === this.listOfNationality?.length ? null : 'label',
        savedValue: this.nationalityFilter?.value?.length === this.listOfNationality?.length ? null : 'value',
        noTranslate: this.nationalityFilter?.value?.length === this.listOfNationality?.length ? false : true,
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'require_visa_permits', // name of the key in the object storing the filter
        column: 'COUNTRY_NATIONALITY.VISA_PERMIT', // name of the column in the table or the field if super filter
        isMultiple: this.visaFilter?.value?.length === this.listOfVisaPermitStatus?.length ? false : true,
        filterValue: this.visaFilter?.value?.length === this.listOfVisaPermitStatus?.length ? this.filteredValuesAll : this.filteredValues,
        filterList: this.visaFilter?.value?.length === this.listOfVisaPermitStatus?.length ? null : dropdownVisa,
        filterRef: this.visaFilter,
        isSelectionInput: this.visaFilter?.value?.length === this.listOfVisaPermitStatus?.length ? false : true,
        displayKey: this.visaFilter?.value?.length === this.listOfVisaPermitStatus?.length ? null : 'label',
        savedValue: this.visaFilter?.value?.length === this.listOfVisaPermitStatus?.length ? null : 'value',
        translationPrefix: this.visaFilter?.value?.length === this.listOfVisaPermitStatus?.length ? null : 'ERP_009_TEACHER_CONTRACT.',
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }
  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    if (filterItem) {
      this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
      this.paginator.pageIndex = 0;
      this.getAllCountryCodes();
    }
  }
  openColumnDropdown() {
    this.templateColumnRef.open();
  }

  defaultTemplateColumn() {
    this.columnCtrl.patchValue(this.defaultDisplayedColumns);
    this.updateColumn(this.defaultDisplayedColumns);
  }

  handleClose(isOpened) {
    if (!isOpened) {
      const list = this.tempColumnListTable?.map((resp) => resp?.colName);
      const isSame = list?.length === this.displayedColumns?.length ? list.every((resp) => this.displayedColumns.includes(resp)) : false;
      if (!isSame) {
        if (!this.tempColumnListTable?.length && !this.columnCtrl.value?.length) {
          this.updateColumn([]);
        } else {
          if (this.tempColumnListTable.length) {
            this.updateColumn(this.tempColumnListTable);
            this.tempColumnListTable = [];
          }
        }
      }
    }
  }
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.displayedColumns, event.previousIndex, event.currentIndex);
    moveItemInArray(this.filterColumns, event.previousIndex, event.currentIndex);

    this.tempDraggableColumn = cloneDeep(this.displayedColumns);
    this.tempDraggableColumnFilter = cloneDeep(this.filterColumns);

    const arrayType = this.utilService.checkArrayType(this.displayedColumns);
    const isArrayObj = arrayType === 'object' ? true : false;
    const columns = cloneDeep(this.displayedColumns);
    const table = {
      table_name: 'country_nationality',
      display_column: columns.map((col) => (isArrayObj ? col?.column_name : { column_name: col })),
      filter_column: cloneDeep(this.filterColumns),
    };
    this.createOrUpdateUserTableColumnSettings(table);
  }
  createOrUpdateUserTableColumnSettings(data) {
    if (data) {
      this.subs.sink = this.authService.CreateOrUpdateUserTableColumnSettings(this.currentUser?._id, data).subscribe(
        (resp) => {
          if (resp) {
            this.authService?.refreshTemplateTables(this.currentUser?._id);
          }
        },
        (err) => {
          Swal.fire({
            type: 'info',
            title: 'Warning',
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
  }
  selectionChangesColumn() {
    // *************** For stream value selection changes, and to get latest added and removed
    this.templateColumnRef.optionSelectionChanges
      .pipe(
        scan((acc: string[], change: MatOptionSelectionChange) => {
          if (change.isUserInput && change.source.value) {
            this.latestSelectedColumn = change.source.value;
          }
          // *************** Condition for checking if source selected and it was coming from user input not patchvalue or directly update from formcontrol
          if (change.source.selected && change.isUserInput) {
            return [...acc, change.source.value];
          } else {
            // *************** Condition for checking if coming from user input and doesnt have any selected data before
            if (change.isUserInput) {
              return acc.filter((entry) => entry !== change.source.value);
            } else {
              // *************** Condition for checking if directly update from formcontrol
              this.tempDraggableColumn = [];
              this.tempDraggableColumnFilter = [];
              return this.columnCtrl.value;
            }
          }
        }, []),
      )
      .subscribe((selectedValues: any) => {
        // *************** Call function for reorder column based on selected
        this.tempColumnListTable = selectedValues;
      });
  }
  updateColumn(data) {
    this.isWaitingForResponse = true;
    this.displayedColumns = [];
    this.filterColumns = [];
    // *************** Condition if when user drag column in it will store in tempDraggableColumn and this condition is for if user have done drag column
    if (this.tempDraggableColumn?.length && this.tempDraggableColumnFilter?.length && data?.length) {
      const tempDataColumn = data.map((dt) => dt.colName);
      const tempDataColumnFilter = data.map((dt) => dt.filterName);

      // *************** Condition if user remove selected column after drag column to another location
      if (this.tempDraggableColumn?.length >= data?.length) {
        let distinctDataColumn = this.tempDraggableColumn.filter((curr) => tempDataColumn.includes(curr));
        let distinctDataColumnFilter = this.tempDraggableColumnFilter.filter((curr) => tempDataColumnFilter.includes(curr));

        // if user add new column too
        const newColumn = tempDataColumn?.filter((col) => !distinctDataColumn.includes(col));
        const newColumnFilter = tempDataColumnFilter?.filter((col) => !distinctDataColumnFilter.includes(col));
        if (newColumn?.length && newColumnFilter?.length) {
          distinctDataColumn.push(...newColumn);
          distinctDataColumnFilter.push(...newColumnFilter);
        }

        const arrayType = this.utilService.checkArrayType(distinctDataColumn);
        const isArrayObj = arrayType === 'object' ? true : false;
        this.displayedColumns = distinctDataColumn?.map((col) => (isArrayObj ? col?.column_name : col));
        this.filterColumns = distinctDataColumnFilter;

        this.checkFilterAndSorting();
        this.resetFilterWhenUpdateColumn();

        this.tempDraggableColumn = cloneDeep(this.displayedColumns);
        this.tempDraggableColumnFilter = cloneDeep(this.filterColumns);
        setTimeout(() => {
          if (this.dataSource.data.length) {
            this.isWaitingForResponse = false;
          }
        }, 500);

        const columns = cloneDeep(this.displayedColumns);
        const table = {
          table_name: 'country_nationality',
          display_column: columns.map((col) => (isArrayObj ? col?.column_name : { column_name: col })),
          filter_column: cloneDeep(this.filterColumns),
        };

        this.createOrUpdateUserTableColumnSettings(table);
        this.getAllCountryCodes();
      } else if (this.tempDraggableColumn?.length < data?.length) {
        // *************** Condition if user add new column after drag column to another location

        const distinctDataColumn = tempDataColumn.filter((curr) => !this.tempDraggableColumn.includes(curr));
        const distinctDataColumnFilter = tempDataColumnFilter.filter((curr) => !this.tempDraggableColumnFilter.includes(curr));

        const arrayType = this.utilService.checkArrayType(distinctDataColumn);
        const isArrayObj = arrayType === 'object' ? true : false;

        //if user remove column too
        const currDragColumn = this.tempDraggableColumn.filter((curr) => tempDataColumn.includes(curr));
        const currDragColumnFilter = this.tempDraggableColumnFilter.filter((curr) => tempDataColumnFilter.includes(curr));
        this.displayedColumns = currDragColumn.concat(distinctDataColumn?.map((col) => (isArrayObj ? col?.column_name : col)));
        this.filterColumns = currDragColumnFilter.concat(distinctDataColumnFilter);

        this.checkFilterAndSorting();
        this.resetFilterWhenUpdateColumn();

        this.tempDraggableColumn = cloneDeep(this.displayedColumns);
        this.tempDraggableColumnFilter = cloneDeep(this.filterColumns);

        setTimeout(() => {
          if (this.dataSource.data.length) {
            this.isWaitingForResponse = false;
          }
        }, 500);

        const columns = cloneDeep(this.displayedColumns);
        const table = {
          table_name: 'country_nationality',
          display_column: columns.map((col) => (isArrayObj ? col?.column_name : { column_name: col })),
          filter_column: cloneDeep(this.filterColumns),
        };

        this.createOrUpdateUserTableColumnSettings(table);
        this.getAllCountryCodes();
      }
    } else {
      // *************** Condition if user didnt move any column it will reorder based on order stream column result
      if (data?.length) {
        data.forEach((resp) => {
          this.displayedColumns.push(resp.colName);
          this.filterColumns.push(resp.filterName);
        });

        setTimeout(() => {
          if (this.dataSource.data.length) {
            this.isWaitingForResponse = false;
          }
        }, 500);

        const arrayType = this.utilService.checkArrayType(this.displayedColumns);
        const isArrayObj = arrayType === 'object' ? true : false;
        const columns = cloneDeep(this.displayedColumns);
        const table = {
          table_name: 'country_nationality',
          display_column: columns.map((col) => (isArrayObj ? col?.column_name : { column_name: col })),
          filter_column: cloneDeep(this.filterColumns),
        };

        this.checkFilterAndSorting();
        this.resetFilterWhenUpdateColumn();

        this.createOrUpdateUserTableColumnSettings(table);
        this.getAllCountryCodes();
      } else {
        // *************** Condition if user didnt do any changes (add or remove), it will get latest update from local storage (because every updated it will saved into localstorage)
        if (!data.length && !this.columnCtrl.value.length) {
          this.displayedColumns = [];
          this.filterColumns = [];
          this.tempDraggableColumn = [];
          this.tempDraggableColumnFilter = [];

          const arrayType = this.utilService.checkArrayType(this.displayedColumns);
          const isArrayObj = arrayType === 'object' ? true : false;
          const columns = cloneDeep(this.displayedColumns);
          const table = {
            table_name: 'country_nationality',
            display_column: columns.map((col) => (isArrayObj ? col?.column_name : { column_name: col })),
            filter_column: cloneDeep(this.filterColumns),
          };

          this.checkFilterAndSorting();
          this.resetFilterWhenUpdateColumn();

          this.createOrUpdateUserTableColumnSettings(table);
          this.getAllCountryCodes();
        } else {
          const dataFromLocalStorage = JSON.parse(localStorage.getItem('templateTable'));
          const allStudentTableTemplate = dataFromLocalStorage?.find((lcl) => lcl.table_name === 'country_nationality');
          if (allStudentTableTemplate) {
            const arrayType = this.utilService.checkArrayType(allStudentTableTemplate.display_column);
            const isArrayObj = arrayType === 'object' ? true : false;
            this.displayedColumns = allStudentTableTemplate.display_column?.map((col) => (isArrayObj ? col?.column_name : col));
            this.filterColumns = allStudentTableTemplate.filter_column;
            this.tempDraggableColumn = allStudentTableTemplate.display_column?.map((col) => (isArrayObj ? col?.column_name : col));
            this.tempDraggableColumnFilter = allStudentTableTemplate.filter_column;
            this.checkFilterAndSorting();
            this.resetFilterWhenUpdateColumn();
            this.getAllCountryCodes();
            setTimeout(() => {
              if (this.dataSource.data.length) {
                this.isWaitingForResponse = false;
              }
            }, 500);
          }
        }
      }
    }
  }
  resetFilterWhenUpdateColumn() {
    this.isWaitingForResponse = true;
    this.dataSource.data = [];
    const columnSelectionVisible = this.displayedColumns.includes('select');
    if (!columnSelectionVisible) {
      this.isReset = true;
      this.paginator.pageIndex = 0;
    }
  }
  checkTemplateTable() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.authService
      .GetUserTableColumnSettings(this.currentUser?._id)
      .pipe(take(1))
      .subscribe(
        (resp) => {
          if (resp && resp?.length) {
            localStorage.setItem('templateTable', JSON.stringify(resp));
          }
          const dataFromLocalStorage = JSON.parse(localStorage.getItem('templateTable'));
          // *************** Condition for checking if from localstorage have any value, it will get from here
          if (dataFromLocalStorage?.length) {
            // *************** Check if it is have table_name for certain table
            const allStudentTableTemplate = dataFromLocalStorage.find((lcl) => lcl.table_name === 'country_nationality');
            // *************** If condition meet it will reorder based on value that stored in local storage
            if (allStudentTableTemplate) {
              const arrayType = this.utilService.checkArrayType(allStudentTableTemplate?.display_column);
              const isArrayObj = arrayType === 'object' ? true : false;
              this.displayedColumns = allStudentTableTemplate?.display_column?.map((col) => (isArrayObj ? col?.column_name : col));
              this.filterColumns = allStudentTableTemplate.filter_column;
              const filterValue = [];

              const displayColumns = allStudentTableTemplate?.display_column?.map((col) => (isArrayObj ? col?.column_name : col));
              displayColumns.forEach((resp) => {
                const findIndex = this.defaultDisplayedColumns.findIndex((def) => def.colName === resp);
                filterValue.push(this.defaultDisplayedColumns[findIndex]);
              });
              this.resetFilterWhenUpdateColumn();
              this.columnCtrl.patchValue(filterValue);
              // Get Data student
              this.getAllCountryCodes('template table');
            } else {
              // *************** If condition doesnt meet it will reorder based on default column that we have
              this.columnCtrl.patchValue(this.defaultDisplayedColumns);
              this.updateColumn(this.defaultDisplayedColumns);
            }
          } else {
            // *************** If condition doesnt meet it will reorder based on default column that we have
            this.columnCtrl.patchValue(this.defaultDisplayedColumns);
            this.updateColumn(this.defaultDisplayedColumns);
          }
          this.isFirstLoad = false;
        },
        (err) => {
          this.isFirstLoad = false;
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: 'Warning',
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
  }
  checkFilterAndSorting() {
    if (this.latestSelectedColumn) {
      if (this.defaultDisplayedColumns?.length) {
        this.defaultDisplayedColumns.forEach((col) => {
          if (!this.displayedColumns.includes(col?.colName)) {
            switch (col.colName) {
              case 'country':
                this.filteredValues.country_ids = null;
                this.latestSelectedColumn = null;
                this.filterBreadcrumbData.filter((resp) => resp.name !== 'country_ids');
                this.countryFilter.setValue(null, { emitEvent: false });

                if (this.sortValue?.country) {
                  this.sortValue = null;
                  this.sort.direction = '';
                  this.sort.active = '';
                }
                break;
              case 'nationality':
                this.filteredValues.nationality_ids = null;
                this.latestSelectedColumn = null;
                this.filterBreadcrumbData.filter((resp) => resp.name !== 'nationality_ids');
                this.nationalityFilter.setValue(null, { emitEvent: false });

                if (this.sortValue?.nationality) {
                  this.sortValue = null;
                  this.sort.direction = '';
                  this.sort.active = '';
                }
                break;
              case 'visaPermit':
                this.filteredValues.require_visa_permits = null;
                this.latestSelectedColumn = null;
                this.filterBreadcrumbData.filter((resp) => resp.name !== 'require_visa_permits');
                this.visaFilter.setValue(null, { emitEvent: false });

                if (this.sortValue?.require_visa_permit) {
                  this.sortValue = null;
                  this.sort.direction = '';
                  this.sort.active = '';
                }
                break;
              default:
                this.latestSelectedColumn = null;
                break;
            }
          }
        });
      }
    } else {
      return;
    }
  }
  checkConditionalGraphql() {
    this.conditionalGraphqlField = {
      country: false,
      nationality: false,
      visaPermit: false,
    };

    const actionFound = this.displayedColumns.includes('action');
    if (actionFound) {
      this.conditionalGraphqlField = {
        country: true,
        nationality: true,
        visaPermit: true,
      };
    } else {
      this.displayedColumns.forEach((col) => {
        if (col) {
          this.conditionalGraphqlField[col] = true;
        }
      });
    }
  }
  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset && !this.isFirstLoad) {
            this.getAllCountryCodes('afterview');
          }
        }),
      )
      .subscribe();
    this.selectionChangesColumn();
  }

  requiredOrNotRequiredVisaPermit(data, status) {
    if(data){
      const input = {
        status: status
      };
      this.isWaitingForResponse = true;
      this.subs.sink = this.userService.updateVisaPermit(data?._id, input).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if(resp){
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo'),
              confirmButtonText: this.translate.instant('OK'),
              allowOutsideClick: false,
              allowEscapeKey: false,
            }).then(()=> {
              this.getAllCountryCodes();
            })
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: 'Warning',
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      )
    }
  }

  ngOnDestroy(): void {
    this.unSetPageTitleIcon();
    this.subs.unsubscribe();
  }
}
