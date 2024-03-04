import { Component, Input, OnChanges, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { UserService } from 'app/service/user/user.service';
import { map } from 'rxjs/operators';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import { AddUserEntityDialogComponent } from '../add-user-entity-dialog/add-user-entity-dialog.component';
import * as _ from 'lodash';
import { AuthService } from 'app/service/auth-service/auth.service';

@Component({
  selector: 'ms-user-usertype-tab',
  templateUrl: './user-usertype-tab.component.html',
  styleUrls: ['./user-usertype-tab.component.scss'],
})
export class UserUsertypeTabComponent implements OnInit, OnChanges {
  @Input() userTypeData;
  @Input() selectedUserData;
  @Input() isWaitingForResponse;
  @Output() reloadTable = new EventEmitter<any>();

  myInnerHeight = 1920;
  private subs = new SubSink();

  // Table Configuration
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource = new MatTableDataSource([]);
  selectType: any;
  dataCount = 0;
  noData;
  sortValue = null;
  isReset: Boolean = false;
  dataLoaded: Boolean = false;

  displayedColumns: string[] = ['userType', 'school', 'campus', 'level', 'action'];
  filterColumns: string[] = ['userTypeFilter', 'schoolFilter', 'campusFilter', 'levelFilter', 'actionFilter'];

  userTypeFilterCtrl = new UntypedFormControl(null);
  schoolFilterCtrl = new UntypedFormControl(null);
  campusFilterCtrl = new UntypedFormControl(null);
  levelFilterCtrl = new UntypedFormControl(null);

  filteredValues = {
    userType: '',
    school: '',
    campus: '',
    level: '',
  };
  timeOutVal: any;
  currentUserTypeId

  constructor(
    private dialog: MatDialog,
    private translate: TranslateService,
    private userService: UserService,
    private candidatesService: CandidatesService,
    private authService:AuthService
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getLocalStorageUser();
    const isPermission = this.authService.getPermission();
    const currentUserEntity = currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

  }

  initFilter() {
    this.subs.sink = this.userTypeFilterCtrl.valueChanges.subscribe((searchTxt) => {
      this.filteredValues.userType = searchTxt;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
    });
    this.subs.sink = this.schoolFilterCtrl.valueChanges.subscribe((searchTxt) => {
      this.filteredValues.school = searchTxt;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
    });
    this.subs.sink = this.campusFilterCtrl.valueChanges.subscribe((searchTxt) => {
      this.filteredValues.campus = searchTxt;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
    });
    this.subs.sink = this.levelFilterCtrl.valueChanges.subscribe((searchTxt) => {
      this.filteredValues.level = searchTxt;
      this.dataSource.filter = JSON.stringify(this.filteredValues);
    });

    this.dataSource.sortingDataAccessor = (item, property) => {
      console.log(item, property);
      switch (property) {
        case 'userType':
          return item.type.name ? item.type.name : null;
        case 'school':
          return item.candidate_school ? item.candidate_school : null;
        case 'campus':
          return item.candidate_campus ? item.candidate_campus : null;
        case 'level':
          return item.level ? item.level : null;
        case 'fullRateExternal':
          return item.candidate_level ? item.candidate_level : null;
        default:
          return item[property];
      }
    };
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = this.customFilterPredicate();
  }

  ngOnChanges() {
    console.log('_1', this.userTypeData);
    if (this.userTypeData && this.userTypeData.length > 0) {
      this.dataSource.data = this.userTypeData;
      this.dataCount = this.userTypeData.length;
      this.dataSource.paginator = this.paginator;
      this.initFilter();
    } else {
      this.dataSource.data = [];
      this.noData = this.dataSource.connect().pipe(map((data) => data.length === 0));
      this.dataCount = 0;
      this.dataSource.paginator = this.paginator;
    }
  }

  disableDeleteButton() {
    return this.dataCount === 1 ? true : false;
  }

  customFilterPredicate() {
    return function (data, filter: string): boolean {
      const searchString = JSON.parse(filter);
      // console.log('_>>>', searchString);
      const userTypeFound = !data.type.name
        ? true
        : searchString.userType && data.type.name
        ? data.type.name.toString().trim().toLowerCase().indexOf(searchString.userType.toLowerCase()) !== -1
        : true;
      const schoolFound = searchString.school
        ? data.candidate_school
          ? data.candidate_school.toString().trim().toLowerCase().indexOf(searchString.school.toLowerCase()) !== -1
          : false
        : true;
      const campusFound = searchString.campus
        ? data.candidate_campus
          ? data.candidate_campus.toString().trim().toLowerCase().indexOf(searchString.campus.toLowerCase()) !== -1
          : false
        : true;
      const levelFound = searchString.level
        ? data.candidate_level
          ? data.candidate_level.toString().trim().toLowerCase().indexOf(searchString.level.toLowerCase()) !== -1
          : false
        : true;

      return userTypeFound && schoolFound && campusFound && levelFound;
    };
  }

  getAutomaticHeight() {
    this.myInnerHeight = window.innerHeight - 231;
    return this.myInnerHeight;
  }

  openAddUserTypeDialog() {
    const dialog = this.dialog.open(AddUserEntityDialogComponent, {
      panelClass: 'certification-rule-pop-up',
      width: '850px',
      data: this.selectedUserData,
      disableClose:true
    });
    dialog.afterClosed().subscribe((res) => {
      console.log(res);
      if (res) {
        this.candidatesService.setIsSaved();
      }
    });
  }

  resetFilter() {
    this.filteredValues = {
      campus: '',
      school: '',
      level: '',
      userType: '',
    };
    this.dataSource.filter = JSON.stringify(this.filteredValues);
    this.reloadTable.emit(true);
    this.userTypeFilterCtrl.setValue('');
    this.schoolFilterCtrl.setValue('');
    this.campusFilterCtrl.setValue('');
    this.levelFilterCtrl.setValue('');
  }

  removeUsertype(value, index) {
    console.log(value, index);
    let timeDisabled = 3;
    Swal.fire({
      title: this.translate.instant('USERMODIFY_S1.TITLE'),
      html: this.translate.instant('USERMODIFY_S1.TEXT'),
      type: 'warning',
      allowEscapeKey: true,
      showCancelButton: true,
      confirmButtonText: this.translate.instant('USERMODIFY_S1.BUTTON_1', { timer: timeDisabled }),
      cancelButtonText: this.translate.instant('USERMODIFY_S1.BUTTON_2'),
      allowOutsideClick: false,
      allowEnterKey: false,
      onOpen: () => {
        Swal.disableConfirmButton();
        const confirmBtnRef = Swal.getConfirmButton();
        const intVal = setInterval(() => {
          timeDisabled -= 1;
          confirmBtnRef.innerText = this.translate.instant('USERMODIFY_S1.BUTTON_1') + ` (${timeDisabled})`;
        }, 1000);

        this.timeOutVal = setTimeout(() => {
          confirmBtnRef.innerText = this.translate.instant('USERMODIFY_S1.BUTTON_1');
          Swal.enableConfirmButton();
          clearInterval(intVal);
          clearTimeout(this.timeOutVal);
        }, timeDisabled * 1000);
      },
    }).then((res) => {
      clearTimeout(this.timeOutVal);
      if (res.value) {
        const userSelected = _.cloneDeep(this.userTypeData);
        userSelected.splice(index, 1);
        const payload = this.createPayload(this.selectedUserData, userSelected);
        // console.log(payload);
        this.subs.sink = this.userService.updateUser(this.selectedUserData._id, payload,this.currentUserTypeId).subscribe(
          (res) => {
            if (res) {
              // console.log(res);
              Swal.fire({
                type: 'success',
                title: this.translate.instant('USERMODIFY_S1B.TITLE'),
                html: this.translate.instant('USERMODIFY_S1B.TEXT'),
                confirmButtonText: this.translate.instant('USERMODIFY_S1B.BUTTON'),
              }).then(() => {
                this.candidatesService.setIsSaved();
              });
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
    });
  }

  createPayload(originData, updatedEntities) {
    updatedEntities = updatedEntities.map((res) => {
      return {
        entity_name: `academic`,
        type: res.type._id,
        school_type: `preparation_center`,
        candidate_campus: res.candidate_campus,
        candidate_school: res.candidate_school,
        candidate_level: res.candidate_level,
      };
    });
    const payload = {
      civility: originData.civility,
      first_name: originData.first_name,
      last_name: originData.last_name,
      profile_picture: originData.profile_picture,
      email: originData.email,
      position: originData.position,
      office_phone: originData.office_phone,
      portable_phone: originData.portable_phone,
      entities: updatedEntities,
      user_status: originData.user_status,
    };
    return payload;
  }
}
