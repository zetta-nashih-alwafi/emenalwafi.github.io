import { HttpHeaders, HttpClient } from '@angular/common/http';
import { UtilityService } from 'app/service/utility/utility.service';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { AddLegalEntityDialogComponent } from 'app/internship-file/add-legal-entity-dialog/add-legal-entity-dialog.component';
import { FinancesService } from 'app/service/finance/finance.service';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { SelectionModel } from '@angular/cdk/collections';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'environments/environment';
import * as moment from 'moment';
import { ExportCsvService } from 'app/service/export-csv/export-csv.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { AssignLegalStampDialogComponent } from './assign-legal-stamp-dialog/assign-legal-stamp-dialog.component';

@Component({
  selector: 'ms-legal-entity',
  templateUrl: './legal-entity.component.html',
  styleUrls: ['./legal-entity.component.scss'],
})
export class LegalEntityComponent implements OnInit, OnDestroy, AfterViewInit {
  dataSource = new MatTableDataSource([]);
  titleData: any;
  noData: any;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  sortValue = null;
  intakeChannelCount;
  displayedColumns: string[] = [
    'select',
    'legalEntity',
    'immatruclation',
    'siret',
    'shareholder',
    'signatory',
    'bank',
    'iban',
    'bic',
    'urssafNumber',
    'tvaNumber',
    'onlinePayment',
    'officialStamp',
    'action',
  ];
  filterColumns: string[] = [
    'selectFilter',
    'legalEntityFilter',
    'immatruclationFilter',
    'siretFilter',
    'shareholderFilter',
    'signatoryFilter',
    'bankFilter',
    'ibanFilter',
    'bicFilter',
    'urssafNumberFilter',
    'tvaNumberFilter',
    'onlinePaymentFilter',
    'officialStampFilter',
    // 'accountingAccountFilter',
    // 'programCampusFilter',
    // 'ribFilter',
    'actionFilter',
  ];
  filteredValues = {
    name: '',
    accounting_account: '',
    program_campus: '',
    scholar_season_id: null,
    legal_entity_stamp: null,
  };

  intackChannelCount;
  isWaitingForResponse = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isLoading: Boolean = false;
  dataCount = 0;
  private subs = new SubSink();
  private timeOutVal: any;
  selection = new SelectionModel<any>(true, []);
  isCheckedAll = false;
  disabledExport = true;
  userSelected = [];
  userSelectedId = [];
  selectType;

  legalEntityFilter = new UntypedFormControl('');
  accountingAccountFilter = new UntypedFormControl('');
  programCampusFilter = new UntypedFormControl('');

  dummyOnlinePayment = 'nothing_is_done';
  scholarSeasons: any;
  scholarId: any;
  allInternshipId = [];
  exportName: string;

  openOnBoardingMerchant = false;

  dataSelected = [];
  pageSelected = [];
  allLegalForCheckbox = [];
  officialStampDropdown = [
    { key: 'Assigned', value: true },
    { key: 'Non assigned', value: false },
  ];
  officialStampFilter = new UntypedFormControl('All');
  filterBreadcrumbData = [];
  currentUserTypeId: any;
  dataUnselectLegalEntity = [];

  constructor(
    private dialog: MatDialog,
    private financeService: FinancesService,
    private translateService: TranslateService,
    private router: ActivatedRoute,
    private pageTitleService: PageTitleService,
    private route: Router,
    private utilityService: UtilityService,
    private userService: AuthService,
    public permission: PermissionService,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private httpClient: HttpClient,
  ) {}

  ngOnInit() {
    const currentUser = this.userService.getLocalStorageUser();
    const isPermission = this.userService.getPermission();
    const currentUserEntity = currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

    this.initFilter();
    this.getLegalEntitiesData();
    this.pageTitleService.setTitle(
      this.translateService.instant('INTAKE_CHANNEL.PAGE_TITLE.Settings') +
        ' - ' +
        this.translateService.instant('INTAKE_CHANNEL.SETTINGS.Legal entities'),
    );
    this.subs.sink = this.translateService.onLangChange.subscribe(() => {
      this.pageTitleService.setTitle(
        this.translateService.instant('INTAKE_CHANNEL.PAGE_TITLE.Settings') +
          ' - ' +
          this.translateService.instant('INTAKE_CHANNEL.SETTINGS.Legal entities'),
      );
    });
    this.openOnBoardingMerchant = this.router.snapshot.queryParamMap.get('legalEntityId') ? true : false;
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getLegalEntitiesData();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getLegalEntitiesData() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterData();
    this.subs.sink = this.financeService.GetAllLegalEntities(pagination, this.sortValue, filter).subscribe(
      (legalEntities: any) => {
        if (legalEntities && legalEntities.length) {
          const dataSource = _.cloneDeep(legalEntities);
          // dataSource.forEach((element) => {
          //   element.program = this.getFormatDataProgram(element);
          // });
          this.dataSource.data = dataSource;
          this.paginator.length = legalEntities[0]?.count_document;
          this.dataCount = legalEntities[0]?.count_document;
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

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.selection.clear();
      this.dataSelected = [];
      this.allLegalForCheckbox = [];
      this.isCheckedAll = false;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getLegalEntitiesData();
      }
    }
  }

  resetTable() {
    this.isReset = true;
    this.selection.clear();
    this.isCheckedAll = false;
    this.dataUnselectLegalEntity = [];
    this.allLegalForCheckbox = [];
    this.dataSelected = [];
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });

    this.filteredValues = {
      name: '',
      accounting_account: '',
      program_campus: '',
      scholar_season_id: this.scholarId,
      legal_entity_stamp: null,
    };

    this.officialStampFilter.setValue('All', { emitEvent: false });
    this.disabledExport = true;
    this.legalEntityFilter.setValue(null, { emitEvent: false });
    this.accountingAccountFilter.setValue(null, { emitEvent: false });
    this.programCampusFilter.setValue(null, { emitEvent: false });
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.filterBreadcrumbData = [];
    this.getLegalEntitiesData();
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (key === 'legal_entity_stamp') {
          filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
        } else {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
        }
      }
    });
    return 'filter: {' + filterQuery + '}';
  }

  initFilter() {
    this.subs.sink = this.legalEntityFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        // this.selection.clear();
        this.isCheckedAll = false;
        this.filteredValues.name = statusSearch ? statusSearch : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          // this.selection.clear();
          this.isCheckedAll = false;
          this.getLegalEntitiesData();
        } else if (statusSearch === '') {
          // this.selection.clear();
          this.isCheckedAll = false;
          this.legalEntityFilter.setValue('');
          this.filteredValues.name = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getLegalEntitiesData();
          }
        }
      } else {
        // this.selection.clear();
        this.isCheckedAll = false;
        this.legalEntityFilter.setValue('');
        this.filteredValues.name = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getLegalEntitiesData();
        }
      }
    });
    this.subs.sink = this.accountingAccountFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.filteredValues.accounting_account = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getLegalEntitiesData();
        } else if (statusSearch === '') {
          this.accountingAccountFilter.setValue('');
          this.filteredValues.accounting_account = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getLegalEntitiesData();
          }
        }
      } else {
        this.accountingAccountFilter.setValue('');
        this.filteredValues.accounting_account = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getLegalEntitiesData();
        }
      }
    });
    this.subs.sink = this.programCampusFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.filteredValues.program_campus = statusSearch ? statusSearch.toLowerCase() : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getLegalEntitiesData();
        } else if (statusSearch === '') {
          this.programCampusFilter.setValue('');
          this.filteredValues.program_campus = '';
          this.paginator.pageIndex = 0;
          if (!this.isReset) {
            this.getLegalEntitiesData();
          }
        }
      } else {
        this.programCampusFilter.setValue('');
        this.filteredValues.program_campus = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getLegalEntitiesData();
        }
      }
    });
  }

  renderTooltipEntity(entities: any[]): string {
    let tooltip = '';
    let count = 0;
    for (const entity of entities) {
      count++;
      if (count > 1) {
        if (entity) {
          tooltip = tooltip + ', ';
          tooltip = tooltip + entity;
        }
      } else {
        if (entity) {
          tooltip = tooltip + entity;
        }
      }
    }
    return tooltip;
  }

  addLegalDialog() {
    this.subs.sink = this.dialog
      .open(AddLegalEntityDialogComponent, {
        width: '1000px',
        minHeight: '100px',
        maxHeight: '40vw',
        disableClose: true,
      })
      .afterClosed()
      .subscribe((resp: any) => {
        if (resp === 'Open Form') {
          this.openOnBoardingMerchant = true;
        } else if (resp && resp !== 'Open Form') {
          this.getLegalEntitiesData();
        }
      });
  }

  editLegalDialog(data) {
    const url = this.route.createUrlTree([`/settings`], {
      queryParams: { legalEntityId: data._id },
    });
    window.open(url.toString(), '_blank');
  }

  assignLegalStampDialog(data: any) {
    this.subs.sink = this.dialog
      .open(AssignLegalStampDialogComponent, {
        width: '600px',
        minHeight: '100px',
        maxHeight: '40vw',
        disableClose: true,
        data: data,
      })
      .afterClosed()
      .subscribe((resp: any) => {
        if (resp) {
          this.getLegalEntitiesData();
        }
      });
  }

  getAdmissionChannelName(data) {
    let tooltip = '';
    let labelSub = '';
    let campusSub = '';
    let levelSub = '';
    let count = 0;
    data.school_id.forEach((element) => {
      if (element && element.short_name) {
        data.campus.forEach((campus) => {
          data.level.forEach((level) => {
            count++;
            if (count > 1) {
              if (element && element.short_name) {
                labelSub = element.short_name.substring(0, 3).toUpperCase();
                campusSub = campus ? campus.substring(0, 3).toUpperCase() : '';
                levelSub = level ? level.toUpperCase() : '';
                tooltip = tooltip + ', ';
                tooltip = tooltip + `${labelSub + campusSub} ${levelSub} `;
              }
            } else {
              if (element && element.short_name) {
                labelSub = element.short_name.substring(0, 3).toUpperCase();
                campusSub = campus ? campus.substring(0, 3).toUpperCase() : '';
                levelSub = level ? level.toUpperCase() : '';
                tooltip = tooltip + `${labelSub + campusSub} ${levelSub} `;
              }
            }
          });
        });
      }
    });
    return tooltip;
  }

  getFormatDataProgram(data) {
    const dataTemp = _.cloneDeep(data);
    const tooltip = [];
    let labelSub = '';
    let campusSub = '';
    let levelSub = '';
    dataTemp.school_id.forEach((element) => {
      if (element && element.short_name) {
        dataTemp.campus.forEach((campus) => {
          dataTemp.level.forEach((level) => {
            if (element && element.short_name) {
              labelSub = element.short_name.substring(0, 3).toUpperCase();
              campusSub = campus ? campus.substring(0, 3).toUpperCase() : '';
              levelSub = level ? level.toUpperCase() : '';
              tooltip.push(`${labelSub + campusSub} ${levelSub}`);
            }
          });
        });
      }
    });
    return tooltip;
  }

  deletePayment(data) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translateService.instant('DELETE_ITEM_TEMPLATE.TITLE'),
      html: this.translateService.instant('CONFIRMDELETE', {
        value: data.name ? data.name : '',
      }),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('THUMBSUP.SWEET_ALERT.CONFIRM', { timer: timeDisabled }),
      cancelButtonText: this.translateService.instant('DASHBOARD_DELETE.NO'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translateService.instant('DELETE_ITEM_TEMPLATE.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translateService.instant('DELETE_ITEM_TEMPLATE.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.subs.sink = this.financeService.DeleteLegalEntity(data._id).subscribe(
          () => {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: 'OK',
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then(() => {
              this.getLegalEntitiesData();
            });
          },
          (error) => {
            this.userService.postErrorLog(error);
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
    });
  }

  getTooltipProgram(entities: any): string {
    let tooltip = '';
    let count = 0;
    if (entities && entities.program && entities.program.length) {
      for (const entity of entities.program) {
        count++;
        if (count > 1) {
          if (entity) {
            tooltip = tooltip + ', ';
            tooltip = tooltip + entity;
          }
        } else {
          if (entity) {
            tooltip = tooltip + entity;
          }
        }
      }
    }
    return tooltip;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return this.isCheckedAll ? true : (numSelected === numRows || numSelected > numRows);
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected() || (this.isCheckedAll && this.dataUnselectLegalEntity && this.dataUnselectLegalEntity.length)) {
      this.selection.clear();
      this.dataSelected = [];
      this.pageSelected = [];
      this.dataUnselectLegalEntity = [];
      this.allLegalForCheckbox = [];
      this.isCheckedAll = false;
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.allLegalForCheckbox = [];
      this.isCheckedAll = true;
      this.dataUnselectLegalEntity = [];
      this.allLegalForCheckbox = [];
      this.dataSource.data.forEach((row) => {
        if (!this.allLegalForCheckbox.includes(row._id)) {
          this.selection.select(row._id);
        }
      });
    }
  }

  getDataAllForCheckbox(pageNumber) {
    if (this.isCheckedAll) {
      const pagination = {
        limit: 500,
        page: pageNumber,
      };
      this.isWaitingForResponse = true;
      const filter = this.cleanFilterData();
      this.subs.sink = this.financeService.GetAllLegalEntitiesForCheckbox(pagination, this.sortValue, filter).subscribe(
        (legalEntities: any) => {
          if (legalEntities && legalEntities.length) {
            const resp = _.cloneDeep(legalEntities);
            // this.allLegalForCheckbox.push(...legalEntities);
            this.allLegalForCheckbox = _.concat(this.allLegalForCheckbox, resp);
            const page = pageNumber + 1;
            this.getDataAllForCheckbox(page);
          } else {
            this.isWaitingForResponse = false;
            if (this.isCheckedAll && this.allLegalForCheckbox && this.allLegalForCheckbox.length) {
              this.dataSelected = this.allLegalForCheckbox.filter((list) => !this.dataUnselectLegalEntity.includes(list._id));
              this.dataSelected = _.uniqBy(this.dataSelected, '_id');

              if (this.dataSelected && this.dataSelected.length) {
                this.downloadCSV();
              }
            } else {
              this.pageSelected = [];
            }
          }
        },
        (error) => {
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
    } else {
      this.downloadCSV();
    }
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
        if (!this.dataUnselectLegalEntity.includes(row._id)) {
          this.dataUnselectLegalEntity.push(row._id);
          this.selection.deselect(row._id);
        } else {
          const indx = this.dataUnselectLegalEntity.findIndex((list) => list === row._id);
          this.dataUnselectLegalEntity.splice(indx, 1);
          this.selection.select(row._id);
        }
      }
    } else {
      if (row) {
        const dataFilter = this.dataSelected.filter((resp) => resp._id === row._id);
        if (dataFilter && dataFilter.length < 1) {
          this.dataSelected.push(row);
        } else {
          const indexFilter = this.dataSelected.findIndex((resp) => resp._id === row._id);
          this.dataSelected.splice(indexFilter, 1);
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

  backToTable(isBack) {
    if (isBack) {
      this.openOnBoardingMerchant = false;
      this.getLegalEntitiesData();
      this.route.navigateByUrl('/', { skipLocationChange: true }).then(() =>
        this.route.navigate([`/settings`], {
          queryParams: {
            openLegalEntities: true,
          },
        }),
      );
    }
  }

  updateCivility(data) {
    if (data) {
      if (data === 'MALE') {
        return this.translateService.instant('MR');
      } else if (data === 'FEMALE') {
        return this.translateService.instant('MRS');
      } else {
        return;
      }
    }
  }

  unpublishLegalEntity(element) {
    Swal.fire({
      title: this.translateService.instant('Legal_S1.TITLE'),
      html: this.translateService.instant('Legal_S1.TEXT', {
        legalEntityName: element.legal_entity_name,
      }),
      width: '600px',
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translateService.instant('Legal_S1.BUTTON 1'),
      cancelButtonText: this.translateService.instant('Legal_S1.BUTTON 2'),
      allowOutsideClick: false,
      allowEnterKey: false,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.value) {
        const payload = {
          online_payment_status: 'not_submit',
        };
        this.subs.sink = this.financeService.UpdateLegalEntityNotPublish(payload, element._id, false).subscribe(
          (res) => {
            if (res) {
              Swal.fire({
                type: 'success',
                title: 'Bravo!',
                confirmButtonText: 'OK',
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.getLegalEntitiesData();
              });
            }
          },
          (err) => {
            this.userService.postErrorLog(err);
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
            }
            if (err['message'] === 'GraphQL error: Legal entity is already connected to a program') {
              Swal.fire({
                type: 'info',
                title: this.translateService.instant('Legal_S2.TITLE'),
                html: this.translateService.instant('Legal_S2.TEXT'),
                confirmButtonText: this.translateService.instant('Legal_S2.BUTTON 1'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              });
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
      } else if (result.dismiss) {
      }
    });
  }

  downloadCSV() {
    if (this.utilityService.checkIfCandidateSelectNotNull(this.selection.selected.length, 'Legal entity')) {
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
    const importStudentTemlate = `downloadLegalEntityCSV/`;
    // console.log('_ini filter', this.dataSelected);
    let filter;
    if (
      (this.dataSelected.length && !this.isCheckedAll) ||
      (this.dataUnselectLegalEntity &&
        this.dataUnselectLegalEntity.length &&
        this.isCheckedAll &&
        this.dataSelected &&
        this.dataSelected.length)
    ) {
      const mappedIds = [...new Set(this.dataSelected.map((res) => `"` + res._id + `"`))];
      // console.log(mappedIds);
      filter = `filter={"legal_entity_ids": [` + mappedIds.toString() + '] }';
    } else {
      filter = this.cleanFilterDataCSV();
    }
    let sorting;
    if (this.sortValue) {
      sorting = `sorting=${JSON.stringify(this.sortValue)}`;
    } else {
      sorting = `sorting={}`;
    }
    const fullURL =
      url + importStudentTemlate + fileType + '/' + lang + '?' + filter + '&' + sorting + '&' + `user_type_id="${this.currentUserTypeId}"`;
    console.log(fullURL);

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
            this.allLegalForCheckbox = [];
            this.isCheckedAll = false;
          });
        } else {
          this.isLoading = false;
        }
      },
      (err) => {
        this.isLoading = false;
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
  filterBreadcrumbFormat() {
   
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'name', // name of the key in the object storing the filter
        column: 'ADMISSION.TABLE_LEGAL_ENTITIES.Legal Entity', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.legalEntityFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'legal_entity_stamp', // name of the key in the object storing the filter
        column: 'Official Stamps', // name of the column in the table or the field if super filter
        isMultiple: true, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.officialStampDropdown, // the array/list holding the dropdown options
        filterRef: this.officialStampFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'key', // the key displayed in the html (only applicable to array of objects)
        savedValue: 'value', // the value saved when user select an option (e.g. _id)
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
  }
  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    if (filterItem) {
      this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
      this.officialStampFilter.patchValue('All')
      this.clearSelectIfFilter();
      this.getLegalEntitiesData();
    }
  }
  clearSelectIfFilter() {
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
  }

  onFilterSelect(value: string | null) {
    // this.selection.clear();
    this.isCheckedAll = false;
    this.filteredValues.legal_entity_stamp = value !== 'All' ? value : null;
    this.paginator.pageIndex = 0;
    if (!this.isReset) {
      this.getLegalEntitiesData();
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
