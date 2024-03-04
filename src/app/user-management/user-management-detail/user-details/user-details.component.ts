import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatTabGroup } from '@angular/material/tabs';
import { TranslateService } from '@ngx-translate/core';
import { StudentUrgentDialogComponent } from 'app/candidate-file/student-urgent-dialog/student-urgent-dialog.component';
import { AuthService } from 'app/service/auth-service/auth.service';
import { CandidatesService } from 'app/service/candidates/candidates.service';
import { UsersService } from 'app/service/users/users.service';
import { ApplicationUrls } from 'app/shared/settings';
import * as moment from 'moment';
import { SubSink } from 'subsink';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { environment } from 'environments/environment';
import { UserManagementService } from 'app/user-management/user-management.service';
import { UtilityService } from 'app/service/utility/utility.service';
import { Router } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { UserTableData } from 'app/users/user.model';
import { UserService } from 'app/service/user/user.service';
import { UserEmailDialogComponent } from 'app/users/user-email-dialog/user-email-dialog.component';

@Component({
  selector: 'ms-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss'],
})
export class UserDetailsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  @Input() userId;
  @Input() selectedUserData;
  @Input() tab;
  @Input() isTeacherList;
  @Output() reload: EventEmitter<boolean> = new EventEmitter();
  @Output() loading: EventEmitter<boolean> = new EventEmitter();
  @ViewChild('candidateMatGroup', { static: false }) candidateMatGroup: MatTabGroup;
  @ViewChild('admissionStatus', { static: false }) matMenuTrigger: MatMenuTrigger;
  // mailStudentsDialog: MatDialogRef<MailCanidateDialogComponent>;
  // studentUrgentMailDialog: MatDialogRef<StudentUrgentDialogComponent>;
  user: any = {};
  isWaitingForResponse: Boolean = true;
  private subs = new SubSink();
  tabs = {
    'note-tab': 'Add a Note',
    'history-tab': 'Candidate history',
    'edit-tab': 'Modifications',
    'evolution-tab': 'Evolution',
  };

  maleCandidateIcon = '../../../../../assets/img/student_icon.png';
  femaleCandidateIcon = '../../../../../assets/img/student_icon_fem.png';
  neutralStudentIcon = '../../../../../assets/img/student_icon_neutral.png';
  userProfilePic = '../../../../../assets/img/user-1.jpg';
  userProfilePic1 = '../../../../../assets/img/user-3.jpg';
  userProfilePic2 = '../../../../../assets/img/user-5.jpg';
  greenHeartIcon = '../../../../../assets/img/enagement_icon_green.png';
  selectedIndex = 0;
  userData = [];
  personalSituation = false;
  restrictiveCondition = false;
  studentStatusList = [];
  listStatusAdmitted = [{ value: 'resign', key: 'Resign' }];
  listStatusEngaged = [{ value: 'resigned_after_engaged', key: 'Resign after engaged' }];
  listStatusRegistered = [{ value: 'resigned_after_registered', key: 'Resign after registered' }];
  currentUser: any;
  backupUser: any;
  currentUserTypeId: any;

  mailUser: MatDialogRef<UserEmailDialogComponent>;
  studentUrgentMailDialog: MatDialogRef<StudentUrgentDialogComponent>;

  constructor(
    private candidateService: CandidatesService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private userService: UsersService,
    private usersService: UserService,
    private authService: AuthService,
    private utilService: UtilityService,
    private router: Router,
    private ngxPermissionService: NgxPermissionsService,
    private userMgtService: UserManagementService,
  ) {}

  ngOnInit() {
    const user = this.authService.getLocalStorageUser();
    const isPermission = this.authService.getPermission();
    const currentUserEntity = user?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;

    this.moveToTab(this.tab);
    this.setupRefreshListener();
  }

  ngAfterViewInit() {
    this.moveToTab(this.tab);
  }

  ngOnChanges() {
    this.isWaitingForResponse = true;
    this.getOneUser();
    // this.getAllCandidateComment();
    this.currentUser = this.authService.getCurrentUser();
  }

  setupRefreshListener() {
    // listen to changes from the children tabs on user information update
    this.subs.sink = this.userMgtService.refresh.subscribe((resp) => {
      if (resp) {
        this.getOneUser();
      }
    });
  }

  getOneUser() {
    this.isWaitingForResponse = true;
    this.subs.sink = this.userService.getOneUserCardDetail(this.userId).subscribe(
      (user) => {
        this.isWaitingForResponse = false;
        if (user) {
          this.user = user;
        }
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
        this.isWaitingForResponse = false;
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

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  moveToTab(tab) {
    if (tab) {
      switch (tab) {
        case 'Identity':
          this.selectedIndex = 2;
          break;
        case 'Contact':
          this.selectedIndex = 3;
          break;
        default:
          this.selectedIndex = 0;
      }
    }
  }

  nextStep(value) {
    if (value) {
      this.moveToTab(value);
    }
  }

  reloadData(value) {
    if (value) {
      this.getOneUser();
      this.reload.emit(true);
    }
  }

  loadingData(value) {
    this.loading.emit(value);
  }

  downloadCV() {
    const fileUrl = this.user.curriculum_vitae ? this.user.curriculum_vitae.s3_path : null;
    if (fileUrl) {
      const a = document.createElement('a');
      a.target = '_blank';
      a.href = `${environment.apiUrl}/fileuploads/${fileUrl}?download=true`.replace('/graphql', '');
      a.click();
      a.remove();
    }
  }

  connectAsUser(user: UserTableData) {
    const currentUser = this.utilService.getCurrentUser();
    const unixUserType = _.uniqBy(user.entities, 'type.name');
    const unixEntities = _.uniqBy(user.entities, 'entity_name');
    const unixUserTypeId = _.uniqBy(user.entities, 'type._id');
    let unixSchoolType = [];
    let unixSchool = [];
    if (unixEntities && unixEntities.length && unixEntities[0].entity_name === 'academic') {
      unixSchoolType = _.uniqBy(user.entities, 'school_type');
      unixSchool = _.uniqBy(user.entities, 'school._id');
    }
    this.isWaitingForResponse = true;

    this.backupUser = JSON.parse(localStorage.getItem('backupUser'));
    if (this.backupUser) {
      this.isWaitingForResponse = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('ConnectAs.Title'),
        html: this.translate.instant('ConnectAs.Text'),
        allowEscapeKey: true,
        allowOutsideClick: false,
        confirmButtonText: this.translate.instant('ConnectAs.Button'),
      });
    } else if (unixUserTypeId === '61dd3ccff647127fd6bf65d7') {
      this.isWaitingForResponse = false;
      Swal.fire({
        type: 'info',
        title: this.translate.instant('ConnectAs.Under Construction'),
        allowEscapeKey: true,
        allowOutsideClick: false,
        confirmButtonText: this.translate.instant('ConnectAs.Button'),
      });
    } else {
      this.getUserTableColumnSettings(user?._id)
      this.subs.sink = this.authService.loginAsUser(currentUser._id, user._id).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('SUCCESS'),
              html: this.translate.instant('USER_S7_SUPERUSER.TEXT', {
                UserCivility: user.civility !== 'neutral' ? this.translate.instant(user.civility) : '',
                UserFirstName: user.first_name,
                UserLastName: user.last_name,
              }),
              allowEscapeKey: true,
              allowOutsideClick: false,
              confirmButtonText: this.translate.instant('UNDERSTOOD'),
            }).then((result) => {
              this.authService.backupLocalUserProfileAndToken();
              const tempResp = _.cloneDeep(resp);
              const tempProgram = _.cloneDeep(resp);
              const program = this.utilService.setDataProgram(tempProgram.user.entities);
              tempProgram.user.entities = this.utilService.mergeHierarchyPermission(_.cloneDeep(tempProgram.user.entities));
              const sortedEntities = this.utilService.sortEntitiesByHierarchy(tempProgram.user.entities);

              const temp = tempProgram.user;
              temp.entities = sortedEntities;
              temp.app_data = program;
              tempResp.user = temp;

              const permissionsId = [];
              if (sortedEntities && sortedEntities.length > 0) {
                sortedEntities.forEach((entity) => {
                  console.log('UserType name : ', entity.type.name);
                  permissionsId.push(entity.type._id);
                });
              }

              this.authService.setLocalUserProfileAndToken(tempResp);
              this.authService.setPermission([sortedEntities[0].type.name]);
              this.ngxPermissionService.flushPermissions();
              this.ngxPermissionService.loadPermissions([sortedEntities[0].type.name]);
              this.usersService.reloadCurrentUser(true);

              const listExceptionUserTypeId = ['6278e02eb97bfb30674e76b0', '6278e027b97bfb30674e76af', '5fe98eeadb866c403defdc6c'];
              if (permissionsId.findIndex((permission) => listExceptionUserTypeId.includes(permission)) < 0) {
                this.router.navigate(['/home']);
              } else {
                this.router.navigate(['/mailbox/inbox']);
              }
            });
          }
        },
        (err) => {
          // Record error log
          this.authService.postErrorLog(err);
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
            if (err['message'] === 'GraphQL error: you cannot logged in as this user') {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SWAL_CONNECTAS.TITLE'),
                html: this.translate.instant('SWAL_CONNECTAS.TEXT'),
                allowEscapeKey: true,
                allowOutsideClick: false,
                confirmButtonText: this.translate.instant('SWAL_CONNECTAS.BUTTON'),
              });
            } else {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('SORRY'),
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            }
          }
        },
      );
      // } else {
      //   // if user has multiple entity, show dialog to choose entity
      //   this.isWaitingForResponse = false;
      //   this.dialog.open(LoginAsUserDialogComponent, {
      //     disableClose: true,
      //     panelClass: 'certification-rule-pop-up',
      //     width: '615px',
      //     data: user,
      //   });
    }
  }

  getUserTableColumnSettings(user_id) {
    if (user_id) {
      this.subs.sink = this.authService.GetUserTableColumnSettings(user_id).subscribe(
        (resp) => {
          if (resp && resp?.length) {
            localStorage.setItem('templateTable', JSON.stringify(resp));
          }
        },
        (err) => {
          Swal.fire({
            type: 'info',
            title: 'Warning',
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
  }
  sendMail(data) {
    this.mailUser = this.dialog.open(UserEmailDialogComponent, {
      disableClose: true,
      width: '750px',
      data: data,
    });
  }

  sendReminderRegistration(data) {
    if (data.user_status === 'active') {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('User_Registered_S1.TITLE'),
        text: this.translate.instant('User_Registered_S1.TEXT'),
      });
      return;
    }
    this.isWaitingForResponse = true;
    this.subs.sink = this.userService.sendReminderUserN1(this.translate.currentLang, data._id, this.currentUserTypeId).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        console.log(resp);
        Swal.fire({
          type: 'success',
          title: this.translate.instant('Bravo !'),
          text: this.translate.instant('Email Sent'),
        });
      },
      (err) => {
        // Record error log
        this.authService.postErrorLog(err);
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

  openWhatsapp(element) {
    const whatsAppUrl = 'https://api.whatsapp.com/send?phone=' + element.telephone + '&text=';
    const whatsAppText = this.translate.instant('whatsapp message', {
      name: element.first_name,
      dev: `${this.translate.instant(this.currentUser.civility)} ${this.currentUser.first_name} ${this.currentUser.last_name}`,
      position: element.position ? element.position : '',
    });
    window.open(whatsAppUrl + whatsAppText, '_blank');
  }

  callCandidates(element) {
    return;

    Swal.fire({
      type: 'info',
      title: this.translate.instant('CANDIDAT_S3.TITLE'),
      html: this.translate.instant('CANDIDAT_S3.TEXT', {
        candidateName: this.translate.instant(element.civility) + ' ' + element.first_name + ' ' + element.last_name,
      }),
      showCancelButton: true,
      allowEscapeKey: true,
      allowOutsideClick: false,
      reverseButtons: true,
      confirmButtonText: this.translate.instant('CANDIDAT_S3.BUTTON_1'),
      cancelButtonText: this.translate.instant('CANDIDAT_S3.BUTTON_2'),
    }).then((res) => {
      if (res.value) {
        const payload = _.cloneDeep(element);
        if (payload && payload.date_of_birth) {
          payload.date_of_birth = moment(payload.date_of_birth).format('DD/MM/YYYY');
        }
        delete payload._id;
        delete payload.student_mentor_id;
        delete payload.admission_member_id;
        delete payload.count_document;
        delete payload.user_id;
        delete payload.date_added;
        delete payload.announcement_call;
        delete payload.candidate_unique_number;
        delete payload.billing_id;
        if (payload && payload.campus) {
          payload.campus = payload.campus._id;
        }
        if (payload && payload.intake_channel) {
          payload.intake_channel = payload.intake_channel._id;
        }
        if (payload && payload.scholar_season) {
          payload.scholar_season = payload.scholar_season._id;
        }
        if (payload && payload.level) {
          payload.level = payload.level._id;
        }
        if (payload && payload.school) {
          payload.school = payload.school._id;
        }
        if (payload && payload.sector) {
          payload.sector = payload.sector._id;
        }
        if (payload && payload.speciality) {
          payload.speciality = payload.speciality._id;
        }
        if (payload && payload.registration_profile) {
          payload.registration_profile = payload.registration_profile._id;
        }
        if (payload && payload.type_of_formation_id) {
          payload.type_of_formation_id = payload.type_of_formation_id._id;
        }
        this.subs.sink = this.candidateService.UpdateCandidateCall(element._id, payload).subscribe((resp) => {
          console.log('Candidate Updated!', resp);
          Swal.fire({
            type: 'success',
            title: this.translate.instant('CANDIDAT_S4.MESSAGE'),
            html: this.translate.instant('CANDIDAT_S4.TEXT', {
              candidateName: this.translate.instant(element.civility) + ' ' + element.first_name + ' ' + element.last_name,
            }),
            allowOutsideClick: false,
            confirmButtonText: this.translate.instant('CANDIDAT_S4.BUTTON'),
          }).then((resss) => {
            // this.viewCandidateInfo(element._id, 'note-tab');
          });
        });
      }
    });
  }

  sendUrgentMail(data) {
    this.studentUrgentMailDialog = this.dialog.open(StudentUrgentDialogComponent, {
      disableClose: true,
      width: '750px',
      data: data,
    });
  }
}
