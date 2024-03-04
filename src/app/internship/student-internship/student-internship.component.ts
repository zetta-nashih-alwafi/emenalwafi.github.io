import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { map } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { AskNewAgreementDialogComponent } from './ask-new-agreement-dialog/ask-new-agreement-dialog.component';
import { CompanyService } from 'app/service/company/company.service';
import { AskNewAgreementDetailDialogComponent } from './ask-new-agreement-detail-dialog/ask-new-agreement-detail-dialog.component';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { InternshipService } from 'app/service/internship/internship.service';

@Component({
  selector: 'ms-student-internship',
  templateUrl: './student-internship.component.html',
  styleUrls: ['./student-internship.component.scss'],
})
export class StudentInternshipComponent implements OnInit {

  // filterColumns: string[] = [
  //   'dateAgreementAskedFilter',
  //   'studentFilter',
  //   'mentorFilter',
  //   'companyRelationMemberFilter',
  //   'agreementStatusFilter',
  //   'internshipStartDateFilter',
  //   'internshipEndDateFilter',
  //   'internshipReportFilter',
  //   'evalProFilter',
  //   'internshipValidatedFilter',
  //   'actionFilter'
  // ];
  displayedColumns: string[] = [
    'dateAgreementAsked',
    'company',
    'mentor',
    'companyRelationMember',
    'agreementStatus',
    'internshipStartDate',
    'internshipEndDate',
    'internshipReport',
    'evalPro',
    'internshipValidated',
    'action'
  ];

  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  
  isCheckedAll = false;
  disabledExport = false;
  dataCount = 0;
  noData;

  private subs = new SubSink();
  flagsIconPath = '../../../../../assets/icons/flags-nationality/';
  isLoading: Boolean;

  myInternshipData = [
    {
      date_agreement: "25/07/2021",
      company : {
        company_name: "Circle K"
      },
      mentor : {
        lastName: "Pinard",
        firstName: "Corentin",
        civility: "MR",
      },
      company_relation_member : {
        lastName: "Salmon",
        firstName: "Bennit",
        civility: "MR",
      },
      agreement_status : "Agreement published",
      internship_start_date : "12/08/2021",
      internship_end_date : "08/11/2021",
      internship_report : "Uploaded",
      eval_pro : "Completed",
      internship_validated : "Validated"
    }
  ]
  countries: any[];

  constructor(
    private companyService: CompanyService,
    private dialog: MatDialog,
    private router: Router,
    private translate: TranslateService,
    private internshipService: InternshipService,
  ) {}

  ngOnInit() {
    this.setTableData();
    this.fetchCountriesDropdown();
  }

  setTableData() {
    this.dataSource.data = this.myInternshipData;
    this.dataCount = this.myInternshipData.length;
    this.dataSource.paginator = this.paginator;
    this.paginator.length = this.myInternshipData.length;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (items, property) => {
      switch (property) {
        case 'dateAgreementAsked':
          return items.dateAgreement ? items.dateAgreement : null;
        default:
          return items[property];
      }
    };
  }

  fetchCountriesDropdown() {
    this.subs.sink = this.companyService.getCountry().subscribe((list: any[]) => {
      this.countries = list;
    });
  }

  openDialogAskAgreement() {
    const dialogRef = this.dialog.open(AskNewAgreementDialogComponent, {
      width: '600px',
      minHeight: '100px',
      data: this.countries,
      autoFocus: false,
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((res: { country: string; company_data?: any }) => {
      console.log(res);
      if (res) {
        if (res.country !== 'France') {
          this.openDialogAskAgreementDetailed(res.country);
        } else {
         if(res.company_data) {
          let url = this.router.createUrlTree(['/internship-agreement/detail'], {queryParams: {companyId: res.company_data._id} });
          window.open(url.toString(), '_blank');
         }
        }
      }
    });
  }

  openDialogAskAgreementDetailed(country) {
    const dialogRefDetail = this.dialog
      .open(AskNewAgreementDetailDialogComponent, {
        width: '800px',
        minHeight: '100px',
        autoFocus: false,
        disableClose: true,
        data: {
          countrySelect: country,
          list: this.countries,
          isEdit: false,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        console.log(res);
        if (res) {
          if (res === 'FR') {
            this.openDialogAskAgreement();
          } else {
            let url = this.router.createUrlTree(['/internship-agreement/detail'], {queryParams: {companyId: res._id} });
            window.open(url.toString(), '_blank');
          }
        }
      });
  }


}
