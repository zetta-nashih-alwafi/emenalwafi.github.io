import { Component, OnInit, ViewChild, AfterViewInit, Input, OnDestroy, OnChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { AddCompanyStaffDialogComponent } from '../add-company-staff-dialog/add-company-staff-dialog.component';
import { CompanyService } from 'app/service/company/company.service';
import { UntypedFormControl } from '@angular/forms';
import { AskRevisionDialogComponent } from '../ask-revision-dialog/ask-revision-dialog.component';
import { map, startWith, tap, debounceTime, takeUntil, filter } from 'rxjs/operators';
import * as _ from 'lodash';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { UserService } from 'app/service/user/user.service';
import { interval, Observable, PartialObserver, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from 'app/service/auth-service/auth.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { CompanyComposeEmailDialogComponent } from '../company-compose-email-dialog/company-compose-email-dialog.component';
import { CompanyCreationTabComponent } from '../company-creation-tab/company-creation-tab.component';
import { NgxPermissionsService } from 'ngx-permissions';
import { PermissionService } from 'app/service/permission/permission.service';
import { CountryService } from 'app/shared/services/country.service';

interface Filter {
  name: string;
  userType: string;
  entity: string;
  userStatus: string;
}

@Component({
  selector: 'ms-company-staff',
  templateUrl: './company-staff.component.html',
  styleUrls: ['./company-staff.component.scss'],
})
export class CompanyStaffComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  private subs = new SubSink();
  @Input() companyId: string;
  @Input() quickSearchMentorId: any;
  displayedColumns: string[] = ['name', 'userType', 'entity', 'status', 'action'];
  filterColumns: string[] = ['nameFilter', 'userTypeFilter', 'entityFilter', 'statusFilter', 'actionFilter'];
  statusFilterList = ['active', 'pending', 'incorrect_email'];
  entityFilterList = ['admtc', 'academic', 'company', 'service_provider', 'group_of_schools'];
  userFilterList = ['admtc', 'academic', 'company', 'service_provider', 'group_of_schools'];

  nameFilter = new UntypedFormControl('');
  userTypeFilter = new UntypedFormControl('AllM');
  entityFilter = new UntypedFormControl('All');
  statusFilter = new UntypedFormControl('All');
  filteredValues: Filter = {
    name: null,
    userType: null,
    entity: null,
    userStatus: null,
  };
  userTypeListFilter: Observable<any[]>;
  userTypeList = [];

  configCat: MatDialogConfig = {
    disableClose: true,
    width: '1070px',
    minHeight: '81%',
  };

  isWaitingForResponse = false;
  noData: any;
  sortValue = null;
  isReset = false;
  dataLoaded = false;
  selectedSchoolList: any[] = [];
  entityData: any;
  CurUser: any;
  timeOutSwal: any;
  isUserAdmtc = false;
  isUserAcadDirAdmin = false;
  schoolList = [];
  resetData = false;
  countdownHabis = false;
  originalUserType;

  dataSource = new MatTableDataSource([]);
  selection = new SelectionModel<any>(true, []);
  mailCompanyStaff: MatDialogRef<CompanyComposeEmailDialogComponent>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  // *************** START OF property to store data of country dial code
  countryCodeList: any[] = [];
  // *************** END OF property to store data of country dial code

  constructor(
    private dialog: MatDialog,
    private translate: TranslateService,
    private userService: UserService,
    private companyService: CompanyService,
    private utilService: UtilityService,
    private CurUserService: AuthService,
    private permission: NgxPermissionsService,
    public permissionService: PermissionService,
    private authService: AuthService,
    private countryService: CountryService
  ) {}

  ngOnInit() {
    this.getAllCountryCodes();
    this.initData();
    this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      if (this.originalUserType && this.originalUserType.length) {
        this.displayWithUserType(this.userTypeFilter.value);
        if (this.userTypeFilter.value) {
          const foundUserType = _.find(this.userTypeList, (type) => type.name === this.userTypeFilter.value);
          const found = foundUserType ? _.find(this.originalUserType, (type) => type._id === foundUserType._id) : null;
          const currLang = found ? this.translate.instant('USER_TYPES.' + found.name) : this.userTypeFilter.value;
          this.userTypeFilter.setValue(currLang);
        }
        this.userTypeList = [];
        this.originalUserType.forEach((item) => {
          const type = this.translate.instant('USER_TYPES.' + item.name);
          this.userTypeList.push({ _id: item._id, name: type });
        });
        this.userTypeListFilter = this.userTypeFilter.valueChanges.pipe(
          startWith(''),
          map((searchText) =>
            this.userTypeList
              .filter((title) => (title && title.name ? title.name.toLowerCase().includes(searchText.toLowerCase()) : false))
              .sort((a: any, b: any) => a.name.localeCompare(b.name)),
          ),
        );
      }
    });

    this.subs.sink = this.translate.onLangChange.subscribe(() => {
      this.sortCountryCode();
    })
  }

  sortCountryCode() {
    this.countryCodeList = this.countryCodeList.sort((firstData, secondData) => {
      if (this.utilService.simplifyRegex(this.translate.instant(firstData?.name)) < this.utilService.simplifyRegex(this.translate.instant(secondData?.name))) {
        return -1;
      } else if (this.utilService.simplifyRegex(this.translate.instant(firstData?.name)) > this.utilService.simplifyRegex(this.translate.instant(secondData?.name))) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  ngOnChanges() {
    if (this.companyId && !this.isReset) {
      this.subs.unsubscribe();
      clearInterval();
      clearTimeout();
      this.initData();
      // this.getCompanyStuffData();
    }
  }

  ngAfterViewInit() {
    this.paginator.page
      .pipe(
        startWith(null),
        tap(() => {
          if (!this.isReset) {
            // this.getCompanyStuffData();
            this.initData();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  getAllCountryCodes() {
    this.countryCodeList = this.countryService?.getAllCountriesNationality();
  }

  initData() {
    // *************** Cek User Type & Permission Access User to Company Data
    this.isUserAcadDirAdmin = this.utilService.isUserAcadDirAdmin();
    this.entityFilterList = this.companyService.getEntitiesCompany();
    this.CurUser = this.CurUserService.getLocalStorageUser();
    if (this.isUserAcadDirAdmin) {
      this.entityData = this.CurUser?.entities.find(
        (entity) => entity?.type?.name === 'Academic Director' || entity?.type?.name === 'Academic Admin',
      );
      this.schoolList = this.utilService.getUserAllAssignedSchool();
    }
    // ======================================================
    this.initializeUserFilter();

    // ************** If using quicksearch also filter the table with selected mentor
    if (this.quickSearchMentorId) {
      this.getMentorByQuickSearch();
    } else {
      if (this.companyId && !this.isReset) {
        this.getCompanyStuffData();
      }
    }
  }

  // *************** Sorting Table Data Staff
  sortData(sort: Sort) {
    if (sort.active === 'name') {
      this.sortValue = sort.direction ? { full_name: sort.direction } : null;
    } else if (sort.active === 'entity') {
      this.sortValue = sort.direction ? { entity_name: sort.direction } : null;
    } else if (sort.active === 'userType') {
      this.sortValue = sort.direction ? { user_type: sort.direction } : null;
    } else if (sort.active === 'status') {
      this.sortValue = sort.direction ? { user_status: sort.direction } : null;
    }
    if (this.dataLoaded) {
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCompanyStuffData();
      }
    }
  }

  // *************** Init Filter Staff Table
  initializeUserFilter() {
    this.subs.sink = this.nameFilter.valueChanges.pipe(debounceTime(800)).subscribe((name) => {
      if (name && name.length >= 1) {
        this.filteredValues.name = name;
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCompanyStuffData();
        }
      }
    });
    this.subs.sink = this.entityFilter.valueChanges.pipe(debounceTime(800)).subscribe((name) => {
      if (name && name.length >= 1) {
        this.filteredValues.entity = name !== 'All' ? name : '';
        this.paginator.pageIndex = 0;
        if (!this.isReset) {
          this.getCompanyStuffData();
        }
      }
    });
    this.statusFilter.valueChanges.subscribe((status) => {
      this.filteredValues.userStatus = status !== 'All' ?  status : '';
      this.paginator.pageIndex = 0;
      if (!this.isReset) {
        this.getCompanyStuffData();
      }
    });

    this.subs.sink = this.companyService.getUserTypesByEntity('company').subscribe(
      (resp) => {
        this.originalUserType = _.cloneDeep(resp);
        this.userTypeList = [];
        this.originalUserType.forEach((item) => {
          const type = this.translate.instant('USER_TYPES.' + item.name);
          this.userTypeList.push({ _id: item._id, name: type });
        });
        this.userTypeListFilter = this.userTypeFilter.valueChanges.pipe(
          startWith(''),
          map((searchText) =>
            this.userTypeList
              .filter((title) => (title && title.name ? title.name.toLowerCase().includes(searchText.toLowerCase()) : false))
              .sort((a: any, b: any) => a.name.localeCompare(b.name)),
          ),
        );
      },
      (err) => {
        this.authService.postErrorLog(err)
        console.log('[Response BE][Error] : ', err);
      },
    );
    /* this call getUserTypesByEntity*/
  }

  setTypeFilter(userType: string) {
    this.filteredValues.userType = userType === 'AllM' ? '' : userType;
    this.paginator.pageIndex = 0;
    this.setTypeDocument();
    if (!this.isReset) {
      this.getCompanyStuffData();
    }
  }

  // *************** Get Data Staff Company
  getCompanyStuffData() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };

    let filter = ``;
    filter += this.filteredValues.name ? ` full_name : "${this.filteredValues.name}"` : '';
    filter += this.filteredValues.userType ? ` user_type: "${this.filteredValues.userType}"` : '';
    filter += this.filteredValues.entity ? ` entity_name: ${this.filteredValues.entity}` : '';
    filter += this.filteredValues.userStatus ? ` user_status: ${this.filteredValues.userStatus}` : '';
    // *************** Get Data Staff Company based on user type ACAD Dir/Admin
    if (this.isUserAcadDirAdmin) {
      const userType = ['5a2e603f53b95d22c82f9590', '5a2e603c53b95d22c82f958f'];
      this.subs.sink = this.companyService
        .getAllUserInStaffCompanyByAcadir(this.schoolList, this.companyId, pagination, this.sortValue, filter, userType, true)
        .subscribe(
          (response) => {
            this.isWaitingForResponse = false;
            if (response && response.length) {
              let filter = [];
              response.forEach((resp) => {
                let entities = [];
                resp.entities.forEach((el) => {
                  const found = el.companies.filter((ell) => ell._id === this.companyId);
                  if (found.length) {
                    entities.push(el);
                  }
                });
                resp.entities = entities;
                filter.push(resp);
              });
              this.dataSource.data = filter;
              this.dataSource.sort = this.sort;
              this.paginator.length = response[0].count_document ? response[0].count_document : 0;
            } else {
              this.dataSource.data = [];
              this.paginator.length = 0;
            }
            this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
            this.isReset = false;
          },
          (err) => {
            console.log('[Data][Error] : ', err);
            this.authService.postErrorLog(err)
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
    } else {
      // *************** Get Data Staff Company based on user type ADMTC Dir/Admin
      this.subs.sink = this.companyService.getAllUserInStaffCompany(this.companyId, pagination, this.sortValue, filter).subscribe(
        (response) => {
          this.isWaitingForResponse = false;
          if (response && response.length) {
            let filter = [];
            response.forEach((resp) => {
              let entities = [];
              resp.entities.forEach((el) => {
                const found = el.companies.filter((ell) => ell._id === this.companyId);
                if (found.length) {
                  entities.push(el);
                }
              });
              resp.entities = entities;
              filter.push(resp);
            });
            this.dataSource.data = filter;
            this.dataSource.sort = this.sort;
            this.paginator.length = response[0].count_document ? response[0].count_document : 0;
          } else {
            this.dataSource.data = [];
            this.paginator.length = 0;
          }
          this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
          this.isReset = false;
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.authService.postErrorLog(err)
          console.log('[Data][Error] : ', err);
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
  }

  getMentorByQuickSearch() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.companyService.getOneUserInStaffCompany(this.quickSearchMentorId).subscribe(
      (resp) => {
        const response = [resp];
        this.isWaitingForResponse = false;
        if (response && response.length) {
          this.dataSource.data = response;
          this.dataSource.sort = this.sort;
          this.paginator.length = response.length ? response.length : 0;
        } else {
          this.dataSource.data = [];
          this.paginator.length = 0;
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;

        this.quickSearchMentorId = '';
      },
      (err) => {
        this.isWaitingForResponse = false;
        console.log('[Data][Error] : ', err);
        this.dataSource.data = [];
        this.paginator.length = 0;
        this.authService.postErrorLog(err)
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

  changePage(event: any) {
    if (!this.isReset) {
      this.getCompanyStuffData();
    }
  }

  // *************** Function to reset Filter, Sorting, and table staff
  resetFilter() {
    this.isReset = true;
    this.paginator.pageIndex = 0;
    this.sort.sort({ id: '', start: 'asc', disableClear: false });
    this.filteredValues = {
      name: '',
      userType: '',
      entity: '',
      userStatus: '',
    };
    this.nameFilter.setValue('');
    this.userTypeFilter.setValue('AllM');
    this.entityFilter.setValue('All');
    this.statusFilter.setValue('All');
    // this.publishedForStudentFilter.setValue('All');
    this.resetData = true;

    this.sort.direction = '';
    this.sort.active = '';
    this.sortValue = null;
    this.setTypeDocument();
    this.getCompanyStuffData();
  }

  // *************** Open Ask Revision Dialog
  onAskRevision(data) {
    this.dialog.open(AskRevisionDialogComponent, {
      minWidth: '505px',
      width: '590px',
      minHeight: '100px',
      panelClass: 'certification-rule-pop-up',
      disableClose: true,
      data: {
        reqNumber: '_2',
        companyId: this.companyId,
        userLogin: this.CurUser._id,
        dataMentor: data,
      },
    });
  }

  // *************** Open Add Staff Company Dialog
  onAddCompanyStaff() {
    this.dialog
      .open(AddCompanyStaffDialogComponent, {
        ...this.configCat,
        data: {
          operation: 'add',
          companyId: this.companyId,
          countryCodeList: this.countryCodeList?.length ? this.countryCodeList : [],
        },
      })
      .afterClosed()
      .subscribe((e) => {
        if (e && e.connectToCompany) {
          const withoutSwal = true;
          this.connectingMentorToCompany(e.dataMentor, withoutSwal);
        } else {
          this.getCompanyStuffData();
        }
      });
  }

  // *************** Generate Tooltip table
  renderTooltipType(entities) {
    let tooltip = '';
    const type = _.uniqBy(entities, 'type.name');
    for (const entity of type) {
      if (entity) {
        tooltip = tooltip + this.translate.instant('USER_TYPES.' + entity.type.name) + `, `;
      }
    }
    return tooltip.substring(0, tooltip.length - 2);
  }
  renderTooltipEntity(entities) {
    let tooltip = '';
    const type = _.uniqBy(entities, 'entity_name');
    for (const entity of type) {
      if (entity) {
        tooltip = tooltip + this.translate.instant(entity.entity_name) + `, `;
      }
    }
    return tooltip.substring(0, tooltip.length - 2);
  }
  // *************** End of Generate tooltip

  // *************** Function to connecting Mentor to company and School
  connectingMentorToCompany(data, withoutSwal?: boolean) {
    this.subs.sink = this.companyService.connectSchoolToMentor(data._id, this.companyId, this.entityData.school._id).subscribe(
      (resp) => {
        if (resp) {
          if (withoutSwal) {
            this.getCompanyStuffData();
          } else {
            Swal.fire({
              type: 'success',
              title: 'Bravo !',
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            }).then(() => {
              this.getCompanyStuffData();
            });
          }
        }
      },
      (err) => {
        this.authService.postErrorLog(err)
        Swal.fire({
          type: 'info',
          title: 'Error !',
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        }).then((res) => {
          console.log('[BE Message] Error is : ', err);
        });
      },
    );
  }

  // *************** Open send Mail Dialog
  sendMail(data) {
    this.mailCompanyStaff = this.dialog.open(CompanyComposeEmailDialogComponent, {
      disableClose: true,
      width: '750px',
      data: data,
    });
  }

  // *************** Open Edit Staff Dialog
  editStaff(data) {
    this.dialog
      .open(AddCompanyStaffDialogComponent, {
        ...this.configCat,
        data: {
          operation: 'edit',
          companyId: this.companyId,
          companyData: data,
          userData: this.CurUser,
          countryCodeList: this.countryCodeList?.length ? this.countryCodeList : [],
        },
      })
      .afterClosed()
      .subscribe((e) => {
        this.getCompanyStuffData();
        if (e.connectToCompany) {
          this.connectingMentorToCompany(e.dataMentor);
        }
      });
  }

  // *************** Make data type and entity unix
  getUniqueUserType(title) {
    return _.uniqBy(title, 'type.name');
    // entity.forEach(el=>{
    //   const found = el.companies.fi(ell => ell._id === this.companyId)
    //   if(found){
    //     console.log('el',el)
    //     return el
    //   }
    // })
  }

  getUniqueEntity(title) {
    return _.uniqBy(title, 'entity_name');
  }

  // *************** Function Remove mentor from company
  removeMentor(mentorId) {
    if (this.isUserAcadDirAdmin) {
      this.removeMentorFromSchool(mentorId);
    } else {
      this.deleteMentorAsADMTC(mentorId);
    }
  }

  removeMentorFromSchool(mentorId) {
    let timeDisabled = 3;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('DCMENTOR_1.TITLE'),
      html: this.translate.instant('DCMENTOR_1.TEXT'),
      showCancelButton: true,
      confirmButtonText: this.translate.instant('DCMENTOR_1.BUTTON_1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('DCMENTOR_1.BUTTON_2'),
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const time = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('DCMENTOR_1.BUTTON_1') + ' in ' + timeDisabled + ' sec';
        }, 1000);

        this.timeOutSwal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('DCMENTOR_1.BUTTON_1');
          Swal.enableConfirmButton();
          clearTimeout(time);
        }, timeDisabled * 1000);
      },
    }).then((isConfirm) => {
      clearTimeout(this.timeOutSwal);
      if (isConfirm.value) {
        this.subs.sink = this.companyService.getAllUserInStaffCompanyByAcadirNoPagination(this.schoolList, this.companyId).subscribe(
          (response) => {
            const allMentors = _.cloneDeep(response);
            const mentors = [];
            if (allMentors && allMentors.length) {
              allMentors.forEach((mentor) => {
                if (mentor && mentor._id && mentor._id !== mentorId) {
                  mentors.push(mentor._id);
                }
              });
            }
            this.subs.sink = this.companyService.connectMentorToSchool(mentors, this.companyId, this.entityData.school._id).subscribe(
              (resp) => {
                Swal.fire({
                  type: 'success',
                  title: this.translate.instant('DCMENTOR_2.TITLE'),
                  html: this.translate.instant('DCMENTOR_2.TEXT'),
                  confirmButtonText: this.translate.instant('DCMENTOR_2.BUTTON'),
                });
                this.paginator.pageIndex = 0;
                this.getCompanyStuffData();
              },
              (err) => {
                this.authService.postErrorLog(err)
                if (err['message'] === 'GraphQL error: Error: the mentor is already used in student contract') {
                  Swal.fire({
                    type: 'info',
                    title: this.translate.instant('DCMENTOR_3.TITLE'),
                    html: this.translate.instant('DCMENTOR_3.TEXT'),
                    confirmButtonText: this.translate.instant('DCMENTOR_3.BUTTON'),
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
          },
          (err) => {
            this.authService.postErrorLog(err)
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      }
    });
  }

  deleteMentorAsADMTC(mentorId) {
    let timeDisabled = 3;
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('DISCONNECT_SCHOOL.TITLE'),
      html: this.translate.instant('COMPANY.Delete mentor message'),
      showCancelButton: true,
      confirmButtonText: this.translate.instant('SWEET_ALERT.DELETE.CONFIRM', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('SWEET_ALERT.DELETE.CANCEL'),
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const time = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM') + ' in ' + timeDisabled + ' sec';
        }, 1000);

        this.timeOutSwal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM');
          Swal.enableConfirmButton();
          clearTimeout(time);
        }, timeDisabled * 1000);
      },
    }).then((isConfirm) => {
      clearTimeout(this.timeOutSwal);
      if (isConfirm.value) {
        const mentor = [];
        mentor.push(mentorId);
        this.subs.sink = this.companyService.removeMentorInThisCompany(this.companyId, mentor).subscribe(
          (resp) => {
            Swal.fire({
              type: 'success',
              title: 'Bravo!',
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
            this.paginator.pageIndex = 0;
            this.getCompanyStuffData();
          },
          (err) => {
            this.authService.postErrorLog(err);
            // const text = String(err);
            // const index = text.indexOf('/');
            // const message = text.slice(21, index);
            // const alert = message;
            if (err['message'] === 'GraphQL error: Error: Cannot delete,  mentor already connected to student') {
              Swal.fire({
                title: this.translate.instant('DCMENTOR_4.TITLE'),
                html: this.translate.instant('DCMENTOR_4.TEXT'),
                type: 'info',
                showConfirmButton: true,
                confirmButtonText: this.translate.instant('DCMENTOR_4.BUTTON'),
              });
            } else {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('DISCONNECT_SCHOOL.TITLE'),
                text: err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            }
          },
        );
      }
    });
  }

  displayWithUserType(value) {
    if (value && value === 'AllM') {
      return this.translate.instant('All');
    } else {
      return value;
    }
  }

  setTypeDocument(){
    this.subs.sink = this.companyService.getUserTypesByEntity('company').subscribe(
      (resp) => {
        this.originalUserType = _.cloneDeep(resp);
        this.userTypeList = [];
        this.originalUserType.forEach((item) => {
          const type = this.translate.instant('USER_TYPES.' + item.name);
          this.userTypeList.push({ _id: item._id, name: type });
        });
        this.userTypeListFilter = this.userTypeFilter.valueChanges.pipe(
          startWith(''),
          map((searchText) =>
            this.userTypeList
              .filter((title) => (title && title.name ? title.name.toLowerCase().includes(searchText.toLowerCase()) : false))
              .sort((a: any, b: any) => a.name.localeCompare(b.name)),
          ),
        );
      },
      (err) => {
        console.log('[Response BE][Error] : ', err);
      },
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
