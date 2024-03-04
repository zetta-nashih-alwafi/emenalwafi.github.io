import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, Input, OnChanges, OnInit, Output, ViewChild,EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { TeacherManagementService } from 'app/service/teacher-management/teacher-management.service';
import { startWith, tap, map } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { PermissionService } from 'app/service/permission/permission.service';
import { UntypedFormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';
import { AddTypeInterventionTeacherDialogComponent } from './add-type-intervention-teacher-dialog/add-type-intervention-teacher-dialog.component';
import { AuthService } from 'app/service/auth-service/auth.service';
import { SholarSeasonDialogComponent } from './sholar-season-dialog/sholar-season-dialog.component';

@Component({
  selector: 'ms-user-details-teacher-details',
  templateUrl: './user-details-teacher-details.component.html',
  styleUrls: ['./user-details-teacher-details.component.scss'],
})
export class UserDetailsTeacherDetailsComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() userId: string;
  @Input() scholarSeasonId;
  @Output() selectedScholarSeason: EventEmitter<String> = new EventEmitter();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  private subs = new SubSink();
  private timeOutVal: any;

  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = ['select', 'scholarSeason', 'legalEntity', 'typeOfIntervention', 'hourlyRate', 'typeOfContract', 'action'];
  filterColumns: string[] = [
    'selectFilter',
    'scholarSeasonFilter',
    'legalEntityFilter',
    'typeOfInterventionFilter',
    'hourlyRateFilter',
    'typeOfContractFilter',
    'actionFilter',
  ];
  selection = new SelectionModel<any>(true, []);
  isCheckedAll = false;
  isWaitingForResponse = false;
  isReset = false;
  dataLoaded = false;
  sortValue = null;
  filteredValues = {
    teacher_id: '',
    scholar_season_id: [],
    legal_entity_id: [],
    type_of_intervention: [],
    type_of_contract: [],
  };
  teacherCount;
  noData;
  disabledActions = false;

  scholarSeasonDropdown = [];
  legalEntityDropdown = [];
  typeOfInterventionDropdown = [];
  typeOfContractDropdown = [];
  dataSelected = [];
  allIntervention = [];

  legalEntityFilter = new UntypedFormControl('');
  typeOfInterventionFilter = new UntypedFormControl('');
  typeOfContractFilter = new UntypedFormControl('');
  tempDataFilter = {
    type_of_intervention: null,
    type_of_contract: null,
    legal_entity_id: null,
  };

  constructor(
    public translate: TranslateService,
    private teacherService: TeacherManagementService,
    public permission: PermissionService,
    private dialog: MatDialog,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.getAllTypeOfIntervention();
    this.getAllTypeOfInterventionDropdown();
  }

  ngAfterViewInit(): void {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            this.getAllTypeOfIntervention();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  ngOnChanges() {
    this.reset();
    this.getAllTypeOfIntervention();
    this.getAllTypeOfInterventionDropdown();
  }

  getAllTypeOfIntervention() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    this.filteredValues.teacher_id = this.userId;
    this.filteredValues.scholar_season_id = this.scholarSeasonId?._id ? [this.scholarSeasonId?._id] : [];
    this.subs.sink = this.teacherService.getAllTypeOfIntervention(pagination, this.filteredValues, this.sortValue).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.dataSource.data = _.cloneDeep(resp);
          this.teacherCount = resp && resp.length ? resp[0].count_document : 0;
        } else {
          this.dataSource.data = [];
          this.teacherCount = 0;
        }

        this.noData = this.dataSource.connect().pipe(map((data) => data.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
      },
      (err) => {
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

  getAllTypeOfInterventionDropdown() {
    this.isWaitingForResponse = true;
    this.filteredValues.teacher_id = this.userId;
    this.subs.sink = this.teacherService.getAllTypeOfInterventionDropdownData(this.filteredValues).subscribe(
      (resp) => {
        if (resp && resp.length) {
          this.scholarSeasonDropdown = [];
          this.legalEntityDropdown = [];
          this.typeOfInterventionDropdown = [];
          this.typeOfContractDropdown = [];
          resp.forEach((element) => {
            if (element && element.scholar_season_id) this.scholarSeasonDropdown.push(element.scholar_season_id);
            if (element && element.legal_entity_id) this.legalEntityDropdown.push(element.legal_entity_id);
            if (element && element.type_of_intervention) this.typeOfInterventionDropdown.push(element.type_of_intervention);
            if (element && element.type_of_contract) this.typeOfContractDropdown.push(element.type_of_contract);
          });
          this.scholarSeasonDropdown = _.uniqBy(this.scholarSeasonDropdown, '_id');
          this.legalEntityDropdown = _.uniqBy(this.legalEntityDropdown, '_id');
          this.typeOfInterventionDropdown = this.typeOfInterventionDropdown.filter((val, ind, arr) => arr.indexOf(val) === ind);
          this.typeOfContractDropdown = this.typeOfContractDropdown.filter((val, ind, arr) => arr.indexOf(val) === ind);

          this.scholarSeasonDropdown = _.sortBy(this.scholarSeasonDropdown, ['scholar_season']);
          this.legalEntityDropdown = _.sortBy(this.legalEntityDropdown, ['legal_entity_name']);
          this.typeOfInterventionDropdown = _.sortBy(this.typeOfInterventionDropdown);
          this.typeOfContractDropdown = _.sortBy(this.typeOfContractDropdown);

          this.typeOfInterventionDropdown = this.typeOfInterventionDropdown?.map((resp) => {
            return {
              value: resp,
              label: this.translate.instant(resp),
            };
          });

          this.typeOfContractDropdown = this.typeOfContractDropdown?.map((resp) => {
            return {
              value: resp,
              label: this.translate.instant(resp),
            };
          });
        } else {
          this.scholarSeasonDropdown = [];
          this.legalEntityDropdown = [];
          this.typeOfInterventionDropdown = [];
          this.typeOfContractDropdown = [];
        }
        this.isReset = false;
        this.isWaitingForResponse = false;
      },
      (err) => {
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

  isAllDropdownSelected(type) {
    if (type === 'legalEntity') {
      const selected = this.legalEntityFilter?.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.legalEntityDropdown?.length;
      return isAllSelected;
    } else if (type === 'contract') {
      const selected = this.typeOfContractFilter?.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.typeOfContractDropdown?.length;
      return isAllSelected;
    } else if (type === 'intervention') {
      const selected = this.typeOfInterventionFilter?.value;
      const isAllSelected = selected && selected.length !== 0 && selected.length === this.typeOfInterventionDropdown?.length;
      return isAllSelected;
    }
  }

  isSomeDropdownSelected(type) {
    if (type === 'legalEntity') {
      const selected = this.legalEntityFilter?.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.legalEntityDropdown?.length;
      return isIndeterminate;
    } else if (type === 'contract') {
      const selected = this.typeOfContractFilter?.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.typeOfContractDropdown?.length;
      return isIndeterminate;
    } else if (type === 'intervention') {
      const selected = this.typeOfInterventionFilter?.value;
      const isIndeterminate = selected && selected.length !== 0 && selected.length !== this.typeOfInterventionDropdown?.length;
      return isIndeterminate;
    }
  }

  selectAllData(event, type) {
    if (type === 'legalEntity') {
      if (event?.checked) {
        const legalData = this.legalEntityDropdown?.map((el) => el?._id);
        this.legalEntityFilter?.patchValue(legalData);
      } else {
        this.legalEntityFilter?.patchValue(null);
      }
    } else if (type === 'contract') {
      if (event?.checked) {
        const contractData = this.typeOfContractDropdown?.map((el) => el?.value);
        this.typeOfContractFilter?.patchValue(contractData);
      } else {
        this.typeOfContractFilter?.patchValue(null);
      }
    } else if (type === 'intervention') {
      if (event?.checked) {
        const interventionData = this.typeOfInterventionDropdown?.map((el) => el?.value);
        this.typeOfInterventionFilter?.patchValue(interventionData);
      } else {
        this.typeOfInterventionFilter?.patchValue(null);
      }
    }
  }

  setLegalEntityFilter() {
    const isSame = JSON.stringify(this.tempDataFilter?.legal_entity_id) === JSON.stringify(this.legalEntityFilter?.value);
    if (isSame) {
      return;
    } else if (this.legalEntityFilter?.value?.length) {
      this.filteredValues.legal_entity_id = this.legalEntityFilter?.value;
      this.tempDataFilter.legal_entity_id = this.legalEntityFilter?.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllTypeOfIntervention();
      }
    } else {
      if (this.tempDataFilter?.legal_entity_id?.length && !this.legalEntityFilter?.value?.length) {
        this.filteredValues.legal_entity_id = this.legalEntityFilter?.value;
        this.tempDataFilter.legal_entity_id = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllTypeOfIntervention();
        }
      } else {
        return;
      }
    }
  }

  setInterventionFilter() {
    const isSame = JSON.stringify(this.tempDataFilter?.type_of_intervention) === JSON.stringify(this.typeOfInterventionFilter?.value);
    if (isSame) {
      return;
    } else if (this.typeOfInterventionFilter?.value?.length) {
      this.filteredValues.type_of_intervention = this.typeOfInterventionFilter?.value;
      this.tempDataFilter.type_of_intervention = this.typeOfInterventionFilter?.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllTypeOfIntervention();
      }
    } else {
      if (this.tempDataFilter?.type_of_intervention?.length && !this.typeOfInterventionFilter?.value?.length) {
        this.filteredValues.type_of_intervention = this.typeOfInterventionFilter?.value;
        this.tempDataFilter.type_of_intervention = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllTypeOfIntervention();
        }
      } else {
        return;
      }
    }
  }

  setContractFilter() {
    const isSame = JSON.stringify(this.tempDataFilter?.type_of_contract) === JSON.stringify(this.typeOfContractFilter?.value);
    if (isSame) {
      return;
    } else if (this.typeOfContractFilter?.value?.length) {
      this.filteredValues.type_of_contract = this.typeOfContractFilter?.value;
      this.tempDataFilter.type_of_contract = this.typeOfContractFilter?.value;
      if (!this.isReset) {
        this.paginator.pageIndex = 0;
        this.getAllTypeOfIntervention();
      }
    } else {
      if (this.tempDataFilter?.type_of_contract?.length && !this.typeOfContractFilter?.value?.length) {
        this.filteredValues.type_of_contract = this.typeOfContractFilter?.value;
        this.tempDataFilter.type_of_contract = null;
        if (!this.isReset) {
          this.paginator.pageIndex = 0;
          this.getAllTypeOfIntervention();
        }
      } else {
        return;
      }
    }
  }

  // Whether the number of selected elements matches the total number of rows.
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows || numSelected > numRows;
  }

  // Selects all rows if they are not all selected; otherwise clear selection.
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      this.isCheckedAll = false;
      this.disabledActions = false;
    } else {
      this.disabledActions = true;
      this.isCheckedAll = true;
      this.allIntervention = [];
      // this.dataSource.data.forEach((row) => this.selection.select(row._id));
      this.getAllDataForCheckBox(0);
    }
  }

  getAllDataForCheckBox(pageNumber) {
    const pagination = {
      limit: 300,
      page: pageNumber,
    };
    this.isWaitingForResponse = true;
    this.subs.sink = this.teacherService.getAllTypeOfIntervention(pagination, this.filteredValues, this.sortValue).subscribe(
      (teachers) => {
        if (teachers && teachers.length) {
          this.allIntervention.push(...teachers);
          const page = pageNumber + 1;
          this.getAllDataForCheckBox(page);
        } else {
          this.isWaitingForResponse = false;
          if (this.isCheckedAll) {
            if (this.allIntervention && this.allIntervention.length) {
              this.allIntervention.forEach((element) => {
                this.selection.select(element._id);
                this.dataSelected.push(element);
              });
              this.disabledActions = true;
            }
          }
        }
      },
      (error) => {
        this.authService.postErrorLog(error);
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: error && error['message'] ? this.translate.instant(error['message'].replaceAll('GraphQL error: ', '')) : error,
          confirmButtonText: this.translate.instant('OK'),
        });
      },
    );
  }

  // The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  selected() {
    const numSelected = this.selection.selected.length;
    this.disabledActions = numSelected > 0;

    this.isCheckedAll = this.selection.selected.length === this.teacherCount;
  }

  csvDownloadTeacher() {
    if (this.selection.selected.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Intervention') }),
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
            // console.log('Value:::::::::::', (<HTMLInputElement>e.target).value);
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
    const filter = this.cleanFilterDataDownload();
    let filtered;
    if (this.selection.selected.length && !this.isCheckedAll) {
      const mappedUserId = this.selection.selected.map((res) => `"` + res + `"`);
      const billing = `"type_of_intervention_id":` + '[' + mappedUserId.toString() + ']';
      if (filter.length > 9) {
        filtered = filter.slice(0, 8) + billing + ',' + filter.slice(8);
      } else {
        filtered = filter.slice(0, 8) + billing + filter.slice(8);
      }
    } else if (this.isCheckedAll) {
      filtered = filter;
    }
    // console.log('_fil', filtered);

    const exportTeachersData = `downloadTypeOfInterventionCSV/`;
    let fullURL;
    if (filtered) {
      fullURL = url + exportTeachersData + fileType + '/' + lang + '?' + filtered;
    } else {
      fullURL = url + exportTeachersData + fileType + '/' + lang;
    }
    // console.log('fullURL', fullURL);
    element.href = encodeURI(fullURL);
    element.target = '_blank';
    element.download = 'Intervention Export CSV';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  cleanFilterDataDownload() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    let scholarMap;
    let legalMap;
    let interventionMap;
    let contractMap;
    // delete filterData.teacher_id;
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] && filterData[key].length !== 0) {
        if (key === 'scholar_season_id') {
          scholarMap = filterData.scholar_season_id.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"scholar_season_id":[${scholarMap}]`
            : filterQuery + `"scholar_season_id":[${scholarMap}]`;
        } else if (key === 'legal_entity_id') {
          legalMap = filterData.legal_entity_id.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"legal_entity_id":[${legalMap}]`
            : filterQuery + `"legal_entity_id":[${legalMap}]`;
        } else if (key === 'type_of_intervention') {
          interventionMap = filterData.type_of_intervention.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"type_of_intervention":[${interventionMap}]`
            : filterQuery + `"type_of_intervention":[${interventionMap}]`;
        } else if (key === 'type_of_contract') {
          contractMap = filterData.type_of_contract.map((res) => `"` + res + `"`);
          filterQuery = filterQuery
            ? filterQuery + ',' + `"type_of_contract":[${contractMap}]`
            : filterQuery + `"type_of_contract":[${contractMap}]`;
        } else {
          filterQuery = filterQuery ? filterQuery + ',' + `"${key}":"${filterData[key]}"` : filterQuery + `"${key}":"${filterData[key]}"`;
        }
        // filterQuery = filterQuery ? filterQuery + ',' + `"${key}":["${filterData[key]}"]` : filterQuery + `"${key}":["${filterData[key]}"]`;
      }
    });
    return 'filter={' + filterQuery + '}';
  }

  // -------------------- SORT DATA START --------------------
  sortData(sort: Sort) {
    this.sortValue = sort.active ? { [sort.active]: sort.direction ? sort.direction : `asc` } : null;
    this.paginator.pageIndex = 0;
    this.getAllTypeOfIntervention();
  }

  // -------------------- RESET START --------------------
  reset() {
    this.isReset = true;
    this.selection.clear();
    this.isCheckedAll = false;
    this.paginator.pageIndex = 0;
    this.filteredValues = {
      teacher_id: '',
      scholar_season_id: [],
      legal_entity_id: [],
      type_of_intervention: [],
      type_of_contract: [],
    };
    this.tempDataFilter = {
      type_of_intervention: null,
      type_of_contract: null,
      legal_entity_id: null,
    };
    this.filteredValues.scholar_season_id = this.scholarSeasonId?._id ? [this.scholarSeasonId?._id] : [];
    this.sortValue = null;
    this.sort.direction = '';
    this.sort.active = '';
    this.disabledActions = false;
    this.legalEntityFilter.setValue(null, { emitEvent: false });
    this.typeOfInterventionFilter.setValue(null, { emitEvent: false });
    this.typeOfContractFilter.setValue(null, { emitEvent: false });
    this.scholarSeasonDropdown = [];
    this.legalEntityDropdown = [];
    this.typeOfInterventionDropdown = [];
    this.typeOfContractDropdown = [];
    this.getAllTypeOfInterventionDropdown();
    this.getAllTypeOfIntervention();
  }

  addIntervention() {
    const title = 'Add type of intervention';
    this.subs.sink = this.dialog
      .open(AddTypeInterventionTeacherDialogComponent, {
        width: '600px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: {
          type: 'add',
          title: title,
          userId: this.userId,
          selectedScholarSeason:this.scholarSeasonId?._id
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getAllTypeOfIntervention();
          this.getAllTypeOfInterventionDropdown();
        }
      });
  }

  editIntervention(data) {
    const title = 'Edit type of intervention';
    this.subs.sink = this.dialog
      .open(AddTypeInterventionTeacherDialogComponent, {
        width: '600px',
        minHeight: '100px',
        panelClass: 'certification-rule-pop-up',
        disableClose: true,
        data: {
          type: 'edit',
          title: title,
          userId: this.userId,
          interventionData: data,
          selectedScholarSeason:this.scholarSeasonId?._id
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.getAllTypeOfIntervention();
          this.getAllTypeOfInterventionDropdown();
        }
      });
  }

  deleteIntervention(intervention) {
    const data = {
      scholar_season: intervention.scholar_season_id ? intervention.scholar_season_id.scholar_season : '',
      legal_entity: intervention.legal_entity_id ? intervention.legal_entity_id.legal_entity_name : '',
      type_of_intervention: intervention.type_of_intervention ? this.translate.instant(intervention.type_of_intervention) : '',
      hourly_rate: intervention.hourly_rate ? intervention.hourly_rate : '',
      type_of_contract: intervention.type_of_contract ? this.translate.instant(intervention.type_of_contract) : '',
    };
    if (intervention && intervention._id) {
      let timeDisabled = 3;
      Swal.fire({
        title: this.translate.instant('Type_of_Intervention_S3.TITLE'),
        html: this.translate.instant('Type_of_Intervention_S3.TEXT', { ...data }),
        type: 'warning',
        allowEscapeKey: true,
        showCancelButton: true,
        confirmButtonText: this.translate.instant('Type_of_Intervention_S3.BUTTON1', { timer: timeDisabled }),
        cancelButtonText: this.translate.instant('Type_of_Intervention_S3.BUTTON2'),
        allowOutsideClick: false,
        allowEnterKey: false,
        onOpen: () => {
          Swal.disableConfirmButton();
          const confirmBtnRef = Swal.getConfirmButton();
          const intVal = setInterval(() => {
            timeDisabled -= 1;
            confirmBtnRef.innerText = this.translate.instant('Type_of_Intervention_S3.BUTTON1') + ` (${timeDisabled})`;
          }, 1000);

          this.timeOutVal = setTimeout(() => {
            confirmBtnRef.innerText = this.translate.instant('Type_of_Intervention_S3.BUTTON1');
            Swal.enableConfirmButton();
            clearInterval(intVal);
            clearTimeout(this.timeOutVal);
          }, timeDisabled * 1000);
        },
      }).then(
        (res) => {
          clearTimeout(this.timeOutVal);
          if (res.value) {
            this.subs.sink = this.teacherService.deleteIntervention(intervention._id).subscribe(
              (resp) => {
                Swal.fire({
                  type: 'success',
                  title: 'Bravo!',
                  confirmButtonText: 'OK',
                  allowEnterKey: false,
                  allowEscapeKey: false,
                  allowOutsideClick: false,
                }).then(() => {
                  this.getAllTypeOfIntervention();
                  this.getAllTypeOfInterventionDropdown();
                });
              },
              (error) => {
                this.authService.postErrorLog(error);
                // console.log(error.message);
                if (error.message && error.message === 'GraphQL error: Teacher subject already assigned to type of intervention') {
                  Swal.fire({
                    type: 'warning',
                    title: this.translate.instant('Type_of_Intervention_S4.TITLE'),
                    text: this.translate.instant('Type_of_Intervention_S4.TEXT'),
                    confirmButtonText: this.translate.instant('Type_of_Intervention_S4.BUTTON 1'),
                    allowEnterKey: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
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
        },
        (error) => {
          if (error.message && error.message === 'GraphQL error: Teacher subject already assigned to type of intervention') {
            Swal.fire({
              type: 'warning',
              title: this.translate.instant('SORRY'),
              text: this.translate.instant('Teacher subject already assigned to type of intervention'),
              confirmButtonText: this.translate.instant('Okay'),
              allowEnterKey: false,
              allowEscapeKey: false,
              allowOutsideClick: false,
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
  }
  duplicateIntervention() {
    if (!this.selection?.selected?.length) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('Intervention') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
      return;
    }
    this.subs.sink = this.dialog
      .open(SholarSeasonDialogComponent, {
        width: '600px',
        disableClose: true,
        autoFocus: false,
        panelClass:'certification-rule-pop-up',
        data: {
          scholarSeasonId: this.scholarSeasonId,
          interventions: this.selection?.selected?.length ? this.selection.selected : null,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.selectedScholarSeason.emit(resp)
        }
      });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
