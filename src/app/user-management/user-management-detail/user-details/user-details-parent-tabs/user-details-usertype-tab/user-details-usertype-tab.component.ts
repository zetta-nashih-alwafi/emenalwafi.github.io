import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { map, tap } from 'rxjs/operators';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { SelectionModel } from '@angular/cdk/collections';
import { UntypedFormControl } from '@angular/forms';
import { AddUserUsertypeDialogComponent } from './add-user-usertype-dialog/add-user-usertype-dialog.component';
import { UserService } from 'app/service/user/user.service';
import { UserManagementService } from 'app/user-management/user-management.service';
import Swal from 'sweetalert2';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { AuthService } from 'app/service/auth-service/auth.service';

interface Entities {
  entity_name: string;
  type: {
    _id: string;
    name: string;
  };
  school: {
    _id: string;
    short_name: string;
  };
  campus: {
    _id: string;
    name: string;
  };
  level: {
    _id: string;
    name: string;
  };
}
@Component({
  selector: 'ms-user-details-usertype-tab',
  templateUrl: './user-details-usertype-tab.component.html',
  styleUrls: ['./user-details-usertype-tab.component.scss'],
})
export class UserDetailsUsertypeTabComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() userId: string;
  scholarPeriodCount;
  selection = new SelectionModel<any>(true, []);
  dataSource = new MatTableDataSource([]);
  userSelected: any[];
  disabledExport = true;
  userSelectedId: any[];
  selectType: any;
  isCheckedAll = false;
  noData: any;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;
  displayedColumns: string[] = ['select', 'user_type', 'school', 'campus', 'level', 'action'];
  filterColumns: string[] = ['selectFilter', 'user_type_filter', 'schoolFilter', 'campusFilter', 'levelFilter', 'actionFilter'];
  filteredValues = {
    school: null,
    type: null,
    campus: null,
    level: null,
  };

  userTypeFilter = new UntypedFormControl('All');
  schoolFilter = new UntypedFormControl('All');
  campusFilter = new UntypedFormControl('All');
  levelFilter = new UntypedFormControl('All');

  isWaitingForResponse = false;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  isLoading: Boolean = false;
  dataCount = 0;
  intackChannelCount = 0;
  currentUserTypeId
  private subs = new SubSink();

  private timeOutVal: any;
  types = [];
  schools = [];
  campuses = [];
  levels = [];
  originalEntityList: any;
  originalUserDetail: any;
  isOperator: boolean;
  entities = [];
  dummyUser = {
    _id: '619bbb817a26c8320c200033',
    email: 'c.barbolat@yopmail.com',
    entities: [
      {
        entity_name: 'admission',
        type: {
          _id: '617f64ec5a48fe2228518811',
          name: 'Admission Member',
        },
        programs: [
          {
            school: {
              _id: '6166e899fd74d459cd965dc3',
              short_name: 'CREAD',
            },
            campus: {
              _id: '6166e899fd74d459cd965db3',
              name: 'Lyon',
            },
            level: {
              _id: '6166e899fd74d459cd965da2',
              name: '1',
            },
          },
          {
            school: {
              _id: '6166e899fd74d459cd965dc3',
              short_name: 'CREAD',
            },
            campus: {
              _id: '6166e899fd74d459cd965db3',
              name: 'Lyon',
            },
            level: {
              _id: '6166e899fd74d459cd965da3',
              name: '2',
            },
          },
          {
            school: {
              _id: '6166e899fd74d459cd965dc3',
              short_name: 'CREAD',
            },
            campus: {
              _id: '6166e899fd74d459cd965db3',
              name: 'Lyon',
            },
            level: {
              _id: '6166e899fd74d459cd965da4',
              name: '3',
            },
          },
          {
            school: {
              _id: '6166e899fd74d459cd965dc3',
              short_name: 'CREAD',
            },
            campus: {
              _id: '6166e899fd74d459cd965db3',
              name: 'Lyon',
            },
            level: {
              _id: '6166e899fd74d459cd965da5',
              name: '4',
            },
          },
          {
            school: {
              _id: '6166e899fd74d459cd965dc3',
              short_name: 'CREAD',
            },
            campus: {
              _id: '6166e899fd74d459cd965db3',
              name: 'Lyon',
            },
            level: {
              _id: '6166e899fd74d459cd965da6',
              name: '5',
            },
          },
        ],
      },
    ],
  };

  constructor(
    private translate: TranslateService,
    private dialog: MatDialog,
    private userService: UserService,
    private userMgtService: UserManagementService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getLocalStorageUser();
    const isPermission = this.authService.getPermission();
    const currentUserEntity = currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

    this.initFilter();
    this.checkIsOperator();
  }

  ngOnChanges() {
    this.resetTable();
    this.fetchUserDetail();
    this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
      this.fetchUserDetail();
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngAfterViewInit() {
    this.subs.sink = this.paginator.page
      .pipe(
        tap(() => {
          if (!this.isReset) {
            // this.fetchUserDetail();
          }
          this.dataLoaded = true;
        }),
      )
      .subscribe();
  }

  checkIsOperator() {
    this.isOperator = this.authService.getCurrentUser().entities.some((entity) => entity.entity_name && entity.entity_name === 'operator');
  }
  mappingData(data) {
    const newEntities = [];
    if (data && data.entities && data.entities.length) {
      data.entities.forEach((entity) => {
        if (entity.programs && entity.programs.length) {
          entity.programs.forEach((program) => {
            newEntities.push({
              ...entity,
              school: program.school,
              campus: program.campus,
              level: program.level,
            });
          });
        } else if (entity && entity.entity_name === 'operator') {
          newEntities.push({
            ...entity,
            school: null,
            campus: null,
            level: null,
          });
        }
      });
    }
    data.entities = newEntities;
    return data;
  }

  fetchUserDetail() {
    this.isWaitingForResponse = true;
    const pagination = {
      limit: this.paginator.pageSize ? this.paginator.pageSize : 10,
      page: this.paginator.pageIndex ? this.paginator.pageIndex : 0,
    };
    const filter = this.cleanFilterData();
    this.subs.sink = this.userService.getUserEntitiesForTable(this.userId).subscribe(
      (resp: any) => {
        if (resp && resp.entities && resp.entities.length) {
          this.isWaitingForResponse = false;
          const data = _.cloneDeep(resp);
          const user = this.mappingData(data);
          // console.log('uat 275 user', user);
          this.initFilter();
          this.dataSource.paginator = this.paginator;
          this.originalEntityList = _.cloneDeep(user.entities);
          this.originalUserDetail = _.cloneDeep(resp);
          this.dataSource.data = _.cloneDeep(user.entities);
          this.dataCount = this.dataSource.filteredData.length;
          this.dataSource.sort = this.sort;
          this.setDropdowns(user.entities);
          this.entities = [...user.entities];
          // this.subs.sink = this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
          //   this.setDropdowns(this.originalEntityList);
          // });
        } else {
          this.isWaitingForResponse = false;
          this.dataSource.data = [];
          this.paginator.length = 0;
          this.dataCount = 0;
          this.emptyFilterList();
        }
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.isWaitingForResponse = false;
      },
      (err) => {
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
        this.dataSource.data = [];
        this.paginator.length = 0;
        this.dataCount = 0;
        this.noData = this.dataSource.connect().pipe(map((dataa) => dataa.length === 0));
        this.isReset = false;
        this.emptyFilterList();
        if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
          Swal.fire({
            type: 'warning',
            title: this.translate.instant('BAD_CONNECTION.Title'),
            html: this.translate.instant('BAD_CONNECTION.Text'),
            confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
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
  }

  setDropdowns(entities: Entities[]) {
    this.types = _.uniqBy(
      entities.filter((entity) => entity && entity.type && entity.type.name).map((entity) => ({ ...entity.type, name: entity.type.name })),
      'name',
    );
    this.schools = _.uniqBy(
      entities.map((entity) => entity.school).filter((school) => school),
      'short_name',
    );
    if (this.schools && this.schools.length === 0) {
      this.schools = [
        {
          _id: '',
          short_name: this.translate.instant('No items found'),
          disabled: true,
        },
      ];
    }
    this.campuses = _.uniqBy(
      entities.map((entity) => entity.campus).filter((campus) => campus),
      'name',
    );
    if (this.campuses && this.campuses.length === 0) {
      this.campuses = [
        {
          _id: '',
          name: this.translate.instant('No items found'),
          disabled: true,
        },
      ];
    }
    this.levels = _.uniqBy(
      entities.map((entity) => entity.level).filter((level) => level),
      'name',
    );
    if (this.levels && this.levels.length === 0) {
      this.levels = [
        {
          _id: '',
          name: this.translate.instant('No items found'),
          disabled: true,
        },
      ];
    }
  }

  emptyFilterList() {
    this.types = [
      {
        _id: '',
        name: 'No items found',
        disabled: true,
      },
    ];
    this.schools = [
      {
        _id: '',
        short_name: this.translate.instant('No items found'),
        disabled: true,
      },
    ];
    this.campuses = [
      {
        _id: '',
        name: this.translate.instant('No items found'),
        disabled: true,
      },
    ];
    this.levels = [
      {
        _id: '',
        name: this.translate.instant('No items found'),
        disabled: true,
      },
    ];
  }

  // init listener to the filters
  initFilter() {
    this.subs.sink = this.userTypeFilter.valueChanges.subscribe((type) => {
      this.filteredValues['type'] = type && type !== 'All' ? type : null;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
      this.clearSelection();
    });

    this.subs.sink = this.schoolFilter.valueChanges.subscribe((school) => {
      this.filteredValues['school'] = school && school !== 'All' ? school : null;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
      if (school && school !== 'All') {
        this.setCampusesDropdown(school);
      } else {
        this.setCampusesDropdown(null);
      }
      this.clearSelection();
    });

    this.subs.sink = this.campusFilter.valueChanges.subscribe((campus) => {
      this.filteredValues['campus'] = campus && campus !== 'All' ? campus : null;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
      this.clearSelection();
    });

    this.subs.sink = this.levelFilter.valueChanges.subscribe((level) => {
      this.filteredValues['level'] = level && level !== 'All' ? level : null;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
      this.clearSelection();
    });

    this.dataSource.filterPredicate = this.customFilterPredicate();
    this.dataSource.sortingDataAccessor = this.customSortingBehavior();
  }

  setCampusesDropdown(school) {
    if (school) {
      const campusesData = [];
      this.entities.forEach((entity) => {
        if (entity.school && entity.school.short_name === school) {
          campusesData.push(entity.campus);
        }
      });
      this.campuses = _.uniqBy(campusesData, 'name');
    } else {
      this.setDropdowns(this.entities);
    }
  }

  // custom filter logic
  customFilterPredicate() {
    return (data, filter: string) => {
      const searchString = JSON.parse(filter);
      // if (searchString.type) {
      //   data.ty
      // }
      const typeFound = searchString.type ? (data.type ? searchString.type === data.type.name : false) : true;
      const schoolFound = searchString.school ? (data.school ? searchString.school === data.school.short_name : false) : true;
      const campusFound = searchString.campus ? (data.campus ? searchString.campus === data.campus.name : false) : true;
      const levelFound = searchString.level ? (data.level ? searchString.level === data.level.name : false) : true;

      return typeFound && schoolFound && campusFound && levelFound;
    };
  }

  customSortingBehavior() {
    return (this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'user_type':
          return item.type ? item.type.name : null;
        case 'school':
          return item.school ? item.school.short_name : null;
        case 'campus':
          return item.campus ? item.campus.name : null;
        case 'level':
          return item.level ? item.level.name : null;
        default:
          return item[property];
      }
    });
  }

  clearSelection() {
    this.userSelected = [];
    this.userSelectedId = [];
    this.selection.clear();
    this.isCheckedAll = false;
  }

  // on reset button click
  resetTable() {
    this.selection.clear();
    this.userSelected = [];
    this.isCheckedAll = false;
    this.isReset = true;
    this.paginator.pageIndex = 0;
    // this.sort.sort({ id: '', start: 'asc', disableClear: false });

    this.filteredValues = {
      school: '',
      type: '',
      campus: '',
      level: '',
    };
    this.sort.direction = '';
    this.sort.active = '';
    this.userTypeFilter.patchValue('All', { emitEvent: false });
    this.schoolFilter.patchValue('All', { emitEvent: false });
    this.campusFilter.patchValue('All', { emitEvent: false });
    this.levelFilter.patchValue('All', { emitEvent: false });
    this.setCampusesDropdown('');
    this.dataSource.filter = JSON.stringify(this.filteredValues);

    // this.fetchUserDetail();
  }

  addUserType() {
    this.subs.sink = this.dialog
      .open(AddUserUsertypeDialogComponent, {
        panelClass: 'certification-rule-pop-up',
        minWidth: '400px',
        disableClose: true,
        autoFocus: false,
        data: {
          userId: this.userId,
        },
      })
      .afterClosed()
      .subscribe((resp) => {
        if (resp) {
          this.fetchUserDetail();
        }
      });
  }

  cleanFilterData() {
    const filterData = _.cloneDeep(this.filteredValues);
    let filterQuery = '';
    Object.keys(filterData).forEach((key) => {
      // only add key that has value to the query. so it wont send filter with empty string
      if (filterData[key] || filterData[key] === false) {
        filterQuery = filterQuery + ` ${key}:"${filterData[key]}"`;
      }
    });
    return 'filter: {' + filterQuery + '}';
  }

  onRemoveEntity(entityId: string) {
    // alert('yes this button');
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('Warning'),
      text: this.translate.instant('Are you sure you want to delete this user type'),
      showCancelButton: true,
      allowEscapeKey: true,
      confirmButtonText: this.translate.instant('SWEET_ALERT.DELETE.CONFIRM'),
      cancelButtonText: this.translate.instant('SWEET_ALERT.DELETE.CANCEL'),
    }).then((result) => {
      clearTimeout(this.timeOutVal);
      if (result.value) {
        this.updateUserEntities(entityId);
      }
    });
  }

  onRemoveMultipleEntity() {
    // alert('yes this button');
    if (!this.userSelected || this.userSelected.length < 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_S8.Title'),
        html: this.translate.instant('Followup_S8.Text', { menu: this.translate.instant('User Type') }),
        confirmButtonText: this.translate.instant('Followup_S8.Button'),
      });
      return;
    } else if (this.originalEntityList.length === 1) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_12.Title'),
        html: this.translate.instant('Followup_12.Text'),
        confirmButtonText: this.translate.instant('Followup_12.Button'),
      });
      return;
    }
    Swal.fire({
      type: 'warning',
      title: this.translate.instant('Warning'),
      text: this.translate.instant('Are you sure you want to delete this user type'),
      showCancelButton: true,
      allowEscapeKey: true,
      confirmButtonText: this.translate.instant('SWEET_ALERT.DELETE.CONFIRM'),
      cancelButtonText: this.translate.instant('SWEET_ALERT.DELETE.CANCEL'),
    }).then((result) => {
      clearTimeout(this.timeOutVal);
      if (result.value) {
        this.updateUserMultipleEntities(this.userSelected);
      }
    });
  }

  temporarilyDisableConfirmButton(timeDisabled) {
    const confirmBtnRef = Swal.getConfirmButton();
    confirmBtnRef.setAttribute('disabled', '');
    const time = setInterval(() => {
      timeDisabled -= 1;
      confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM') + ' in ' + timeDisabled + ' sec';
    }, 1000);

    this.timeOutVal = setTimeout(() => {
      confirmBtnRef.innerText = this.translate.instant('SWEET_ALERT.DELETE.CONFIRM');
      confirmBtnRef.removeAttribute('disabled');
      clearInterval(time);
      clearTimeout(this.timeOutVal);
    }, timeDisabled * 1000);
  }

  createPayload(entityToDelete) {
    const getEntity = this.originalUserDetail.entities.find((resp) => resp.entity_name === entityToDelete.entity_name);
    const getEntityIndex = this.originalUserDetail.entities.findIndex((resp) => resp.entity_name === entityToDelete.entity_name);
    let programs = [];
    let result = _.cloneDeep(this.originalUserDetail.entities);
    const payload = result;
    if (getEntity && getEntity.programs && getEntity.programs.length) {
      programs = getEntity.programs.filter(
        (resp) =>
          resp &&
          entityToDelete &&
          !(
            JSON.stringify(resp.school) === JSON.stringify(entityToDelete.school) &&
            JSON.stringify(resp.level) === JSON.stringify(entityToDelete.level) &&
            JSON.stringify(resp.campus) === JSON.stringify(entityToDelete.campus)
          ),
      );
      this.originalUserDetail.entities[getEntityIndex].programs = programs;
      result = this.originalUserDetail.entities;
      if (result && result.length) {
        result.forEach((entity, entInd) => {
          payload[entInd] = entity;
          if (entity && entity.campus && entity.campus._id) {
            payload[entInd].campus = entity.campus._id;
          } else {
            payload[entInd].campus = null;
          }
          if (entity && entity.level && entity.level._id) {
            payload[entInd].level = entity.level._id;
          } else {
            payload[entInd].level = null;
          }
          if (entity && entity.school && entity.school._id) {
            payload[entInd].school = entity.school._id;
          } else {
            payload[entInd].school = null;
          }
          if (entity && entity.type && entity.type._id) {
            payload[entInd].type = entity.type._id;
          } else {
            payload[entInd].type = null;
          }
          if (entity && entity.programs && entity.programs.length) {
            entity.programs.forEach((program, progInd) => {
              if (program && program.campus && program.campus._id) {
                payload[entInd].programs[progInd].campus = program.campus._id;
              } else {
                payload[entInd].programs[progInd].campus = null;
              }
              if (program && program.level && program.level._id) {
                payload[entInd].programs[progInd].level = program.level._id;
              } else {
                payload[entInd].programs[progInd].level = null;
              }
              if (program && program.school && program.school._id) {
                payload[entInd].programs[progInd].school = program.school._id;
              } else {
                payload[entInd].programs[progInd].school = null;
              }
            });
          } else {
            result[entInd].programs = [];
          }
        });
      }
    } else {
      result.splice(getEntityIndex, 1);
      if (result && result.length) {
        result.forEach((entity, entInd) => {
          payload[entInd] = entity;
          if (entity && entity.campus && entity.campus._id) {
            payload[entInd].campus = entity.campus._id;
          } else {
            payload[entInd].campus = null;
          }
          if (entity && entity.level && entity.level._id) {
            payload[entInd].level = entity.level._id;
          } else {
            payload[entInd].level = null;
          }
          if (entity && entity.school && entity.school._id) {
            payload[entInd].school = entity.school._id;
          } else {
            payload[entInd].school = null;
          }
          if (entity && entity.type && entity.type._id) {
            payload[entInd].type = entity.type._id;
          } else {
            payload[entInd].type = null;
          }
          if (entity && entity.programs && entity.programs.length) {
            entity.programs.forEach((program, progInd) => {
              if (program && program.campus && program.campus._id) {
                payload[entInd].programs[progInd].campus = program.campus._id;
              } else {
                payload[entInd].programs[progInd].campus = null;
              }
              if (program && program.level && program.level._id) {
                payload[entInd].programs[progInd].level = program.level._id;
              } else {
                payload[entInd].programs[progInd].level = null;
              }
              if (program && program.school && program.school._id) {
                payload[entInd].programs[progInd].school = program.school._id;
              } else {
                payload[entInd].programs[progInd].school = null;
              }
            });
          } else {
            result[entInd].programs = [];
          }
        });
      }
    }
    return payload;
  }

  createPayloadMultiple(entityToDelete) {
    const entities = _.cloneDeep(this.dataSource.data);
    if (entityToDelete && entityToDelete.length) {
      entityToDelete.forEach((element) => {
        const indexEntity = entities.findIndex((ind) => JSON.stringify(ind) === JSON.stringify(element));
        entities.splice(indexEntity, 1);
      });
    }
    const filteredEntities = entities;
    const payload = filteredEntities.map((entity) => {
      for (const [key, value] of Object.entries(entity)) {
        if (value && typeof value === 'object' && value.hasOwnProperty('_id')) {
          entity[key] = value['_id'];
        }
      }
      return entity;
    });
    const finalPayload = _.chain(payload)
      .groupBy('type')
      .map((value, key) => ({
        entity_name: value && value.length && value[0] ? value[0].entity_name : null,
        type: key,
        programs: value.map((list) => {
          return {
            campus: list && list.campus ? list && list.campus : null,
            school: list && list.school ? list && list.school : null,
            level: list && list.level ? list && list.level : null,
          };
        }),
      }))
      .value();
    return finalPayload;
  }

  updateUserEntities(entityToDelete) {
    // console.log(entityToDelete);
    const entities = this.createPayload(entityToDelete);
    const payload = {
      entities: entities,
      email: this.originalUserDetail.email,
    };
    this.isWaitingForResponse = true;
    this.subs.sink = this.userMgtService.updateUserAfterDeleteEntity(this.userId, payload,this.currentUserTypeId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          Swal.fire({
            type: 'success',
            title: 'Bravo!',
            confirmButtonText: 'OK',
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.fetchUserDetail();
          });
        }
      },
      (error) => {
        this.authService.postErrorLog(error);
        this.isWaitingForResponse = false;
        this.swalError(error);
        return;
      },
    );
  }

  updateUserMultipleEntities(entityToDelete) {
    if (entityToDelete.length >= this.dataSource.data.length) {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Followup_12.Title'),
        html: this.translate.instant('Followup_12.Text'),
        confirmButtonText: this.translate.instant('Followup_12.Button'),
      });
      return;
    }
    // console.log(entityToDelete);
    const entities = this.createPayloadMultiple(entityToDelete);
    const payload = {
      entities: entities,
      email: this.originalUserDetail.email,
    };
    // console.log('payload', payload);
    this.isWaitingForResponse = true;
    this.subs.sink = this.userMgtService.updateUserAfterDeleteEntity(this.userId, payload,this.currentUserTypeId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp) {
          Swal.fire({
            type: 'success',
            title: 'Bravo!',
            confirmButtonText: 'OK',
            allowEnterKey: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
          }).then(() => {
            this.selection.clear();
            this.userSelected = [];
            this.isCheckedAll = false;
            this.fetchUserDetail();
          });
        }
      },
      (error) => {
        this.authService.postErrorLog(error);
        this.isWaitingForResponse = false;
        this.swalError(error);
        return;
      },
    );
  }

  swalError(err) {
    this.isWaitingForResponse = false;
    // console.log('[Response BE][Error] : ', err);
    if (err['message'] === 'GraphQL error: This admission user type already have student admitted to this user!') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('User_S3.TITLE'),
        text: this.translate.instant('User_S3.TEXT'),
        confirmButtonText: this.translate.instant('User_S3.BUTTON'),
      });
    } else if (err && err['message'] && err['message'].includes('Network error: Http failure response for')) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('BAD_CONNECTION.Title'),
        html: this.translate.instant('BAD_CONNECTION.Text'),
        confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
        allowOutsideClick: false,
        allowEnterKey: false,
        allowEscapeKey: false,
      });
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: 'OK',
      });
    }
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }
  checkboxLabel(row?): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected() || this.isCheckedAll) {
      this.selection.clear();
      this.isCheckedAll = false;
    } else {
      this.isCheckedAll = true;
      this.dataSource.data.forEach((row) => this.selection.select(row));
    }
  }
  showOptions(info) {
    const numSelected = this.selection.selected.length;
    if (numSelected > 0) {
      this.disabledExport = false;
    } else {
      this.disabledExport = true;
    }
    this.userSelected = [];
    this.userSelectedId = [];
    this.selectType = info;
    const data = this.selection.selected.length >= this.dataCount ? this.dataSource.filteredData : this.selection.selected;
    data.forEach((user) => {
      this.userSelected.push(user);
    });
    // console.log('showOptions', data, this.dataSource);
  }
}
