import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PageTitleService } from 'app/core/page-title/page-title.service';
@Component({
  selector: 'ms-intern-profile-table',
  templateUrl: './intern-profile-table.component.html',
  styleUrls: ['./intern-profile-table.component.scss'],
})
export class InternProfileTableComponent implements OnInit, OnDestroy {
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
    'type',
    'student',
    'nationality',
    'currentProgram',
    'engagementLevel',
    'mentor',
    'connection',
    'cv',
    'motivationLetter',
    'videoProfile',
    'internProfile',
    'action',
  ];
  filterColumns: string[] = [
    'selectFilter',
    'typeFilter',
    'studentFilter',
    'nationalityFilter',
    'currentProgramFilter',
    'engagementLevelFilter',
    'mentorFilter',
    'connectionFilter',
    'cvFilter',
    'motivationLetterFilter',
    'videoProfileFilter',
    'internProfileFilter',
    'actionFilter',
  ];

  maleIcon = '../../../assets/img/student_icon.png';
  femaleIcon = '../../../assets/img/student_icon_fem.png';
  greenHeartIcon = '../../../assets/img/enagement_icon_green.png';
  flagsIconPath = '../../../assets/icons/flags-nationality/';
  shieldAccountIcon = '../../../assets/img/shield-account.png';

  dummyData = [
    {
      type: 'classic',
      student: {
        last_name: 'Smith',
        first_name: 'James',
        civility: 'mr',
      },
      mentor: {
        last_name: 'Smith',
        first_name: 'James',
        civility: 'mr',
      },
      nationality: 'French',
      program: '20-21 EFAPAR 1',
      engagement_level: 'lost',
      connection: 'done',
      cv: 'done',
      motivation_letter: 'done',
      video_profile: 'done',
      intern_profile: 'done',
    },
    {
      type: 'alternance',
      student: {
        last_name: 'Redford',
        first_name: 'Robert',
        civility: 'mr',
      },
      mentor: {
        last_name: 'Redford',
        first_name: 'Robert',
        civility: 'mr',
      },
      nationality: 'English',
      program: '21-22 EFATOU 2',
      engagement_level: 'high',
      connection: 'done',
      cv: 'done',
      motivation_letter: 'done',
      video_profile: 'done',
      intern_profile: 'done',
    },
    {
      type: 'special',
      student: {
        last_name: 'Jolie',
        first_name: 'Angelina',
        civility: 'mrs',
      },
      mentor: {
        last_name: 'Jolie',
        first_name: 'Angelina',
        civility: 'mrs',
      },
      nationality: 'English',
      program: '20-21 ICABOR 1',
      engagement_level: 'medium',
      connection: '',
      cv: '',
      motivation_letter: '',
      video_profile: '',
      intern_profile: '',
    },
  ];

  typeFilterList = [
    { value: 'All', key: 'AllS' },
    { value: 'classic', key: 'Classic' },
    { value: 'alternance', key: 'Alternance' },
    { value: 'special', key: 'Special' },
  ];

  connectionFilterList = [
    { value: 'AllF', key: 'AllF' },
    { value: 'uploaded', key: 'Uploaded' },
    { value: 'approved', key: 'Approved' },
    { value: 'rejected', key: 'Rejected' },
  ];

  internProfileFilterList = [
    { value: 'AllF', key: 'AllF' },
    { value: 'approved', key: 'Approved' },
    { value: 'rejected', key: 'Rejected' },
    { value: 'published', key: 'Published' },
    { value: 'unpublished', key: 'Unpublished' },
  ];

  constructor(private pageTitleService: PageTitleService,
    private router: Router) {}

  ngOnInit() {
    this.dataSource.data = this.dummyData;
    this.paginator.length = this.dummyData.length;

    this.pageTitleService.setTitle('Intern Profile');
    this.pageTitleService.setIcon('account-circle-outline');
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

  viewProfileInfo(profileId, tab?) {
    const query = {
      selectedProfile: '5ffdab2d9ac26d65aa9d1dbd',
      tab: tab ? tab : '',
    };
    const url = this.router.createUrlTree(['internship-file'], { queryParams: query });
    window.open(url.toString(), '_blank');
  }

  ngOnDestroy(): void {
    this.pageTitleService.setTitle('');
    this.pageTitleService.setIcon('');
  }

}
