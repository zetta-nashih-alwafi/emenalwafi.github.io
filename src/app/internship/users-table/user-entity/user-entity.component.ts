import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { debounceTime, startWith, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormControl } from '@angular/forms';
import { AddNewUserDialogComponent } from '../add-new-user-dialog/add-new-user-dialog.component';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'ms-user-entity',
  templateUrl: './user-entity.component.html',
  styleUrls: ['./user-entity.component.scss'],
})
export class UserEntityComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  private subs = new SubSink();

  isWaitingForResponse = false;
  isUserSelectedLoading = false;
  myInnerHeight = 1920;
  isReset = false;
  sortValue = null;
  dataCount = 0;
  tab;

  // dummyData = [];
  userList = [];
  currSelectedId;
  currSelected: any;
  lastPage: any;
  firstTime = true;
  isSaved = false;

  searchByNameFilter = new UntypedFormControl(null);

  constructor(
    private candidatesService: CandidatesService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    public router: Router,
    private pageTitleService: PageTitleService,
    private translate: TranslateService,
  ) {}

  ngOnInit() {
    this.pageTitleService.setTitle('Users');
    this.subs.sink = this.candidatesService.isSaved$.subscribe((res) => {
      if (res) {
        this.isSaved = true;
        this.getDataCountDocument();
      }
    });
    this.getDataCountDocument();
    this.initFilter();
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          // console.log(this.lastPage, this.paginator.pageIndex);
          if (this.lastPage === undefined) {
            // console.log('1');
            this.isWaitingForResponse = true;
          } else if (!this.isReset && this.paginator.pageIndex === this.lastPage) {
            this.getDataCountDocument();
            // console.log('2');
          } else {
            // console.log('3');
            this.getDataUsers();
          }
        }),
      )
      .subscribe();
  }

  initFilter() {
    this.subs.sink = this.searchByNameFilter.valueChanges.pipe(debounceTime(400)).subscribe((name) => {
      const symbol = /[()|{}\[\]:;<>?,\/]/;
      const symbol1 = /\\/;
      if (name !== null && !name.match(symbol) && !name.match(symbol1)) {
        if (name === '') {
          this.searchByNameFilter.setValue(null);
          if (!this.isReset) {
            this.getDataUsers();
          }
        }
        if (!this.isReset) {
          this.getDataUsers('', name);
        }
      } else {
        if (name !== null) {
          this.searchByNameFilter.setValue(null);
          if (!this.isReset) {
            this.getDataUsers();
          }
        }
      }
    });
  }

  getDataCountDocument() {
    const pagination = {
      limit: 1,
      page: 0,
    };
    let isEdit = false;
    let searchName = '';
    if (this.firstTime) {
      this.route.queryParams.subscribe((res) => {
        if (res.last_name) {
          this.searchByNameFilter.patchValue(res.last_name);
          isEdit = true;
          searchName = res.last_name;
        }
      });
    }
    if (this.isSaved) {
      isEdit = true;
    }
    const userTypes = ['617f64ec5a48fe2228518815', '617f64ec5a48fe2228518814'];
    this.subs.sink = this.candidatesService.GetAllUsersCRM(userTypes, pagination).subscribe(
      (res) => {
        if (res) {
          const countDocument = res[0].count_document;
          this.dataCount = countDocument;
          if (countDocument && !isEdit) {
            this.lastPage = countDocument === 10 ? 0 : Math.floor(countDocument / 10);
            this.getDataUsers(this.lastPage);
          } else {
            this.lastPage = this.paginator.pageIndex;
            this.getDataUsers(this.lastPage, searchName);
          }
        }
      },
      (err) => {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getDataUsers(lastPage?, last_name?) {
    // console.log('trigger', lastPage, this.paginator.pageIndex);

    this.isWaitingForResponse = true;
    let pagination;
    let idParam;

    if (this.firstTime) {
      this.route.params.subscribe((query) => {
        if (query && query.id) {
          idParam = query.id;
        }
      });
    }

    if (lastPage) {
      this.paginator.pageIndex = lastPage;
      pagination = {
        limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
        page: this.paginator.pageIndex,
      };
    } else {
      pagination = {
        limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
        page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
      };
    }

    const userTypes = ['617f64ec5a48fe2228518815', '617f64ec5a48fe2228518814'];
    this.subs.sink = this.candidatesService.GetAllUsersCRM(userTypes, pagination, last_name).subscribe(
      (res) => {
        if (res) {
          res = this.getPrograms(res);
          this.userList = _.cloneDeep(res);
          this.dataCount = res && res.length > 0 && res[0].count_document ? res[0].count_document : 0;
          if (idParam) {
            this.isUserSelectedLoading = true;
            this.currSelectedId = idParam;
            const filteredCandidate = this.userList.filter((selected) => selected._id === idParam);
            this.currSelected = filteredCandidate[0];
            this.firstTime = false;
          }
        }
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.isWaitingForResponse = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getPrograms(dataUsers) {
    const result = dataUsers.map((res) => {
      let listUserType = [];
      if (res.entities && res.entities.length > 0) {
        res.entities.forEach((element) => {
          let userType = '';
          userType = this.checkUserType(element, userType);
          if (userType) {
            listUserType.push(userType);
          }
        });
      }
      res['ListUser'] = listUserType;
      return res;
    });
    return result;
  }

  checkUserType(element, userType) {
    if (element.type) {
      userType = element.type.name;
    }
    return userType;
  }

  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 231;
    return this.myInnerHeight;
  }

  updatedSelectedUser(newSelection) {
    if (newSelection) {
      this.isUserSelectedLoading = true;
      this.currSelectedId = newSelection;
      const filteredCandidate = this.userList.filter((selected) => selected._id === newSelection);
      this.currSelected = filteredCandidate[0];
    }
  }

  openAddNewUser() {
    const dialog = this.dialog.open(AddNewUserDialogComponent, {
      panelClass: 'certification-rule-pop-up',
      width: '625px',
      disableClose: true,
    });
    dialog.afterClosed().subscribe((res) => {
      console.log(res);
      // if (res) {
      //   this.getDataUsers();
      // }
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
