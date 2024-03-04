import { CompanyHeaderBarComponent } from './../shared-company-components/company-header-bar/company-header-bar.component';
import { MatPaginator } from '@angular/material/paginator';
import { UtilityService } from 'app/service/utility/utility.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CompanyService } from 'app/service/company/company.service';
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { ActivatedRoute } from '@angular/router';
import { cloneDeep } from 'lodash';
import { PageTitleService } from 'app/core/page-title/page-title.service';

@Component({
  selector: 'ms-company-branches',
  templateUrl: './company-branches.component.html',
  styleUrls: ['./company-branches.component.scss'],
})
export class CompanyBranchesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  private subs = new SubSink();
  isWaitingForResponse = false;
  myInnerHeight = 1920;
  companies: any[] = [];
  isFirstLoad = true;
  siret: string;
  toggleCardList: boolean = false;

  filteredValues = {
    no_RC: null,
    company_name: null,
  };
  search;
  pageIndex = 0;
  dataCount = 0;
  refreshCompanyId

  curSelected = null;
  curSelectedId = null;

  compId;
  mentorId = '';

  constructor(
    private companyService: CompanyService,
    private authService: AuthService,
    private utilService: UtilityService,
    private route: ActivatedRoute,
    private pageTitleService: PageTitleService
  ) {}

  ngOnInit() {
    this.companyService.filterCompany(null);
    this.subs.sink = this.route.queryParams.subscribe((params) => {
      if (params && params.hasOwnProperty('siren')) {
        this.search = params['siren'];
        this.siret = params['siret'];
        this.compId = params['id'];
      } else if (params && params.hasOwnProperty('selectedMentor')) {
        this.mentorId = params['selectedMentor'];
        this.compId = params['companyId'];
      } else {
        this.search = null;
        this.siret = null;
        this.compId = null;
        this.curSelectedId = null;
      }
      this.getAllCompany();
      this.setupFilterListener();
    });
    this.companyService.refreshCompany$.subscribe(resp=>{
      if(resp){
        this.refreshCompanyId = this.curSelectedId
        this.curSelectedId = null
        this.getAllCompany()
      }
    })
    this.pageTitleService.setTitle('Companies Branches');
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
        this.curSelectedId = null;
        this.paginator.pageIndex = 0;
        this.getAllCompany();
      }
    });
  }
  refreshCompanyBranch(event){
    if (event) {
      this.refreshCompanyId = this.curSelectedId
      this.curSelectedId = null
      this.getAllCompany();
    }
  }

  getAllCompany() {
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    this.isWaitingForResponse = true;
    this.subs.sink = this.companyService.getAllCompanies(this.search, pagination).subscribe(
      (resp) => {
        this.isFirstLoad = false;
        if (resp) {
          this.companies = cloneDeep(resp);
          this.paginator.length = resp && resp.length && resp[0].count_document ? resp[0].count_document : 0;
          this.dataCount = resp && resp.length && resp[0].count_document ? resp[0].count_document : 0;
          console.log('siret number is:', this.siret);
          if (this.siret) {
            const selectedCompany = this.companies.find((company) => company.no_RC === this.siret);
            console.log('found branch is:', selectedCompany);
            selectedCompany ? this.updatedSelectedCompany(selectedCompany._id) : null;
          } else if (this.compId) {
            this.subs.sink = this.companyService.getOneCompany(this.compId).subscribe((resp)  => {
              const selectedCompany = cloneDeep(resp);
              selectedCompany ? this.updatedSelectedCompany(selectedCompany._id) : null;
            })
          }else if(this.refreshCompanyId){
            this.curSelectedId = this.refreshCompanyId
          }
        } else {
          this.companies = [];
          this.paginator.length = 0;
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isFirstLoad = false;
        this.isWaitingForResponse = false;
        this.companies = [];
        this.paginator.length = 0;
        this.authService.postErrorLog(err)
        if (
          err && err['message'] && (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.authService.handlerSessionExpired();
          return;
        }
        console.log(err);
      },
    );
  }

  reset(event) {
    if (event) {
      this.search = null;
      this.getAllCompany();
    }
  }

  updatedSelectedCompany(newSelection) {
    this.curSelectedId = null;
    this.curSelectedId = newSelection;
    const filteredCompany = this.companies.filter((company) => newSelection === company._id);
    this.curSelected = filteredCompany[0];
  }

  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 320; //501 - 380 -350
    return this.myInnerHeight;
  }
  getCardHeight() {
    this.myInnerHeight = window.innerHeight - 220; //400 - 280 - 250
    return this.myInnerHeight;
  }

  reload(event) {
    if (event) {
      this.search = null;
      this.curSelectedId = null;
      this.getAllCompany();
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.pageTitleService.setTitle(null);
  }
}
