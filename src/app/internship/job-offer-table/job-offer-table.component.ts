import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { JobOfferService } from 'app/service/internship/job-offer.service';
import { map } from 'rxjs/operators';
import { SubSink } from 'subsink';

@Component({
  selector: 'ms-job-offer-table',
  templateUrl: './job-offer-table.component.html',
  styleUrls: ['./job-offer-table.component.scss']
})
export class JobOfferTableComponent implements OnInit, OnDestroy {
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
    'companyFilter',
    'brandFilter',
    'industryFilter',
    'cityFilter',
    'countryFilter',
    'schoolValidationFilter',
    'publishedFilter',
    'viewsFilter',
    'applicationsFilter',
    'interviewsFilter',
    'agreementRequestFilter',
    'agreementSignedFilter',
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
    'company',
    'brand',
    'industry',
    'city',
    'country',
    'schoolValidation',
    'published',
    'views',
    'applications',
    'interviews',
    'agreementRequest',
    'agreementSigned',
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
  internshipJobData = []

  constructor(
    private pageTitleService: PageTitleService,
    private jobOfferService: JobOfferService,
    private router: Router
  ) { }

  ngOnInit() {
    this.pageTitleService.setTitle('Internship Postings');
    this.pageTitleService.setIcon('bullhorn');

    this.jobOfferService.getJobOfferList().subscribe(resp => {
      this.internshipJobData = resp;
      this.dataSource.data = this.internshipJobData;
      this.paginator.length = this.internshipJobData.length;
      this.dataCount = this.internshipJobData.length;
      this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
    })
  }

  openJobOffer(jobId: string) {
    this.router.navigate(['/internship', 'job-offer', jobId]);
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
  createJobOffer() {
    window.open('./job-offer-creation/create', '_blank');
  }

  showOptions(info) {
    const numSelected = this.selection.selected.length;
  }

}
