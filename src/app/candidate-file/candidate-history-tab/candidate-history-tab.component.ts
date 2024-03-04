import { Observable } from 'rxjs';
import * as _ from 'lodash';
import { debounceTime, map } from 'rxjs/operators';
import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { MatDialogRef, MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SubSink } from 'subsink';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { UntypedFormControl } from '@angular/forms';
import { CandidatesHistoryService } from 'app/service/candidates-history/candidates-history.service';
import { SelectionModel } from '@angular/cdk/collections';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ms-candidate-history-tab',
  templateUrl: './candidate-history-tab.component.html',
  styleUrls: ['./candidate-history-tab.component.scss'],
})
export class CandidateHistoryTabComponent implements OnInit {
  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = ['select', 'date', 'time', 'action', 'notification', 'admissionMember', 'actions'];
  filterColumns: String[] = [
    'selectFilter',
    'dateFilter',
    'timeFilter',
    'actionFilter',
    'notificationFilter',
    'admissionMemberFilter',
    'actionsFilter',
  ];
  maleIcon = '../../../../../assets/img/student_icon.png';
  femaleIcon = '../../../../../assets/img/student_icon_fem.png';
  yesterdayIcon = '../../../../../assets/img/icon-yesterday.png';
  last7DaysIcon = '../../../../../assets/img/icon-7-days.png';
  last30DaysIcon = '../../../../../assets/img/icon-30-days.png';
  thisMonthIcon = '../../../../../assets/img/icon-this-month.png';

  actionFilter = new UntypedFormControl('AllF');
  notificationFilter = new UntypedFormControl('');
  admissionMemberFilter = new UntypedFormControl('');
  dateFilter = new UntypedFormControl('');
  timeFilter = new UntypedFormControl('');
  selection = new SelectionModel<any>(true, []);
  filteredValues = {
    action: '',
    admission_member: '',
    email_address: '',
  };
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  config: MatDialogConfig = {
    disableClose: true,
    width: '600px',
  };
  dataCount = 0;
  private subs = new SubSink();
  noData: any;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  sortValue = null;
  exportName: 'Export';
  selectType: any;
  entityData: any;
  userSelected: any[];
  disableExport = true;
  disableToday = true;
  disableYesterday = true;
  disableLast7Days = true;
  disableLast30Days = true;
  disableThisMonth = true;
  titleList = [];
  originalTitleList = [];
  schoolList = [];
  originalCandidateList = [];
  isLoading: Boolean;

  constructor(private candidatesHistoryService: CandidatesHistoryService, private dialog: MatDialog, private translate: TranslateService) {}
  ngOnInit() {
    this.getCandidatesHistoryData();
  }
  ngAfterViewInit() {}

  getCandidatesHistoryData() {
    /*this.isLoading = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
		const filter = this.cleanFilterData();*/
    this.subs.sink = this.candidatesHistoryService.getCandidatesHistory('pagination', this.sortValue, 'filter').subscribe(
      (histories) => {
        // console.log(candidates);
        if (histories && histories.length) {
          this.dataSource.data = histories;
          this.paginator.length = 1;
          this.dataCount = histories.length;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
      },
      (err) => {
        this.dataSource.data = [];
        this.paginator.length = 0;
        this.dataCount = 0;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
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
    if (numSelected) this.enableAllTopActions();
    else this.disableAllTopActions();

    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach((row) => this.selection.select(row));
    if (this.selection.hasValue() && !this.isAllSelected()) {
      this.enableAllTopActions();
    } else this.disableAllTopActions();
  }

  initFilter() {}
  // disable all top action buttons
  disableAllTopActions() {
    this.disableExport = true;
    this.disableToday = true;
    this.disableYesterday = true;
    this.disableLast7Days = true;
    this.disableLast30Days = true;
    this.disableThisMonth = true;
  }
  enableAllTopActions() {
    this.disableExport = false;
    this.disableToday = false;
    this.disableYesterday = false;
    this.disableLast7Days = false;
    this.disableLast30Days = false;
    this.disableThisMonth = false;
  }
  cleanFilterData() {
    console.log(this.filteredValues);
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key]) {
        if (key === 'full_name' || key === 'candidate_id') {
          filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
          // filterQuery = filterData[key];
        } else {
          filterQuery = filterQuery + ` ${key}:${filterData[key]}`;
          //filterQuery = filterData[key];
        }
      }
    });
    return filterQuery;
    // return 'filter: {' + filterQuery + '}';
  }
}
