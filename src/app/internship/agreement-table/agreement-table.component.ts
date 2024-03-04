import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-agreement-table',
  templateUrl: './agreement-table.component.html',
  styleUrls: ['./agreement-table.component.scss'],
})
export class AgreementTableComponent implements OnInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  isLoading = false;
  dataCount = 0;
  noData;
  isCheckedAll = false;

  displayedColumns: string[] = [
    'select',
    'studentName',
    'currentProgram',
    'businessRelationName',
    'conventionRequest',
    'startDate',
    'endDate',
    'durationInWeeks',
    'brand',
    'jobTitle',
    'type',
    'jobCountry',
    'businessRelationStatus',
    'companyHR',
    'studentStatus',
    'conventionCompleted',
    'action',
  ];
  filterColumns: string[] = [
    'selectFilter',
    'studentNameFilter',
    'currentProgramFilter',
    'businessRelationNameFilter',
    'conventionRequestFilter',
    'startDateFilter',
    'endDateFilter',
    'durationInWeeksFilter',
    'brandFilter',
    'jobTitleFilter',
    'typeFilter',
    'jobCountryFilter',
    'businessRelationStatusFilter',
    'companyHRFilter',
    'studentStatusFilter',
    'conventionCompletedFilter',
    'actionFilter',
  ];

  maleIcon = '../../../assets/img/student_icon.png';
  femaleIcon = '../../../assets/img/student_icon_fem.png';
  greenHeartIcon = '../../../assets/img/enagement_icon_green.png';
  flagsIconPath = '../../../assets/icons/flags-nationality/';
  shieldAccountIcon = '../../../assets/img/shield-account.png';

  // dummyData = [
  //   {
  //     type: 'classic',
  //     student: {
  //       last_name: 'Smith',
  //       first_name: 'James',
  //       civility: 'mr',
  //     },
  //     nationality: 'French',
  //     program: '20-21 EFAPAR 1',
  //     engagement_level: 'lost',
  //     connection: 'done',
  //     cv: 'done',
  //     motivation_letter: 'done',
  //     video_profile: 'done',
  //     intern_profile: 'done'
  //   },
  //   {
  //     type: 'alternance',
  //     student: {
  //       last_name: 'Redford',
  //       first_name: 'Robert',
  //       civility: 'mr',
  //     },
  //     nationality: 'English',
  //     program: '21-22 EFATOU 2',
  //     engagement_level: 'high',
  //     connection: 'done',
  //     cv: 'done',
  //     motivation_letter: 'done',
  //     video_profile: 'done',
  //     intern_profile: 'done'
  //   },
  //   {
  //     type: 'special',
  //     student: {
  //       last_name: 'Jolie',
  //       first_name: 'Angelina',
  //       civility: 'mrs',
  //     },
  //     nationality: 'English',
  //     program: '20-21 ICABOR 1',
  //     engagement_level: 'medium',
  //     connection: '',
  //     cv: '',
  //     motivation_letter: '',
  //     video_profile: '',
  //     intern_profile: ''
  //   },
  // ]

  dummyData = [
    {
      job_title: 'Press relations',
      convention_request: '15/08',
      type: 'temporary',
      start_date: '01/01/21',
      end_date: '30/06/22',
      duration: 24,
      brand: 'Korean Telecom',
      business_relation_name: '',
      job_country: 'south korea',
      student_name: '',
      current_program: '20-21 EFAPAR 1',
      business_relation_status: 'done',
      company_hr: 'not done',
      student_status: '',
      convention_completed: '',
      convention_date: '30/06/22',
    },
    {
      job_title: 'Customer Service',
      convention_request: '22/09',
      type: 'ongoing',
      start_date: '',
      end_date: '',
      duration: 32,
      brand: 'Body Shop',
      business_relation_name: '',
      job_country: 'belgium',
      student_name: '',
      current_program: '21-22 EFATOU 2',
      business_relation_status: 'done',
      company_hr: 'done',
      student_status: 'not done',
      convention_completed: '',
      convention_date: '30/06/22',
    },
    {
      job_title: 'Marketing Assistant',
      convention_request: '01/09',
      type: 'ongoing',
      start_date: '',
      end_date: '',
      duration: 32,
      brand: 'Dental Clinic',
      business_relation_name: '',
      job_country: 'united kingdom',
      student_name: '',
      current_program: '20-21 ICABOR 1',
      business_relation_status: 'done',
      company_hr: 'done',
      student_status: 'done',
      convention_completed: 'done',
      convention_date: '30/06/22',
    },
  ];
  connectionFilterList = [
    { value: 'AllF', key: 'AllF' },
    { value: 'done', key: 'Done' },
    { value: 'not_done', key: 'Not done' },
  ];
  typeFilterList = [
    { value: 'All', key: 'AllS' },
    { value: 'classic', key: 'Classic' },
    { value: 'alternance', key: 'Alternance' },
    { value: 'special', key: 'Special' },
  ];

  constructor(private pageTitleService: PageTitleService, private translate: TranslateService) {}

  ngOnInit() {
    this.dataSource.data = this.dummyData;
    this.paginator.length = this.dummyData.length;

    this.pageTitleService.setTitle('Agreements');
    this.pageTitleService.setIcon('signature-freehand');
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
  }
  viewAggrement() {
    window.open('./internship-agreement/detail', '_blank');
  }
  amendmentAggrement() {
    window.open('./internship-agreement/detail?open=amendment', '_blank');
  }
}
