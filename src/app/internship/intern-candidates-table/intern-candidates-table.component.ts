import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { map } from 'rxjs/operators';
import { SubSink } from 'subsink';

@Component({
  selector: 'ms-intern-candidates-table',
  templateUrl: './intern-candidates-table.component.html',
  styleUrls: ['./intern-candidates-table.component.scss']
})
export class InternCandidatesTableComponent implements OnInit, OnDestroy {
  filterColumns: string[] = [
    'selectFilter',
    'jobTitleFilter',
    'offerDateFilter',
    'schoolFilter',
    'levelFilter',
    'typeFilter',
    'startDateFilter',
    'endDateFilter',
    'durationFilter',
    'brandFilter',
    'countryFilter',
    'publishedFilter',
    'candidateFilter',
    'questionAnsweredFilter',
    'dateApplyFilter',
    'dateInterviewFilter',
    'evaluationFilter',
    'conventionFilter',
    'actionFilter'
  ];
  displayedColumns: string[] = [
    'select',
    'jobTitle',
    'offerDate',
    'school',
    'level',
    'type',
    'startDate',
    'endDate',
    'duration',
    'brand',
    'country',
    'published',
    'candidate',
    'questionAnswered',
    'dateApply',
    'dateInterview',
    'evaluation',
    'convention',
    'action'
  ];

  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isCheckedAll = false;
  dataCount = 0;
  noData;

  private subs = new SubSink();
  flagsIconPath = '../../../../../assets/icons/flags-nationality/';
  isLoading: Boolean;

  internshipJobData = [
    {
      job_title: 'Press relations',
      offer_date: '2020-08-15T00:00:00.000Z',
      school: 'EFAP ICART',
      level: 'GE1 GE2',
      type: 'temporary',
      start_date: '2021-01-01T00:00:00.000Z',
      end_date: '2022-06-30T00:00:00.000Z',
      duration_in_weeks: 24,
      brand: 'Korean Telecom',
      job_country: 'south korea',
      published: false,
      candidate: 'Mr Georges Gerard',
      question_answered: false,
      date_of_apply: '2020-08-15T00:00:00.000Z',
      date_of_interview: '2021-09-22T00:00:00.000Z',
      evaluation: 'ok_ok',
      convention: '2021-12-15T00:00:00.000Z'
    },
    {
      job_title: 'Customer Service',
      offer_date: '2021-09-22T00:00:00.000Z',
      school: 'EFAP',
      level: 'MBA Lux',
      type: 'ongoing',
      start_date: null,
      end_date: null,
      duration_in_weeks: 32,
      brand: 'Body Shop',
      job_country: 'belgium',
      published: true,
      candidate: '',
      question_answered: true,
      date_of_apply: '2021-09-22T00:00:00.000Z',
      date_of_interview: false,
      evaluation: '',
      convention: ''
    },
    {
      job_title: 'Marketing Assistant',
      offer_date: '2019-09-01T00:00:00.000Z',
      school: 'BRASSARD',
      level: 'GE4 GE5',
      type: 'ongoing',
      start_date: null,
      end_date: null,
      duration_in_weeks: 32,
      brand: 'Dental Clinic',
      job_country: 'united kingdom',
      published: true,
      candidate: '',
      question_answered: true,
      date_of_apply: '2019-09-01T00:00:00.000Z',
      date_of_interview: false,
      evaluation: '',
      convention: ''
    },
  ]

  constructor(
    private pageTitleService: PageTitleService
  ) { }

  ngOnInit() {
    this.pageTitleService.setTitle('Candidatures');
    this.pageTitleService.setIcon('account-question-outline');

    this.dataSource.data = this.internshipJobData;
    this.paginator.length = this.internshipJobData.length;
    this.dataCount = this.internshipJobData.length;
    this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
  }

  ngOnDestroy(): void {
    this.pageTitleService.setTitle('');
    this.pageTitleService.setIcon('');
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

  isTypeString(data: any) {
    return typeof data === 'string';
  }

  isTypeBoolean(data: any) {
    return typeof data === 'boolean';
  }

}
