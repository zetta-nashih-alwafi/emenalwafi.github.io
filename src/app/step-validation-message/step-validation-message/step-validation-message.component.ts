import { FilterBreadCrumbItem } from './../../models/bread-crumb-filter.model';
import { UtilityService } from 'app/service/utility/utility.service';
import { Component, OnInit, ViewChild, OnChanges, AfterViewInit, OnDestroy, TemplateRef } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { SubSink } from 'subsink';
import { StepValidationMessageDialogComponent } from '../step-validation-message-dialog/step-validation-message-dialog.component';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { SelectionModel } from '@angular/cdk/collections';
import { StepValidationMessageService } from 'app/service/step-validation-message/step-validation-message.service';
import { MailStepValidationMessageDialogComponent } from '../mail-step-validation-message-dialog/mail-step-validation-message-dialog.component';
import { of } from 'rxjs';
import { Observable } from 'apollo-link';
import { ViewStepValidationDialogComponent } from '../view-step-validation-message/view-step-validation-message.component';
import { DuplicateStepValidationMessageDialogComponent } from '../duplicate-step-validation-message/duplicate-step-validation-message.component';
import { DomSanitizer } from '@angular/platform-browser';
import { ApplicationUrls } from 'app/shared/settings';
import { environment } from 'environments/environment';
import { PermissionService } from 'app/service/permission/permission.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FilterBreadCrumbInput } from 'app/models/bread-crumb-filter.model';
import { FilterBreadcrumbService } from 'app/filter-breadcrumb/service/filter-breadcrumb.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-step-validation-message',
  templateUrl: './step-validation-message.component.html',
  styleUrls: ['./step-validation-message.component.scss'],
})
export class StepValidationMessageComponent implements OnInit, AfterViewInit, OnDestroy {
  promoExternalCount = 0;
  stepValidationCount;
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  stepValidationSelected: any[];
  stepValidationSelectedId: any[];
  selectType: any;
  titleData: any;
  noData: any;
  currStep: any = {};
  config: MatDialogConfig = {
    disableClose: true,
    width: '1115px',
    height: '640px',
  };
  configView: MatDialogConfig = {
    disableClose: true,
    width: '425px',
    panelClass: 'view-step-validation-pop-up',
  };
  disabledExport = true;
  displayedColumns: string[] = ['select', 'step', 'firstTitle', 'secondTitle', 'school', 'campus', 'published', 'action'];
  filterColumns: string[] = [
    'selectFilter',
    'stepFilter',
    'firstTitleFilter',
    'secondTitleFilter',
    'schoolFilter',
    'campusFilter',
    'publishedFilter',
    'actionFilter',
  ];
  filteredValues = {
    validation_step: '',
    first_title: '',
    second_title: '',
    school: '',
    campus: '',
    is_published: null,
  };
  stepList = [1, 2, 3, 4, 5];
  publishList = ['Published', 'Not Published'];
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild('publishSwal', { static: true }) publishSwal: any;
  @ViewChild('stepDisplayTemplate', { static: true }) stepDisplayTemplate: TemplateRef<any>;
  isLoading: Boolean = false;
  dataCount = 0;
  isReset: Boolean = false;
  private subs = new SubSink();
  stepFilter = new UntypedFormControl('');
  firstTitleFilter = new UntypedFormControl('');
  secondTitleFilter = new UntypedFormControl('');
  schoolFilter = new UntypedFormControl('All');
  campusFilter = new UntypedFormControl('');
  publishedFilter = new UntypedFormControl('');
  stepValidationeMessageDialogComponent: MatDialogRef<StepValidationMessageDialogComponent>;
  sortValue = null;
  dataLoaded: Boolean = false;
  schoolList = [];
  schoolFilteredList: any;
  disableVideo = true;
  disableImage = false;
  allStudentForCheckbox = [];
  dataSelected = [];
  pageSelected = [];
  userSelectedId: any[];
  isCheckedAll = false;
  filterBreadcrumbData = [];

  defaultVideoUrl = 'https://www.youtube.com/watch?v=TyTjGZkhNQE';
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  currentUser: any;
  currentUserTypeId: any;
  isPermission: string[];
  constructor(
    private dialog: MatDialog,
    private stepValidationMessageService: StepValidationMessageService,
    public translate: TranslateService,
    private sanitizer: DomSanitizer,
    private utilityService: UtilityService,
    public permission: PermissionService,
    private httpClient: HttpClient,
    private filterBreadCrumbService: FilterBreadcrumbService,
    private userService: AuthService,
    private pageTitleService: PageTitleService
  ) {}

  ngOnInit() {
    this.isPermission = this.userService.getPermission();
    this.currentUser = this.userService.getLocalStorageUser();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === this.isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

    this.getStepValidationData();
    this.initFilter();
    this.initSchoolList();

    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      /* reset pagination when change language */
      // this.initFilter();
      // this.resetStepValidation();
      this.displayWith(this.schoolFilter.value);
    });
    this.pageTitleService.setTitle('Registration Steps Messages');
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
  filterSchool(value) {
    return this.schoolList.filter((school) => RegExp(`^${value}.*`, 'ig').test(school));
  }
  initFilter() {
    this.subs.sink = this.firstTitleFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (statusSearch) {
        // this.selection.clear();
        this.dataSelected = [];
        this.isCheckedAll = false;
        this.filteredValues.first_title = statusSearch;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getStepValidationData();
        }
      } else {
        // this.selection.clear();
        this.dataSelected = [];
        this.isCheckedAll = false;
        this.filteredValues.first_title = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getStepValidationData();
        }
      }
    });
    this.subs.sink = this.stepFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.validation_step = statusSearch === 'AllM' ? '' : statusSearch;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getStepValidationData();
      }
    });
    this.subs.sink = this.publishedFilter.valueChanges.subscribe((statusSearch) => {
      this.filteredValues.is_published = statusSearch === '' ? '' : statusSearch === 'Published' ? true : false;
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getStepValidationData();
      }
    });
    this.subs.sink = this.secondTitleFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (statusSearch) {
        // this.selection.clear();
        this.dataSelected = [];
        this.isCheckedAll = false;
        this.filteredValues.second_title = statusSearch;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getStepValidationData();
        }
      } else {
        // this.selection.clear();
        this.dataSelected = [];
        this.isCheckedAll = false;
        this.filteredValues.second_title = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getStepValidationData();
        }
      }
    });
    this.subs.sink = this.campusFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (statusSearch) {
        // this.selection.clear();
        this.dataSelected = [];
        this.isCheckedAll = false;
        this.filteredValues.campus = statusSearch;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getStepValidationData();
        }
      } else {
        // this.selection.clear();
        this.dataSelected = [];
        this.isCheckedAll = false;
        this.filteredValues.campus = '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getStepValidationData();
        }
      }
    });
    this.subs.sink = this.schoolFilter.valueChanges.pipe(debounceTime(400)).subscribe((statusSearch) => {
      if (statusSearch.length < 3) {
        return;
      }
    });
  }

  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getStepValidationData();
      }
    }
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getStepValidationData();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getStepValidationData() {
    this.dataSource.data = [];
    this.paginator.length = 0;
    this.dataCount = 0;
    this.isLoading = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterData();
    this.subs.sink = this.stepValidationMessageService.getAllStepValidationMessage(pagination, this.sortValue, filter).subscribe(
      (stepValidationMessage: any) => {
        if (stepValidationMessage && stepValidationMessage.length) {
          this.dataSource.data = stepValidationMessage;
          this.paginator.length = stepValidationMessage[0].count_document ? stepValidationMessage[0].count_document : 0;
          this.dataCount = stepValidationMessage[0].count_document ? stepValidationMessage[0].count_document : 0;
          this.promoExternalCount = this.dataCount;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
          this.promoExternalCount = this.dataCount;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isLoading = false;
        this.filterBreadcrumbData = [];
        this.filterBreadcrumbFormat();
      },
      (err) => {
        this.dataSource.data = [];
        this.paginator.length = 0;
        this.dataCount = 0;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isLoading = false;
        this.userService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
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
    this.stepValidationSelected = [];
    this.stepValidationSelectedId = [];
    this.selectType = info;
    const data = this.dataSelected && this.dataSelected.length ? this.dataSelected : this.selection.selected;
    data.forEach((user) => {
      this.stepValidationSelected.push(user);
      this.stepValidationSelectedId.push(user._id);
    });
  }

  getDataAllForCheckbox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.isLoading = true;
    const filter = this.cleanFilterData();
    this.subs.sink = this.stepValidationMessageService.getAllStepValidationMessage(pagination, this.sortValue, filter).subscribe(
      (students: any) => {
        if (students && students.length) {
          this.allStudentForCheckbox.push(...students);
          const page = pageNumber + 1;
          this.getDataAllForCheckbox(page);
        } else {
          this.isLoading = false;
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
        this.isReset = false;
        this.isLoading = false;
        this.userService.postErrorLog(error);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translate.instant('OK'),
        });
      },
    );
  }

  /** The labe l for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (key === 'first_title' || key === 'second_title' || key === 'school' || key === 'campus') {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
        } else {
          filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
        }
      }
    });
    return 'filter: {' + filterQuery + '}';
  }
  initSchoolList() {
    this.stepValidationMessageService
      .getAllCandidateSchool(
        {
          limit: 50,
          page: 0,
        },
        null,
        this.currentUserTypeId,
      )
      .subscribe(
        (schools) => {
          if (schools.length) {
            this.schoolList = schools;
            this.schoolFilteredList = this.schoolFilter.valueChanges.pipe(
              startWith(''),
              map((searchTxt) =>
                searchTxt && searchTxt !== 'All'
                  ? this.schoolList.filter((sch) => sch.short_name.toLowerCase().trim().includes(searchTxt.toLowerCase().trim()))
                  : this.schoolList,
              ),
            );
          }
        },
        (err) => {
          this.userService.postErrorLog(err);
        },
      );
  }
  resetStepValidation() {
    this.disabledExport = true;
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
    this.isReset = true;
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.filteredValues = {
      validation_step: '',
      first_title: '',
      second_title: '',
      school: '',
      campus: '',
      is_published: null,
    };
    this.stepFilter.setValue('');
    this.firstTitleFilter.setValue('');
    this.secondTitleFilter.setValue('');
    this.publishedFilter.setValue('');
    this.schoolFilter.setValue('All');
    this.campusFilter.setValue('');
    this.stepValidationSelected = [];
    this.stepValidationSelectedId = [];
    this.selectType = '';
    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.filterBreadcrumbData = [];
    this.getStepValidationData();
  }
  stripTags(str) {
    let strippedString = str.replace(/(<([^>]+)>)/gi, ''); // remove tags
    strippedString = strippedString.replace(/(&nbsp;|==&gt;)/gi, ''); // spaces
    return strippedString;
  }
  publishStepValidationMessage(currStep) {
    console.log(currStep);
    this.currStep = currStep;
    if (this.currStep.image_upload) {
      this.disableImage = false;
      this.disableVideo = true;
    }
    if (this.currStep.video_link) {
      this.disableImage = true;
      this.disableVideo = false;
    }
    this.publishSwal.show();
  }
  publishConfirm(currStep) {
    const id = currStep._id;
    if (currStep.action) {
      delete currStep.action;
    }
    delete currStep._id;
    delete currStep.count_document;
    currStep.is_published = true;
    this.stepValidationMessageService.updateStepValidationMessage(id, currStep).subscribe(
      (updatedMessage) => {
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo!'),
          allowEscapeKey: true,
          showCancelButton: false,
          text: this.translate.instant('REG_STEP_VAL.The registration step message has been published successfully'),
          showConfirmButton: true,
          allowOutsideClick: false,
          confirmButtonText: this.translate.instant('REG_STEP_VAL.Thank You'),
        });
        this.getStepValidationData();
      },
      (err) => {
        this.userService.postErrorLog(err);
      },
    );
  }
  deleteStepValidation(id) {
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('REG_STEP_VAL.Do you want to delete this Registration step message?'),
      allowEscapeKey: true,
      showCancelButton: true,
      showConfirmButton: true,
      allowOutsideClick: false,
      confirmButtonText: this.translate.instant('REG_STEP_VAL.Delete'),
      cancelButtonText: this.translate.instant('REG_STEP_VAL.Cancel'),
    }).then((result) => {
      if (result.value) {
        this.stepValidationMessageService.deleteStepValidationMessage(id).subscribe(
          (deletedMessage) => {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('Bravo!'),
              allowEscapeKey: true,
              showCancelButton: false,
              text: this.translate.instant('REG_STEP_VAL.The registration step message has been deleted successfully'),
              showConfirmButton: true,
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('REG_STEP_VAL.Thank You'),
              onClose: () => {
                this.getStepValidationData();
              },
            });
          },
          (err) => {
            this.userService.postErrorLog(err);
          },
        );
      }
    });
  }
  viewValidationStep(currStep) {
    currStep.action = 'view';
    this.subs.sink = this.dialog
      .open(ViewStepValidationDialogComponent, {
        ...this.configView,
        data: currStep,
      })
      .afterClosed()
      .subscribe((resp) => {});
  }
  sendMail(data) {
    if (this.utilityService.checkIfCandidateSelectNotNull(this.dataSelected.length, 'Registration Steps Messages')) {
      return;
    } else {
      this.subs.sink = this.dialog
        .open(MailStepValidationMessageDialogComponent, {
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
  duplicateStepValidationMessage(data) {
    data.action = 'duplicate';
    this.subs.sink = this.dialog
      .open(DuplicateStepValidationMessageDialogComponent, { ...this.config, data })
      .afterClosed()
      .subscribe((resp) => {
        this.getStepValidationData();
      });
  }
  editStepValidationMessage(data) {
    data.action = 'edit';
    this.subs.sink = this.dialog
      .open(StepValidationMessageDialogComponent, { ...this.config, data })
      .afterClosed()
      .subscribe((resp) => {
        this.getStepValidationData();
      });
  }
  addValidationPopUp() {
    this.subs.sink = this.dialog
      .open(StepValidationMessageDialogComponent, this.config)
      .afterClosed()
      .subscribe((resp) => {
        this.getStepValidationData();
      });
  }
  sanitizeVideoUrl(url) {
    url = url.includes('watch?v=') ? url.replace('watch?v=', 'embed/') : url;
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : false;
  }
  sanitizeImageUrl(url) {
    const urls = this.serverimgPath + url;
    return urls ? this.sanitizer.bypassSecurityTrustUrl(urls) : false;
  }

  downloadCSV() {
    if (this.utilityService.checkIfCandidateSelectNotNull(this.dataSelected.length, 'Registration Steps Messages')) {
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
    console.log('filter', filter);
    let filtered;
    if (
      (this.dataSelected.length && !this.isCheckedAll) ||
      (this.allStudentForCheckbox && this.allStudentForCheckbox.length && this.selectType === 'one')
    ) {
      const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      const promoExternalId = `"step_message_ids":` + '[' + mappedUserId.toString() + ']';
      // filtered = 'filter={' + promoExternalId + '}'
      if (filter.length > 9) {
        filtered = filter.slice(0, 8) + promoExternalId + ',' + filter.slice(8);
      } else {
        filtered = filter.slice(0, 8) + promoExternalId + filter.slice(8);
      }
    } else if (this.isCheckedAll) {
      filtered = filter;
    }

    const importStudentTemlate = `downloadMessageStepCSV/`;
    const fullURL = url + importStudentTemlate + fileType + '/' + lang + '?' + filtered;

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
            title: this.translate.instant('ReAdmission_S3.TITLE'),
            text: this.translate.instant('ReAdmission_S3.TEXT'),
            confirmButtonText: this.translate.instant('ReAdmission_S3.BUTTON'),
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          });
          // .then(() => this.clearSelectIfFilter());
        } else {
          this.isLoading = false;
        }
      },
      (err) => {
        this.isLoading = false;
        this.userService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }
  cleanFilterDataDownload() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        if (key === 'first_title' || key === 'second_title' || key === 'school' || key === 'campus') {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        } else {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":${filterData[key]}` : filterQuery + `"${key}":${filterData[key]}`;
        }
      }
    });
    return 'filter={' + filterQuery + '}';
  }

  chooseSchool(statusSearch) {
    this.filteredValues.school = statusSearch === 'All' ? '' : statusSearch;
    this.paginator.pageIndex = 0;
    if (!this.isReset) {
      this.getStepValidationData();
    }
  }

  displayWith(value) {
    if (value && value === 'All') {
      return this.translate.instant('All');
    } else {
      return value;
    }
  }
  filterBreadcrumbFormat() {
    const breadcrumbFilteredValues = {
      ...this.filteredValues,
      is_published:
        this.filteredValues && this.filteredValues.is_published === true
          ? 'Published'
          : this.filteredValues && this.filteredValues.is_published === false
          ? 'Not Published'
          : this.filteredValues.is_published,
      validation_step:
        this.filteredValues && this.filteredValues.validation_step && typeof this.filteredValues.validation_step === 'number'
          ? String(this.filteredValues.validation_step)
          : this.filteredValues.validation_step,
    };
    const filterInfo: FilterBreadCrumbInput[] = [
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'validation_step', // name of the key in the object storing the filter
        column: 'Validation of Step', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: breadcrumbFilteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.stepList, // the array/list holding the dropdown options
        filterRef: this.stepFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        resetValue: '',
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'first_title', // name of the key in the object storing the filter
        column: 'Title 1', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.firstTitleFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'second_title', // name of the key in the object storing the filter
        column: 'Title 2', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.secondTitleFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'school', // name of the key in the object storing the filter
        column: 'School', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.schoolList, // the array/list holding the dropdown options
        filterRef: this.schoolFilter, // the ref to form control binded to the filter
        isSelectionInput: true, // is it a dropdown input or a normal input/date
        displayKey: 'short_name', // the key displayed in the html (only applicable to array of objects)
        savedValue: 'short_name', // the value saved when user select an option (e.g. _id)
        resetValue: 'All',
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'campus', // name of the key in the object storing the filter
        column: 'Campus', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: this.filteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: null, // the array/list holding the dropdown options
        filterRef: this.campusFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        noTranslate: true
      },
      {
        type: 'table_filter', // type of filter super_filter | table_filter | action_filter
        name: 'is_published', // name of the key in the object storing the filter
        column: 'Published', // name of the column in the table or the field if super filter
        isMultiple: false, // can it support multiple selection
        filterValue: breadcrumbFilteredValues, // the object holding the filter value (e.g. filteredValues | filteredValuesSuperFilter)
        filterList: this.publishList, // the array/list holding the dropdown options
        filterRef: this.publishedFilter, // the ref to form control binded to the filter
        isSelectionInput: false, // is it a dropdown input or a normal input/date
        displayKey: null, // the key displayed in the html (only applicable to array of objects)
        savedValue: null, // the value saved when user select an option (e.g. _id)
        resetValue: '',
      },
    ];
    this.filterBreadcrumbData = this.filterBreadCrumbService.filterBreadcrumbFormat(filterInfo, this.filterBreadcrumbData);
    console.log('cek data', this.filterBreadcrumbData);
  }
  removeFilterBreadcrumb(filterItem: FilterBreadCrumbItem) {
    if (filterItem) {
      this.filterBreadCrumbService.removeFilterBreadcrumb(filterItem, null, this.filteredValues);
      this.clearSelectIfFilter();
      this.getStepValidationData();
    }
  }
  clearSelectIfFilter() {
    this.selection.clear();
    this.dataSelected = [];
    this.isCheckedAll = false;
  }
}
