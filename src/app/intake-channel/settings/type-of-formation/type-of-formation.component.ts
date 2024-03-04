import { UtilityService } from 'app/service/utility/utility.service';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import * as _ from 'lodash';
import { map, startWith, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';
import { SelectionModel } from '@angular/cdk/collections';
import { Observable } from 'rxjs';
import { AddTypeOfFormationDialogComponent } from './add-type-of-formation-dialog/add-type-of-formation-dialog.component';
import { IntakeChannelService } from 'app/service/intake-channel/intake-channel.service';
import { PermissionService } from 'app/service/permission/permission.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'ms-type-of-formation',
  templateUrl: './type-of-formation.component.html',
  styleUrls: ['./type-of-formation.component.scss'],
})
export class TypeOfFormationComponent implements OnInit, OnDestroy, AfterViewInit {
  private subs = new SubSink();

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  selection = new SelectionModel<any>(true, []);
  dataSource = new MatTableDataSource([]);
  titleData: any;
  noData: any;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  sortValue = null;
  displayedColumns: string[] = [
    'select',
    'typeOfFormation',
    'sigle',
    'description',
    'admissionForm',
    'reAdmissionForm',
    'accounting',
    'action',
  ];
  filterColumns: string[] = [
    'selectFilter',
    'typeOfFormationFilter',
    'sigleFiler',
    'descriptionFilter',
    'admissionFormFilter',
    'reAdmissionFormFilter',
    'accountingFilter',
    'actionFilter',
  ];
  isWaitingForResponse = false;
  dataCount = 0;

  typeOfFormationCtrlListFiltered: Observable<any[]>;
  typeOfFormationCtrlList = [
    { value: 'classic', key: 'Initial Formation' },
    { value: 'continuous_total_funding', key: 'Continuous Formation - Total Funding' },
    { value: 'continuous_partial_funding', key: 'Continuous Formation - Partial Funding' },
    { value: 'continuous_personal_funding', key: 'Continuous Formation - Personal Funding' },
  ];

  filteredValues = {
    type_of_information: '',
    type_of_formation: null,
    scholar_season_id: '',
  };
  typeOfFormationCtrl = new UntypedFormControl('');
  scholarSeasonId: any;
  timeOutVal: any;
  allInternshipId = [];
  isCheckedAll: boolean;
  disabledExport: boolean;
  dataSelected: any[] = [];
  dataSelectedId: any[];
  selectType: any;
  isLoading = false;

  userSelected = [];
  userSelectedId = [];

  pageSelected = [];
  allStudentForCheckbox = [];
  dataUnselectUser = [];
  allExportForCheckbox = [];
  currentUserTypeId: any;

  constructor(
    private pageTitleService: PageTitleService,
    private translate: TranslateService,
    private dialog: MatDialog,
    private utilityService: UtilityService,
    private intakeChannelService: IntakeChannelService,
    public permissionService: PermissionService,
    private userService: AuthService,
    private httpClient: HttpClient,
  ) {}

  ngOnInit() {
    const currentUser = this.userService.getLocalStorageUser();
    const isPermission = this.userService.getPermission();
    const currentUserEntity = currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

    this.pageTitleService.setTitle(
      this.translate.instant('INTAKE_CHANNEL.PAGE_TITLE.Settings') + ' - ' + this.translate.instant('ADMISSION.Type Of formation'),
    );
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.pageTitleService.setTitle(
        this.translate.instant('INTAKE_CHANNEL.PAGE_TITLE.Settings') + ' - ' + this.translate.instant('ADMISSION.Type Of formation'),
      );
    });

    this.getDataTypeOfFormation();
    this.initFilter();
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getDataTypeOfFormation();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getDataTypeOfFormation() {
    this.dataSelected = [];
    this.dataSelectedId = [];
    this.allInternshipId = [];
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };

    this.filteredValues.scholar_season_id = '';

    this.subs.sink = this.intakeChannelService.getAllTypeOfInformation(pagination, this.filteredValues).subscribe(
      (res) => {
        if (res && res.length) {
          this.dataSource.data = res;
          this.paginator.length = res[0].count_document;
          this.dataCount = res[0].count_document;
          this.disabledExport = true;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
          this.disabledExport = true;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
      },
      (error) => {
        // Record error log
        this.userService.postErrorLog(error);
        this.isWaitingForResponse = false;
        this.dataSource.data = [];
        this.paginator.length = 0;
        this.dataCount = 0;
        this.disabledExport = true;
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

  initFilter() {
    this.typeOfFormationCtrlListFiltered = this.typeOfFormationCtrl.valueChanges.pipe(
      startWith(''),
      map((searchText) =>
        this.typeOfFormationCtrlList.filter((type) =>
          type
            ? this.utilityService
                .simplifyRegex(this.translate.instant('type_formation.' + type.value))
                .toLowerCase()
                .includes(searchText.toString().toLowerCase())
            : true,
        ),
      ),
    );
  }

  resetFilter() {
    this.selection.clear();
    this.isCheckedAll = false;
    this.filteredValues = {
      type_of_information: '',
      type_of_formation: null,
      scholar_season_id: '',
    };
    this.typeOfFormationCtrl.setValue(null, { emitEvent: false });
    this.getDataTypeOfFormation();
    this.dataSelected = [];
    this.dataSelectedId = [];
    this.paginator.pageIndex = 0;
    this.dataUnselectUser = [];
    this.allExportForCheckbox = [];
  }

  onOpenAddTypeOfFormationDialog(isEdit, data?) {
    let updatedData;

    const dummy = {
      _id: '627e16652338f207032ab937',
      form_builder_name: 'FC - Financement total_VF5',
    };

    if (isEdit) {
      updatedData = _.cloneDeep(data);
      updatedData.admission_form_id = data.admission_form_id ? data.admission_form_id._id : null;
      updatedData.readmission_form_id = data.readmission_form_id ? data.readmission_form_id._id : null;
    }

    const dialogRef = this.dialog.open(AddTypeOfFormationDialogComponent, {
      width: '750px',
      minHeight: '100px',
      disableClose: true,
      data: {
        isEdit: isEdit,
        scholarSeasonId: this.scholarSeasonId,
        typeOfFormationData: updatedData,
        allDataFormation: this.dataSource.data,
        selectedAdmissionForm: data && data.admission_form_id ? data.admission_form_id : null,
        selectedReAdmissionForm: data && data.readmission_form_id ? data.readmission_form_id : null,
      },
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        if (!this.isReset) {
          this.getDataTypeOfFormation();
        }
      }
    });
  }

  onDelete(data) {
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('TYPEFORMATION_S1.TITLE'),
      html: this.translate.instant('TYPEFORMATION_S1.TEXT', {
        name: data.type_of_information ? this.translate.instant('type_formation.' + data.type_of_information) : '',
      }),
      type: 'info',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('TYPEFORMATION_S1.BUTTON1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('TYPEFORMATION_S1.BUTTON2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('TYPEFORMATION_S1.BUTTON1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('TYPEFORMATION_S1.BUTTON1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        this.subs.sink = this.intakeChannelService.deleteTypeOfInformation(data._id).subscribe(
          (ress) => {
            if (ress) {
              Swal.fire({
                type: 'success',
                title: this.translate.instant('Bravo!'),
                confirmButtonText: this.translate.instant('OK'),
                allowEnterKey: false,
                allowEscapeKey: false,
                allowOutsideClick: false,
              }).then(() => {
                this.selection.clear();
                this.isCheckedAll = false;
                this.getDataTypeOfFormation();
              });
            }
          },
          (err) => {
            // Record error log
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
            if (err['message'] === 'GraphQL error: Type of formation already assigned to registration profile') {
              Swal.fire({
                title: this.translate.instant('TYPEFORMATION_S1a.TITLE'),
                html: this.translate.instant('TYPEFORMATION_S1a.TEXT'),
                type: 'info',
                showConfirmButton: true,
                confirmButtonText: this.translate.instant('TYPEFORMATION_S1a.BUTTON1'),
              }).then(() => {});
            } else {
              this.showSwalError(err);
            }
          },
        );
      }
    });
  }

  showSwalError(err) {
    // TO DO: Translate when SWAL is available in documentation
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
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows || numSelected > numRows;
  }

  masterToggle() {
    if (this.isAllSelected() || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length)) {
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
      this.dataUnselectUser = [];
      this.allExportForCheckbox = [];
      /* this.getDataAllForCheckbox(0); */
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
    const filter = _.cloneDeep(this.filteredValues);
    this.subs.sink = this.intakeChannelService.getAllTypeOfInformation(pagination, filter).subscribe(
      (info) => {
        if (info && info.length) {
          this.allStudentForCheckbox.push(...info);
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
        this.isWaitingForResponse = false;
        // Record error log
        this.userService.postErrorLog(error);
        if (error && error['message'] && error['message'].includes('Network error: Http failure response for')) {
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
            text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
            confirmButtonText: this.translate.instant('OK'),
          });
        }
      },
    );
  }

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

  downloadCSV() {
    if (
      this.dataSelected &&
      this.dataSelected.length < 1 &&
      (!this.isCheckedAll || (this.isCheckedAll && this.dataUnselectUser && this.dataUnselectUser.length))
    ) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Admission') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });

      return;
    } else {
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
            if ((<HTMLInputElement>e.target).value) {
              Swal.enableConfirmButton();
            }
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
    const importStudentTemlate = `downloadTypeOfFormation/`;
    const filter = this.cleanFilterDataCSV();
    let filtered;
    if (
      (this.dataSelected && this.dataSelected.length && !this.isCheckedAll) ||
      (this.dataUnselectUser && this.dataUnselectUser.length) ||
      (this.allStudentForCheckbox && this.allStudentForCheckbox.length && this.selectType === 'one')
    ) {
      const mappedUserId = this.dataSelected.map((res) => `"` + res._id + `"`);
      const billing = `"type_of_information_ids":` + '[' + mappedUserId.toString() + ']';
      filtered = filter.slice(0, 8) + billing + '}';
    } else if (this.isCheckedAll) {
      filtered = filter;
    }

    let sorting;
    if (this.sortValue) {
      sorting = `sorting=${this.sortValue}`;
    } else {
      sorting = `sorting={}`;
    }
    const fullURL =
      url + importStudentTemlate + fileType + '/' + lang + '?' + filtered + '&' + sorting + '&' + `user_type_id="${this.currentUserTypeId}"`;
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
            title: this.translate.instant('ReAdmission_S3.TITLE'),
            text: this.translate.instant('ReAdmission_S3.TEXT'),
            confirmButtonText: this.translate.instant('ReAdmission_S3.BUTTON'),
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
      },
    );
  }

  hendleSelected(value) {
    if (value && value !== 'AllS') {
      this.filteredValues.type_of_formation = value;
      this.getDataTypeOfFormation();
    } else {
      this.filteredValues.type_of_formation = null;
      this.getDataTypeOfFormation();
    }
  }

  displayFn(arg) {
    if (arg) {
      const found = this.typeOfFormationCtrlList.find((data) => data.value.toLowerCase().trim().includes(arg));
      if (found) {
        const value = this.translate.instant('type_formation.' + found.value);
        return value;
      } else {
        return arg;
      }
    } else {
      return arg;
    }
  }

  getAllIdForCheckbox(pageNumber) {
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

        this.isWaitingForResponse = true;

        this.subs.sink = this.intakeChannelService.GetAllTypeInformationIntakeChannelIdCheckbox(this.filteredValues, pagination).subscribe(
          (admissions: any) => {
            if (admissions && admissions.length) {
              const resp = _.cloneDeep(admissions);
              this.allExportForCheckbox = _.concat(this.allExportForCheckbox, resp);
              const page = pageNumber + 1;
              this.getAllIdForCheckbox(page);
            } else {
              this.isWaitingForResponse = false;
              if (this.isCheckedAll) {
                if (this.allExportForCheckbox && this.allExportForCheckbox.length) {
                  this.dataSelected = this.allExportForCheckbox.filter((list) => !this.dataUnselectUser.includes(list._id));
                  this.dataSelected = _.uniqBy(this.dataSelected, '_id');
                  if (this.dataSelected && this.dataSelected.length) {
                    this.downloadCSV();
                  }
                }
              }
            }
          },
          (error) => {
            console.log('error download csv');
            console.log(error);
            this.isReset = false;
            this.isLoading = false;
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
              confirmButtonText: this.translate.instant('OK'),
            });
          },
        );
      }
    } else {
      this.downloadCSV();
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
