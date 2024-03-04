import { UtilityService } from 'app/service/utility/utility.service';
import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AdmissionEntrypointService } from 'app/service/admission-entrypoint/admission-entrypoint.service';
import { FinancesService } from 'app/service/finance/finance.service';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { ActivatedRoute } from '@angular/router';
import { ExportCsvService } from 'app/service/export-csv/export-csv.service';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import { SelectionModel } from '@angular/cdk/collections';
import { AuthService } from 'app/service/auth-service/auth.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';

@Component({
  selector: 'ms-registration-profile',
  templateUrl: './registration-profile.component.html',
  styleUrls: ['./registration-profile.component.scss'],
})
export class RegistrationProfileComponent implements OnInit, OnDestroy, AfterViewInit {
  intakeChannelCount;
  dataSource = new MatTableDataSource([]);
  titleData: any;
  noData: any;
  displayedColumns: string[] = [
    'select',
    'registrationProfile',
    'description',
    'discount',
    'downPayment',
    'paymentMode',
    'additionalCosts',
    'action',
  ];
  filterColumns: string[] = [
    'selectFilter',
    'registrationProfileFilter',
    'descriptionFilter',
    'discountFilter',
    'downPaymentFilter',
    'paymentModeFilter',
    'additionalCostsFilter',
    'actionFilter',
  ];
  filteredValues = {
    name: '',
    description: '',
    payment_mode: '',
    scholar_season_id: '',
  };

  showForm: Boolean = false;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  sortValue = null;
  scholarId: any;
  registrationProfileCount;
  isWaitingForResponse = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  selection = new SelectionModel<any>(true, []);
  isCheckedAll = false;
  disabledExport = true;
  userSelected = [];
  userSelectedId = [];
  selectType;
  isLoading: Boolean = false;
  dataCount = 0;
  private subs = new SubSink();
  editData: any;

  registrationProfileFilter = new UntypedFormControl('');
  discountFilter = new UntypedFormControl('');
  descriptionFilter = new UntypedFormControl('');
  private timeOutVal: any;

  allInternshipId = [];
  exportName: string;
  scholarSeasons: string;
  dataSelected = [];
  pageSelected = [];
  allStudentForCheckbox = [];
  dataUnselectUser = [];
  allExportForCheckbox = [];
  filterBreadcrumbData = [];
  currentUserTypeId: any;

  @Input('scholarSeasonId') set selectedScholarSeasonID(value) {
    this.filteredValues.scholar_season_id = value || null;
    this.scholarId = value || null;
  }
  constructor(
    private financeService: FinancesService,
    private exportCsvService: ExportCsvService,
    private translateService: TranslateService,
    private pageTitleService: PageTitleService,
    private utilityService: UtilityService,
    private userService: AuthService,
    public permission: PermissionService,
    private httpClient: HttpClient,
    private filterBreadCrumbService: FilterBreadcrumbService,
  ) {}

  ngOnInit() {
    const currentUser = this.userService.getLocalStorageUser();
    const isPermission = this.userService.getPermission();
    const currentUserEntity = currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

    this.initFilter();
    this.getRegistrationProfileData();
    this.pageTitleService.setTitle(
      this.translateService.instant('INTAKE_CHANNEL.PAGE_TITLE.Settings') +
        ' - ' +
        this.translateService.instant('INTAKE_CHANNEL.SETTINGS.Registration profile'),
    );
    this.subs.sink = this.translateService.onLangChange.subscribe(() => {
      this.pageTitleService.setTitle(
        this.translateService.instant('INTAKE_CHANNEL.PAGE_TITLE.Settings') +
          ' - ' +
          this.translateService.instant('INTAKE_CHANNEL.SETTINGS.Registration profile'),
      );
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getRegistrationProfileData() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterData();
    this.subs.sink = this.financeService.GetAllProfilRates(pagination, this.sortValue, filter).subscribe(
      (registrationProfile: any) => {
        if (registrationProfile && registrationProfile.length) {
          this.dataSource.data = registrationProfile;
          this.paginator.length = registrationProfile[0].count_document;
          this.dataCount = registrationProfile[0].count_document;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.disabledExport = true;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
      },
      (err) => {
        // Record error log
        this.userService.postErrorLog(err);
        this.disabledExport = true;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.userService.handlerSessionExpired();
          return;
        } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translateService.instant('BAD_CONNECTION.Title'),
            html: this.translateService.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translateService.instant('SORRY'),
            text: err && err['message'] ? this.translateService.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getRegistrationProfileData();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.selection.clear();
      this.dataSelected = [];
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
      this.isCheckedAll = false;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getRegistrationProfileData();
      }
    }
  }

  resetTable() {
    this.isReset = true;
    this.selection.clear();
    this.dataSelected = [];
    this.pageSelected = [];
    this.isCheckedAll = false;
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });

    this.filteredValues = {
      name: '',
      description: '',
      payment_mode: '',
      scholar_season_id: this.scholarId,
    };

    this.disabledExport = true;
    this.registrationProfileFilter.setValue(null);
    this.descriptionFilter.setValue(null);
    this.discountFilter.setValue(null);
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.filterBreadcrumbData = [];
    this.getRegistrationProfileData();
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

  initFilter() {
    this.subs.sink = this.registrationProfileFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      // const symbol = /[()|{}\[\]:;<>?,\/]/;
      // const symbol1 = /\\/;
      // if (statusSearch !== null && !statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
      if (statusSearch !== null) {
        if (statusSearch === '') {
          this.registrationProfileFilter.setValue(null);
          this.filteredValues.name = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getRegistrationProfileData();
          }
        }
        this.filteredValues.name = statusSearch ? statusSearch : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getRegistrationProfileData();
        }
      } else {
        if (statusSearch !== null) {
          this.registrationProfileFilter.setValue(null);
          this.filteredValues.name = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getRegistrationProfileData();
          }
        }
      }
    });
    this.subs.sink = this.descriptionFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (statusSearch !== null && !statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        if (statusSearch === '') {
          this.descriptionFilter.setValue(null);
          this.filteredValues.description = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getRegistrationProfileData();
          }
        }
        this.filteredValues.description = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getRegistrationProfileData();
        }
      } else {
        if (statusSearch !== null) {
          this.descriptionFilter.setValue(null);
          this.filteredValues.description = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getRegistrationProfileData();
          }
        }
      }
    });
  }

  renderTooltipEntity(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    if (entities && entities.length) {
      for (const entity of entities) {
        count++;
        if (count > 1) {
          if (entity.name) {
            tooltip = tooltip + ', ';
            tooltip = tooltip + entity.name;
          }
        } else {
          if (entity.name) {
            tooltip = tooltip + entity.name;
          }
        }
      }
    }
    return tooltip;
  }

  renderTooltipEntityProgram(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    if (entities && entities.length) {
      for (const entity of entities) {
        count++;
        if (count > 1) {
          if (entity && entity.program) {
            tooltip = tooltip + ', ';
            tooltip = tooltip + entity.program;
          }
        } else {
          if (entity) {
            tooltip = tooltip + entity.program;
          }
        }
      }
    }
    return tooltip;
  }

  renderTooltipEntityAdditional(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    if (entities && entities.length) {
      for (const entity of entities) {
        count++;
        if (count > 1) {
          if (entity.additional_cost) {
            tooltip = tooltip + ', ';
            tooltip = tooltip + entity.additional_cost;
          }
        } else {
          if (entity.additional_cost) {
            tooltip = tooltip + entity.additional_cost;
          }
        }
      }
    }
    return tooltip;
  }

  addProfileRateDialog() {
    this.showForm = !this.showForm;
    this.editData = null;
  }

  editProfileRateDialog() {
    // this.subs.sink = this.dialog
    //   .open(AddAdditionalCostsDialogComponent, {
    //     width: '600px',
    //     minHeight: '100px',
    //     disableClose: true,
    //     data: data,
    //   })
    //   .afterClosed()
    //   .subscribe((resp) => {
    //     this.getRegistrationProfileData();
    //   });
  }

  deleteProfileRate(data) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translateService.instant('REGPRO_S1.Title'),
      html: this.translateService.instant('REGPRO_S1.Text', {
        name: data.name ? data.name : '',
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('REGPRO_S1.Button1', { timer: timeDisabled }),
      cancelButtonText: this.translateService.instant('REGPRO_S1.Button2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translateService.instant('REGPRO_S1.Button1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translateService.instant('REGPRO_S1.Button1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.subs.sink = this.financeService.DeleteProfilRate(data._id).subscribe(
          (resp) => {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.getRegistrationProfileData();
            });
          },
          (error) => {
            // Record error log
            this.userService.postErrorLog(error);
            if (error['message'] === 'GraphQL error: Registration profile already assigned to student.') {
              Swal.fire({
                type: 'info',
                title: this.translateService.instant('REGPRO_S1b.Title'),
                html: this.translateService.instant('REGPRO_S1b.Text'),
                confirmButtonText: this.translateService.instant('REGPRO_S1b.Button1'),
              });
            } else if (error['message'] === 'GraphQL error: Registration profile already used in program.') {
              Swal.fire({
                type: 'info',
                title: this.translateService.instant('REGPRO_S1a.Title'),
                html: this.translateService.instant('REGPRO_S1a.Text'),
                confirmButtonText: this.translateService.instant('REGPRO_S1a.Button1'),
              });
            } else if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
              Swal.fire({
                type: 'warning',
                title: this.translateService.instant('BAD_CONNECTION.Title'),
                html: this.translateService.instant('BAD_CONNECTION.Text'),
                confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
                allowOutsideClick: false,
                allowEnterKey: false,
                allowEscapeKey: false,
              });
            } else {
              Swal.fire({
                type: 'info',
                title: this.translateService.instant('SORRY'),
                text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translateService.instant('OK'),
              });
            }
          },
        );
      }
    });
  }

  onOpenRegistrationProfileDialog(data?) {
    this.showForm = true;
    this.editData = {
      selectedData: data,
      isEdit: true,
    };
  }

  onDataExport() {
    if (this.selectType === 'one') {
      const data = [];
      if (this.selection.selected.length) {
        for (const item of this.selection.selected) {
          let paymentMode = '';
          let programs = '';
          let additionalCosts = '';
          if (item.payment_modes && item.payment_modes.length) {
            for (const entity of item.payment_modes) {
              paymentMode = paymentMode ? paymentMode + ', ' + (entity.name ? entity.name : '') : entity.name ? entity.name : '';
            }
          }
          if (item.additional_cost_ids && item.additional_cost_ids.length) {
            for (const entity of item.additional_cost_ids) {
              additionalCosts = additionalCosts
                ? additionalCosts + ', ' + (entity.additional_cost ? entity.additional_cost : '')
                : entity.additional_cost
                ? entity.additional_cost
                : '';
            }
          }
          if (item.programs && item.programs.length) {
            for (const entity of item.programs) {
              programs = programs ? programs + ', ' + (entity.program ? entity.program : '') : entity.program ? entity.program : '';
            }
          }
          const obj = [];
          obj[0] = item.name;
          obj[1] = item.description;
          obj[2] = item.discount_on_full_rate ? item.discount_on_full_rate + '%' : '0%';
          obj[3] = item.is_down_payment ? this.translateService.instant(item.is_down_payment) : '-';
          obj[4] = paymentMode ? paymentMode : '-';
          obj[5] = additionalCosts ? additionalCosts : '-';
          obj[6] = programs ? programs : '-';
          data.push(obj);
        }
        const valueRange = { values: data };
        const today = moment().format('DD-MM-YYYY');
        const sheetID = this.translateService.currentLang === 'en' ? 0 : 2108479967;
        const title = this.exportName + '_' + today;
        const sheetData = {
          spreadsheetId: '16SdeqCX7O2A4U1q_dIshtuFQ4H_4FQ2Tv7xT4K2AJVo',
          sheetId: sheetID,
          range: 'A7',
        };
        this.exportCsvService.createAndUpdateSpreadsheet(valueRange, title, sheetData);
      }
      Swal.close();
    } else {
      this.getAllExportData(0);
    }
  }

  getAllExportData(pageNumber: number) {
    this.isLoading = true;
    const pagination = {
      limit: 500,
      page: pageNumber,
    };
    const filter = this.cleanFilterData();
    this.subs.sink = this.financeService.GetAllProfilRates(pagination, this.sortValue, filter).subscribe(
      (res: any) => {
        if (res && res.length) {
          this.allInternshipId.push(...res);
          const pages = pageNumber + 1;
          this.getAllExportData(pages);
        } else {
          this.isLoading = false;
          this.exportAllData(this.allInternshipId);
        }
      },
      (error) => {
        // Record error log
        this.userService.postErrorLog(error);
        this.isLoading = false;
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translateService.instant('BAD_CONNECTION.Title'),
            html: this.translateService.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translateService.instant('SORRY'),
            text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );
  }

  exportAllData(exportData) {
    const datasForExport = _.uniqBy(exportData, '_id');
    const data = [];
    if (datasForExport && datasForExport.length) {
      for (const item of datasForExport) {
        let paymentMode = '';
        let programs = '';
        let additionalCosts = '';
        if (item.payment_modes && item.payment_modes.length) {
          for (const entity of item.payment_modes) {
            paymentMode = paymentMode ? paymentMode + ', ' + (entity.name ? entity.name : '') : entity.name ? entity.name : '';
          }
        }
        if (item.additional_cost_ids && item.additional_cost_ids.length) {
          for (const entity of item.additional_cost_ids) {
            additionalCosts = additionalCosts
              ? additionalCosts + ', ' + (entity.additional_cost ? entity.additional_cost : '')
              : entity.additional_cost
              ? entity.additional_cost
              : '';
          }
        }
        if (item.programs && item.programs.length) {
          for (const entity of item.programs) {
            programs = programs ? programs + ', ' + (entity.program ? entity.program : '') : entity.program ? entity.program : '';
          }
        }
        const obj = [];
        obj[0] = item.name;
        obj[1] = item.description;
        obj[2] = item.discount_on_full_rate ? item.discount_on_full_rate + '%' : '0%';
        obj[3] = item.is_down_payment ? this.translateService.instant(item.is_down_payment) : '-';
        obj[4] = paymentMode ? paymentMode : '-';
        obj[5] = additionalCosts ? additionalCosts : '-';
        obj[6] = programs ? programs : '-';
        data.push(obj);
      }
      const valueRange = { values: data };
      const today = moment().format('DD-MM-YYYY');
      const sheetID = this.translateService.currentLang === 'en' ? 0 : 2108479967;
      const title = this.exportName + '_' + today;
      const sheetData = {
        spreadsheetId: '16SdeqCX7O2A4U1q_dIshtuFQ4H_4FQ2Tv7xT4K2AJVo',
        sheetId: sheetID,
        range: 'A7',
      };
      this.exportCsvService.createAndUpdateSpreadsheet(valueRange, title, sheetData);
    }
    Swal.close();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return this.isCheckedAll ? true : (numSelected === numRows || numSelected > numRows);
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected() || (this.isCheckedAll && this.dataUnselectUser.length)) {
      this.selection.clear();
      this.dataSelected = [];
      this.pageSelected = [];
      this.isCheckedAll = false;
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.allStudentForCheckbox = [];
      this.isCheckedAll = true;
      // this.getDataAllForCheckbox(0);
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
      this.dataSource.data.forEach((row) => {
        if (!this.dataUnselectUser.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
    }
  }

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.isWaitingForResponse = true;
    const filter = this.cleanFilterData();
    this.subs.sink = this.financeService.GetAllProfilRates(pagination, this.sortValue, filter).subscribe(
      (registrationProfile) => {
        if (registrationProfile && registrationProfile.length) {
          this.allStudentForCheckbox.push(...registrationProfile);
          const page = pageNumber + 1;
          this.getDataAllForCheckbox(page);
        } else {
          this.isWaitingForResponse = false;
          if (this.isCheckedAll) {
            if (this.allStudentForCheckbox && this.allStudentForCheckbox.length) {
              this.allStudentForCheckbox.forEach((element) => {
                this.selection.select(element._id);
                this.dataSelected.push(element);
              });
            }
            this.pageSelected.push(this.paginator.pageIndex);
          } else {
            this.pageSelected = [];
          }
        }
      },
      (error) => {
        // Record error log
        this.userService.postErrorLog(error);
        this.isWaitingForResponse = false;
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translateService.instant('BAD_CONNECTION.Title'),
            html: this.translateService.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translateService.instant('SORRY'),
            text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translateService.instant('OK'),
          });
        }
      },
    );
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  showOptions(info, row) {
    if (this.isCheckedAll) {
      if (row) {
        if (!this.dataUnselectUser.includes(row._id)) {
          this.dataUnselectUser.push(row._id);
          this.selection.deselect(row._id);
        } else {
          const indx = this.dataUnselectUser.findIndex((list) => list === row._id);
          this.dataUnselectUser.splice(indx, 1);
          this.selection.select(row._id);
        }
      }
    } else {
      if (row) {
        if (this.dataSelected && this.dataSelected.length) {
          const dataFilter = this.dataSelected.filter((resp) => resp._id === row._id);
          if (dataFilter && dataFilter.length < 1) {
            this.dataSelected.push(row);
          } else {
            const indexFilter = this.dataSelected.findIndex((resp) => resp._id === row._id);
            this.dataSelected.splice(indexFilter, 1);
          }
        } else {
          this.dataSelected.push(row);
        }
      }
    }
    const numSelected = this.selection.selected.length;
    if (numSelected > 0) {
      this.disabledExport = false;
    } else {
      this.disabledExport = true;
    }
    this.userSelected = [];
    this.userSelectedId = [];
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    data.forEach((user) => {
      this.userSelected.push(user);
      this.userSelectedId.push(user._id);
    });
  }
  getDataAllForCheckboxExport(pageNumber) {
    if (this.isCheckedAll) {
      if (this.dataUnselectUser.length < 1) {
        this.downloadCSV();
      } else {
        if (pageNumber === 0) {
          this.allExportForCheckbox = [];
          this.dataSelected = [];
        }
        const pagination = {
          limit: 500,
          page: pageNumber,
        };
        this.isLoading = true;
        const filter = this.cleanFilterData();
        this.subs.sink = this.financeService.getAllProfilRatesIdForExport(pagination, this.sortValue, filter).subscribe(
          (registrationProfile) => {
            if (registrationProfile && registrationProfile.length) {
              this.allExportForCheckbox.push(...registrationProfile);
              const page = pageNumber + 1;
              this.getDataAllForCheckboxExport(page);
            } else {
              this.isLoading = false;
              if (this.isCheckedAll) {
                if (this.allExportForCheckbox && this.allExportForCheckbox.length) {
                  this.dataSelected = this.allExportForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  this.downloadCSV();
                }
              }
            }
          },
          (error) => {
            this.isLoading = false;
            if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
              Swal.fire({
                type: 'warning',
                title: this.translateService.instant('BAD_CONNECTION.Title'),
                html: this.translateService.instant('BAD_CONNECTION.Text'),
                confirmButtonText: this.translateService.instant('BAD_CONNECTION.Button'),
                allowOutsideClick: false,
                allowEnterKey: false,
                allowEscapeKey: false,
              });
            } else {
              Swal.fire({
                type: 'info',
                title: this.translateService.instant('SORRY'),
                text: error && error['message'] ? this.translateService.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
                confirmButtonText: this.translateService.instant('OK'),
              });
            }
          },
        );
      }
    } else {
      this.downloadCSV();
    }
  }

  downloadCSV() {
    if (!this.dataSelected.length && (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser.length))) {
      Swal.fire({
        type: 'info',
        title: this.translateService.instant('Followup_S8.Title'),
        html: this.translateService.instant('Followup_S8.Text', { menu: this.translateService.instant('Registration Profile') }),
        confirmButtonText: this.translateService.instant('Followup_S8.Button'),
      });
      return;
    } else {
      const inputOptions = {
        ',': this.translateService.instant('IMPORT_DECISION_S1.COMMA'),
        ';': this.translateService.instant('IMPORT_DECISION_S1.SEMICOLON'),
        tab: this.translateService.instant('IMPORT_DECISION_S1.TAB'),
      };
      Swal.fire({
        type: 'question',
        title: this.translateService.instant('IMPORT_DECISION_S1.TITLE'),
        width: 465,
        allowEscapeKey: true,
        showCancelButton: true,
        cancelButtonText: this.translateService.instant('IMPORT_DECISION_S1.CANCEL'),
        confirmButtonText: this.translateService.instant('IMPORT_DECISION_S1.OK'),
        input: 'radio',
        inputOptions: inputOptions,
        inputValue: this.translateService && this.translateService.currentLang === 'fr' ? ';' : '',
        inputValidator: (value) => {
          return new Promise((resolve, reject) => {
            if (value) {
              resolve('');
              Swal.enableConfirmButton();
            } else {
              Swal.disableConfirmButton();
              reject(this.translateService.instant('IMPORT_DECISION_S1.INVALID'));
            }
          });
        },
        onOpen: function () {
          Swal.disableConfirmButton();
          Swal.getContent().addEventListener('click', function () {
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
          this.openDownloadCsv(fileType);
        }
      });
    }
  }

  openDownloadCsv(fileType) {
    let url = environment.apiUrl;
    url = url.replace('graphql', '');
    const element = document.createElement('a');
    const lang = this.translateService.currentLang.toLowerCase();
    const importStudentTemlate = `downloadProfilRateCSV/`;
    const filter = this.cleanFilterDataCSV();
    console.log('_ini filter', this.dataSelected.length);
    let filtered;
    if (
      this.dataSelected.length &&
      (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser.length && this.dataSelected.length))
    ) {
      const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      const billing = `"profil_rate_ids":` + '[' + mappedUserId.toString() + ']';
      filtered = filter.slice(0, 8) + billing + '}';
    } else {
      filtered = filter;
    }

    let sorting;
    if (this.sortValue) {
      sorting = `sorting=${JSON.stringify(this.sortValue)}`;
    } else {
      sorting = `sorting={}`;
    }

    const fullURL =
      url +
      importStudentTemlate +
      fileType +
      '/' +
      lang +
      '?' +
      filtered +
      '&' +
      sorting +
      '&' +
      `user_type_id="${this.currentUserTypeId}"`;
    console.log('fullURL', fullURL);

    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
      }),
    };
    this.isLoading = true;
    this.httpClient.get(`${encodeURI(fullURL)}`, httpOptions).subscribe(
      (res) => {
        if (res) {
          this.isLoading = false;
          Swal.fire({
            type: 'success',
            title: this.translateService.instant('ReAdmission_S3.TITLE'),
            text: this.translateService.instant('ReAdmission_S3.TEXT'),
            confirmButtonText: this.translateService.instant('ReAdmission_S3.BUTTON'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.selection.clear();
            this.dataSelected = [];
            this.dataUnselectUser = [];
            this.allExportForCheckbox = [];
            this.isCheckedAll = false;
          });
        } else {
          this.isLoading = false;
        }
      },
      (err) => {
        this.isLoading = false;
        console.log('uat 389 error', err);
      },
    );
  }

  cleanFilterDataCSV() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
      }
    });
    return 'filter={' + filterQuery + '}';
  }

  closeForm(data) {
    if (data) {
      this.showForm = false;
      this.getRegistrationProfileData();
    }
  }
  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'name', // name of the key in the object storing the filter
        column: 'Registration Profile', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.registrationProfileFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }
  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    if (filterItem) {
      this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
      this.clearSelectIfFilter();
      this.getRegistrationProfileData();
    }
  }
  clearSelectIfFilter() {
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];
  }
}
