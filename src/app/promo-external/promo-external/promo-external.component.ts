import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PromoExternalService } from 'app/service/promo-external/promo-external.service';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import { SubSink } from 'subsink';
import { AddPromoExternalDialogComponent } from '../add-promo-external-dialog/add-promo-external-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import Swal from 'sweetalert2';
import { MailPromoExternalDialogComponent } from '../mail-promo-external-dialog/mail-promo-external-dialog.component';
import { ApplicationUrls } from 'app/shared/settings';
import { AuthService } from 'app/service/auth-service/auth.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { DomSanitizer } from '@angular/platform-browser';
import { UtilityService } from 'app/service/utility/utility.service';
import { ViewPromoExternalDialogComponent } from '../view-promo-external/view-promo-external.component';
import { DuplicatePromoDialogComponent } from '../duplicate-promo-dialog/duplicate-promo-dialog.component';
import { PermissionService } from 'app/service/permission/permission.service';
import { environment } from 'environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilterBreadCrumbInput, FilterBreadCrumbItem } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-promo-external',
  templateUrl: './promo-external.component.html',
  styleUrls: ['./promo-external.component.scss'],
})
export class PromoExternalComponent implements OnInit, AfterViewInit, OnDestroy {
  private subs = new SubSink();
  displayedColumns: string[] = [
    'select',
    'ref',
    'module',
    'title',
    'subTitle',
    'text',
    'school',
    'campus',
    'level',
    'gender',
    'region',
    'hobby',
    'job',
    'activities',
    'integration',
    'insertion',
    'program',
    // 'videoLink',
    // 'imageUpload',
    'generic',
    'published',
    'action',
  ];
  filterColumns: string[] = [
    'selectFilter',
    'refFilter',
    'moduleFilter',
    'titleFilter',
    'subTitleFilter',
    'textFilter',
    'schoolFilter',
    'campusFilter',
    'levelFilter',
    'genderFilter',
    'regionFilter',
    'hobbyFilter',
    'jobFilter',
    'activitiesFilter',
    'integrationFilter',
    'insertionFilter',
    'programFilter',
    // 'videoLinkFilter',
    // 'imageUploadFilter',
    'genericFilter',
    'publishedFilter',
    'actionFilter',
  ];
  filterBreadcrumbData = [];
  @ViewChild('publishSwal', { static: true }) publishSwal: any;
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  refFilter = new UntypedFormControl('');
  titleFilter = new UntypedFormControl('');
  subTitleFilter = new UntypedFormControl('');
  textFilter = new UntypedFormControl('');
  schoolFilter = new UntypedFormControl('');
  campusFilter = new UntypedFormControl('');
  regionFilter = new UntypedFormControl('');

  schools = [];
  campuses = [];
  regions = [
    'Europe',
    'North Africa',
    'SubSaharian Africa',
    'Asia',
    'North America',
    'South America',
    'Middle East',
    'Indian Sub Continent',
  ];

  userForExport: any[];
  allStudentForExport = [];
  exportName: 'Export';
  dataLoaded = false;
  usersCount = 0;
  sortValue: any;
  dataUser: any;
  currPromo: any;
  selectType: any;

  // Configuration of the Popup Size and display
  configCat: MatDialogConfig = {
    disableClose: true,
    panelClass: 'certification-rule-pop-up',
    minWidth: '95%',
    minHeight: '81%',
  };

  filteredValues = {
    ref_id: null,
    title: null,
    sub_title: null,
    story: null,
    school: null,
    campus: null,
    region: null,
  };
  config: MatDialogConfig = {
    disableClose: true,
    width: '1115px',
    height: '650px',
  };
  configView: MatDialogConfig = {
    disableClose: true,
    width: '425px',
    height: '585px',
  };
  configPublish: MatDialogConfig = {
    disableClose: true,
    width: '600px',
  };
  operation: string;
  selectedIndex = null;
  userEntities: any[];
  loggedInUserSchools: { value: string; label: string }[] = [];
  searchText: string;
  isReset = false;
  isWaitingForResponse = false;
  disabledExport = true;
  noData: any;
  entityData: any;
  currentUser: any;
  userSelected: any[];
  defaultVideoUrl = 'https://www.youtube.com/watch?v=TyTjGZkhNQE';

  private timeOutVal: any;
  private intVal: any;
  showSpinner = false;
  originalUserType: any[];
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  isDirectorAdmission = false;
  isMemberAdmission = false;
  isPermission: string[];
  currentUserTypeId: any;
  allStudentForCheckbox = [];
  dataSelected = [];
  pageSelected = [];
  userSelectedId: any[];
  isCheckedAll = false;
  constructor(
    private translate: TranslateService,
    public dialog: MatDialog,
    private authService: AuthService,
    private ngxPermissionService: NgxPermissionsService,
    private promoExternalService: PromoExternalService,
    private candidateService: CandidatesService,
    private sanitizer: DomSanitizer,
    public permission: PermissionService,
    private httpClient: HttpClient,
    public utilitySevice: UtilityService,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private pageTitleService: PageTitleService
  ) {}

  ngOnInit() {
    this.isDirectorAdmission = !!this.ngxPermissionService.getPermission('Director of Admissions');
    this.isMemberAdmission = !!this.ngxPermissionService.getPermission('Member Admission');
    this.currentUser = this.authService.getLocalStorageUser();
    this.isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    this.getDataPromo();
    this.initFilters();
    this.getDataForList();
    this.pageTitleService.setTitle('NAV.Promo External');
  }

  initFilters() {
    this.subs.sink = this.titleFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.filteredValues.title = statusSearch ? statusSearch : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getDataPromo();
        }
      } else {
        this.titleFilter.setValue('');
        this.filteredValues.title = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getDataPromo();
        }
      }
    });
    this.subs.sink = this.subTitleFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.filteredValues.sub_title = statusSearch ? statusSearch : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getDataPromo();
        }
      } else {
        this.subTitleFilter.setValue('');
        this.filteredValues.sub_title = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getDataPromo();
        }
      }
    });
    this.subs.sink = this.textFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.filteredValues.story = statusSearch ? statusSearch : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getDataPromo();
        }
      } else {
        this.textFilter.setValue('');
        this.filteredValues.story = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getDataPromo();
        }
      }
    });
    this.subs.sink = this.refFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (!statusSearch.match(symbol) && !statusSearch.match(symbol1)) {
        this.filteredValues.ref_id = statusSearch ? statusSearch : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getDataPromo();
        }
      } else {
        this.refFilter.setValue('');
        this.filteredValues.ref_id = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getDataPromo();
        }
      }
    });
    this.subs.sink = this.schoolFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.school = statusSearch === 'AllM' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataPromo();
      }
    });

    this.subs.sink = this.campusFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.campus = statusSearch === 'AllM' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataPromo();
      }
    });

    this.subs.sink = this.regionFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.region = statusSearch === 'AllM' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataPromo();
      }
    });
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getDataPromo();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getDataPromo();
      }
    }
  }

  getDataPromo() {
    this.dataSource.data = [];
    this.paginator.length = 0;
    this.usersCount = 0;
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterData();
    this.subs.sink = this.promoExternalService.getAllPromoExternals(pagination, this.sortValue, filter).subscribe(
      (students: any) => {
        if (students && students.length) {
          this.dataSource.data = students;
          this.paginator.length = students[0].count_document;
          this.usersCount = students[0].count_document;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.usersCount = 0;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isWaitingForResponse = false;
        // Record error log
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
    this.filterBreadcrumbFormat();
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
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
    return numSelected === numRows || numSelected > numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.dataSelected = [];
      this.pageSelected = [];
      this.isCheckedAll = false;
    } else {
      this.selection.clear();
      this.dataSelected = [];
      this.allStudentForCheckbox = [];
      this.isCheckedAll = true;
      this.getDataAllForCheckbox(0);
    }
  }

  showOptions(info, row) {
    if (row) {
      const dataFilter = this.dataSelected.filter((resp) => resp._id === row._id);
      if (dataFilter && dataFilter.length < 1) {
        this.dataSelected.push(row);
      } else {
        const indexFilter = this.dataSelected.findIndex((resp) => resp._id === row._id);
        this.dataSelected.splice(indexFilter, 1);
      }
    }
    const numSelected = this.dataSelected.length;
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

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.isWaitingForResponse = true;
    const filter = this.cleanFilterData();
    this.subs.sink = this.promoExternalService.getAllPromoExternals(pagination, this.sortValue, filter).subscribe(
      (students: any) => {
        if (students && students.length) {
          this.allStudentForCheckbox.push(...students);
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
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.isReset = false;
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
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

  /** Reset Functionality User Table */
  resetSelection() {
    this.isReset = true;
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.filteredValues = {
      ref_id: null,
      title: null,
      sub_title: null,
      story: null,
      school: null,
      campus: null,
      region: null,
    };
    this.sort.direction = '';
    this.sort.active = '';
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.sortValue = null;
    this.paginator.pageIndex = 0;
    this.refFilter.setValue('');
    this.titleFilter.setValue('');
    this.campusFilter.setValue('');
    this.subTitleFilter.setValue('');
    this.textFilter.setValue('');
    this.schoolFilter.setValue('');
    this.regionFilter.setValue('');
    this.filterBreadcrumbData = [];
    this.getDataPromo();
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeOutVal);
    clearInterval(this.intVal);
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }

  getDataForList() {
    const name = '';
    this.schools = [];
    this.campuses = [];
    this.subs.sink = this.candidateService.GetDataForImportObjectives(name, this.currentUserTypeId).subscribe(
      (resp) => {
        if (resp) {
          this.schools = resp;
          this.schools.forEach((element) => {
            if (element.campuses && element.campuses.length > 0) {
              element.campuses.forEach((campuses) => {
                this.campuses.push(campuses);
              });
            }
          });
          this.campuses = _.uniqBy(this.campuses, 'name');
        }
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getDataCampus() {
    this.campuses = [];
    const scampusList = this.schools.filter((list) => {
      return this.schoolFilter.value.includes(list.short_name);
    });
    scampusList.filter((campus) => {
      if (campus.campuses && campus.campuses.length) {
        campus.campuses.filter((campuses) => {
          this.campuses.push(campuses);
        });
      }
    });
    this.campuses = _.uniqBy(this.campuses, 'name');
  }

  addNewPromo() {
    this.subs.sink = this.dialog
      .open(AddPromoExternalDialogComponent, this.config)
      .afterClosed()
      .subscribe(() => {
        this.getDataPromo();
      });
  }

  deletePromo(promoId: string) {
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('PROMO_S3.TITLE'),
      confirmButtonText: this.translate.instant('PROMO_S3.BUTTON_1'),
      cancelButtonText: this.translate.instant('PROMO_S3.BUTTON_2'),
      showCancelButton: true,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.value) {
        this.promoExternalService.deletePromoExternal(promoId).subscribe(
          () => {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('PROMO_S4.TITLE'),
              text: this.translate.instant('PROMO_S4.TEXT'),
              confirmButtonText: this.translate.instant('PROMO_S4.BUTTON'),
            }).then(() => {
              this.getDataPromo();
            });
          },
          (err) => {
            // Record error log
            this.authService.postErrorLog(err);
          },
        );
      }
    });
  }

  editPromoExternal(currPromo) {
    currPromo.action = 'edit';
    this.subs.sink = this.dialog
      .open(AddPromoExternalDialogComponent, {
        ...this.config,
        data: currPromo,
      })
      .afterClosed()
      .subscribe(() => {
        this.getDataPromo();
      });
  }

  duplicatePromoExternal(currPromo) {
    currPromo.action = 'edit';
    this.subs.sink = this.dialog
      .open(DuplicatePromoDialogComponent, {
        ...this.config,
        data: currPromo,
      })
      .afterClosed()
      .subscribe(() => {
        this.getDataPromo();
      });
  }

  viewPromoExternal(currPromo) {
    currPromo.action = 'edit';
    this.subs.sink = this.dialog
      .open(ViewPromoExternalDialogComponent, {
        ...this.configView,
        data: currPromo,
      })
      .afterClosed()
      .subscribe(() => {});
  }

  publishPromoExternalConfirm(currPromo) {
    const id = currPromo._id;
    delete currPromo._id;
    delete currPromo.count_document;
    currPromo.is_published = true;
    this.promoExternalService.updatePromoExternal(id, currPromo).subscribe(
      () => {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('PROMO_S2.TITLE'),
          allowEscapeKey: true,
          showCancelButton: false,
          text: this.translate.instant('PROMO_S2.TEXT'),
          showConfirmButton: true,
          allowOutsideClick: false,
          confirmButtonText: this.translate.instant('PROMO_S2.BUTTON'),
        }).then(() => {
          this.getDataPromo();
        });
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
      },
    );
  }

  publishPromoExternal(currPromo) {
    this.currPromo = currPromo;
    this.publishSwal.show();
  }

  sanitizeVideoUrl(url: string) {
    if (url) {
      url = url.includes('watch?v=') ? url.replace('watch?v=', 'embed/') : url;
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return false;
  }

  isVideoLinkValid(): boolean {
    const videoLink = this.currPromo.video_link;
    return videoLink ? this.utilitySevice.isValidURL(videoLink) : true;
  }

  sendMail(data) {
    if (this.utilitySevice.checkIfCandidateSelectNotNull(this.selection.selected.length, 'NAV.Promo External')) {
      return;
    } else {
      this.subs.sink = this.dialog
        .open(MailPromoExternalDialogComponent, {
          disableClose: true,
          width: '750px',
          data: data,
          autoFocus: false,
        })
        .afterClosed()
        .subscribe((resp) => {
          if (resp) {
          }
        });
    }
  }

  downloadCSV() {
    if (this.utilitySevice.checkIfCandidateSelectNotNull(this.selection.selected.length, 'NAV.Promo External')) {
      return;
    } else {
      this.csvDownloadAdmission();
    }
  }
  csvDownloadAdmission() {
    if (this.dataSelected && this.dataSelected.length < 1 && !this.isCheckedAll) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Diapos External') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
    } else {
      const inputOptions = {
        ',': this.translate.instant('IMPORT_DECISION_S1.COMMA'),
        ';': this.translate.instant('IMPORT_DECISION_S1.SEMICOLON'),
        tab: this.translate.instant('IMPORT_DECISION_S1.TAB'),
      };
      // const currentLang = this.translate.currentLang;
      Swal.fire({
        type: 'question',
        title: this.translate.instant('EXPORT_DECISION.TITLE'),
        width: 465,
        allowEscapeKey: true,
        showCancelButton: true,
        cancelButtonText: this.translate.instant('IMPORT_DECISION_S1.CANCEL'),
        confirmButtonText: this.translate.instant('IMPORT_DECISION_S1.OK'),
        input: 'radio',
        inputOptions: inputOptions,
        inputValue: this.translate && this.translate.currentLang === 'fr' ? ';' : '',
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
    const lang = this.translate.currentLang.toLowerCase();
    const filter = this.cleanFilterDataDownload();
    let filtered;
    if (
      (this.dataSelected.length && !this.isCheckedAll) ||
      (this.allStudentForCheckbox && this.allStudentForCheckbox.length && this.selectType === 'one')
    ) {
      const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      const promoExternalId = `"promo_external_ids":` + '[' + mappedUserId.toString() + ']';
      // filtered = 'filter={' + promoExternalId + '}'
      if (filter.length > 9) {
        filtered = filter.slice(0, 8) + promoExternalId + ',' + filter.slice(8);
      } else {
        filtered = filter.slice(0, 8) + promoExternalId + filter.slice(8);
      }
    } else if (this.isCheckedAll) {
      filtered = filter;
    }

    const importStudentTemlate = `downloadDiaposExternalCSV/`;
    const fullURL = url + importStudentTemlate + fileType + '/' + lang + '?' + filtered;

    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: JSON.parse(localStorage.getItem('admtc-token-encryption')),
      }),
    };

    this.isWaitingForResponse = true;
    this.httpClient.get(`${encodeURI(fullURL)}`, httpOptions).subscribe(
      (res) => {
        if (res) {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'success',
            title: this.translate.instant('ReAdmission_S3.TITLE'),
            text: this.translate.instant('ReAdmission_S3.TEXT'),
            confirmButtonText: this.translate.instant('ReAdmission_S3.BUTTON'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          });
          // .then(() => this.clearSelectIfFilter());
        } else {
          this.isWaitingForResponse = false;
        }
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
      },
    );
  }
  cleanFilterDataDownload() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (
          key === 'ref_id' ||
          key === 'title' ||
          key === 'sub_title' ||
          key === 'story' ||
          key === 'region' ||
          key === 'school' ||
          key === 'campus'
        ) {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        }
        // else {
        //   filterQuery = filterQuery ? filterQuery + ',' + `"${key}":${filterData[key]}` : filterQuery + `"${key}":${filterData[key]}`;
        // }
      }
    });
    return 'filter={' + filterQuery + '}';
  }
  filterBreadcrumbFormat() {
    const filterInfo: FilterBreadCrumbInput[] = [
      // Super Filter
      //Table

      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'ref_id', // name of the key in the object storing the filter
        column: 'diapos.Ref', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: null, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'title', // name of the key in the object storing the filter
        column: 'diapos.Title', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: null, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'sub_title', // name of the key in the object storing the filter
        column: 'diapos.Sub-Title', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: null, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'story', // name of the key in the object storing the filter
        column: 'diapos.Text', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: null, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'school', // name of the key in the object storing the filter
        column: 'diapos.School', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: null, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'campus', // name of the key in the object storing the filter
        column: 'diapos.Campus', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: null, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'region', // name of the key in the object storing the filter
        column: 'diapos.Region', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: null, // the ref to form control binded to the filter
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
      if (filterItem.name === 'ref_id') {
        this.refFilter.setValue('');
      } else if (filterItem.name === 'title') {
        this.titleFilter.setValue('');
      } else if (filterItem.name === 'sub_title') {
        this.subTitleFilter.setValue('');
      } else if (filterItem.name === 'story') {
        this.textFilter.setValue('');
      } else if (filterItem.name === 'school') {
        this.schoolFilter.setValue('');
      } else if (filterItem.name === 'campus') {
        this.campusFilter.setValue('');
      } else if (filterItem.name === 'region') {
        this.regionFilter.setValue('');
      }
      this.getDataPromo();
    }
  }
}
