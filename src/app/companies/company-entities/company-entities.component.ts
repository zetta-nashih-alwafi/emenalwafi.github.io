import { CompanyService } from 'app/service/company/company.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { SubSink } from 'subsink';
import { MatPaginator } from '@angular/material/paginator';
import { tap } from 'rxjs/operators';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-company-entities',
  templateUrl: './company-entities.component.html',
  styleUrls: ['./company-entities.component.scss'],
})
export class CompanyEntitiesComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  private subs = new SubSink();
  isWaitingForResponse = false;
  myInnerHeight = 1920;
  companies: any[] = [];
  isFirstLoad: boolean = true;
  selectedEntityRC: string;
  toggleCardList: boolean = false;

  currentUser;

  filteredValues = {
    no_RC: null,
    company_name: null,
  };
  pageIndex = 0;
  dataCount = 0;
  search;

  curSelected = null;
  curSelectedId = null;

  constructor(
    private companyService: CompanyService, 
    private authService: AuthService, 
    private utilService: UtilityService,
    private pageTitleService: PageTitleService
  ) { }

  ngOnInit() {
    this.paginator.pageIndex = 0;
    this.companyService.filterCompany(null);
    this.getAllCompany();
    this.setupFilterListener();
    this.pageTitleService.setTitle('Companies Entity');
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        tap(() => {
          !this.isFirstLoad ? this.getAllCompany() : null;
        }),
      )
      .subscribe();
  }

  setupFilterListener() {
    this.companyService.companyFilter$.subscribe((resp) => {
      if (resp !== null) {
        this.search = resp;
        this.curSelectedId = null
        this.paginator.pageIndex = 0;
        this.getAllCompany();
      }
    });
  }

  getAllCompany() {
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    this.isWaitingForResponse = true;
    this.subs.sink = this.companyService.getAllCompanyEntity(this.search, pagination).subscribe(
      (resp) => {
        this.isFirstLoad = false;
        if (resp) {
          this.companies = resp;
          this.paginator.length = resp && resp.length && resp[0].count_document ? resp[0].count_document : 0;
          this.dataCount = resp && resp.length && resp[0].count_document ? resp[0].count_document : 0;
        } else {
          this.companies = [];
          this.paginator.length = 0;
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.isFirstLoad = false;
        this.companies = [];
        this.paginator.length = 0;
        this.authService.postErrorLog(err)
        console.log(err);
      },
    );
  }

  updatedSelectedCompany(newSelection) {
    this.curSelectedId = null;
    this.curSelectedId = newSelection;
    const filteredCompany = this.companies.filter((company) => newSelection === company._id);
    this.curSelected = filteredCompany[0];
    this.selectedEntityRC = filteredCompany[0].no_RC;
  }

  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 271;
    return this.myInnerHeight;
  }
  getCardHeight() {
    this.myInnerHeight = window.innerHeight - 230;
    return this.myInnerHeight;
  }

  reload(event) {
    if (event) {
      this.search = null;
      this.getAllCompany();
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
}
