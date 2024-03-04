import { NgxImageCompressService } from 'ngx-image-compress';
import { Component, OnInit, Input, OnDestroy, ViewChild, OnChanges, ChangeDetectorRef} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CoreService } from '../../service/core/core.service';
import { MenuItems } from '../../core/menu/menu-items/menu-items';
import { UntypedFormControl } from '@angular/forms';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { UserService } from 'app/service/user/user.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { VersionService } from 'app/version/version.service';
import { SubSink } from 'subsink';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { PermissionService } from 'app/service/permission/permission.service';
import { MailToGroupDialogComponent } from 'app/mailbox/mail-to-group-dialog/mail-to-group-dialog.component';
import { environment } from 'environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { UtilityService } from 'app/service/utility/utility.service';
import Swal from 'sweetalert2';
import { ContactUsDialogComponent } from 'app/need-help/contact-us/contact-us-dialog.component';
import { NgxPermissionsService } from 'ngx-permissions';
import { ApplicationUrls } from '../settings';
import { AcademicJourneyService } from 'app/service/academic-journey/academic-journey.service';
import * as _ from 'lodash';
import { ParseStringDatePipe } from '../pipes/parse-string-date.pipe';
import { ExportGroupsDialogComponent } from '../components/export-groups-dialog/export-groups-dialog.component';
import { QuickSearchListDialogComponent } from '../components/quick-search-list-dialog/quick-search-list-dialog.component';
import { UsersService } from 'app/service/users/users.service';
import { StatusUpdateDialogComponent } from '../components/status-update-dialog/status-update-dialog.component';
import { AppPermission } from 'app/models/app-permission.model';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'ms-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
  providers: [ParseStringDatePipe],
})
export class SideBarComponent implements OnInit, OnDestroy, OnChanges {
  private subs = new SubSink();
  @Input() menuList: any;
  @Input() verticalMenuStatus: boolean;
  @ViewChild('fileUpload', { static: false }) uploadInput: any;

  appData: AppPermission;
  isLoadingUpload = false;
  isStudent = false;
  isAlumni = false;
  isAlumniMember = false;
  studentId = '';
  acadJourneyId = '';
  studentData: any;
  currentUser: any;
  profilePic = new UntypedFormControl('');
  // frontendVersion: string;
  // backendVersion: string;
  version: string;
  maleUserIcon = '../../../../assets/img/student_icon.png';
  femaleUserIcon = '../../../../assets/img/student_icon_fem.png';
  urgentMessageConfig: MatDialogConfig = {
    disableClose: true,
    width: '600px',
  };
  config: MatDialogConfig = {
    disableClose: true,
    width: '800px',
  };
  serverLogoPath = `${environment.fileUrl}`;
  serverimgPath = `${ApplicationUrls.baseApi}/fileuploads/`.replace('/graphql', '');
  contactUsDialogComponent: MatDialogRef<ContactUsDialogComponent>;
  mailToGroupDialogComponent: MatDialogRef<MailToGroupDialogComponent>;

  userSearch = new UntypedFormControl('');

  isEntityOperator = false;
  isAcadDirAdmin = false;
  isWaitingForResponse = false;
  // Configuration of the Popup Size and display
  configCat: MatDialogConfig = {
    disableClose: true,
    panelClass: 'certification-rule-pop-up',
    minWidth: '95%',
    minHeight: '81%',
  };

  envLink = environment.apiUrl;
  showLogo: Boolean = false;
  someChildActive:boolean;
  menuitems: any[];
  imageBeforeCompressed;
  imageAfterCompressed;
  currentUserTypeId;

  constructor(
    private cdr: ChangeDetectorRef,
    public translate: TranslateService,
    private router: Router,
    public coreService: CoreService,
    public menuItems: MenuItems,
    private authService: AuthService,
    private fileUploadService: FileUploadService,
    private userService: UserService,
    private versionService: VersionService,
    public dialog: MatDialog,
    public permissionService: PermissionService,
    private sanitizer: DomSanitizer,
    public utilService: UtilityService,
    private permissions: NgxPermissionsService,
    private acadJourneyService: AcademicJourneyService,
    private parseStringDatePipe: ParseStringDatePipe,
    private usersService: UsersService,
    private imageCompress: NgxImageCompressService,
  ) {}

  ngOnInit() {
    this.getAppData();
    this.currentUser = this.authService.getLocalStorageUser();
    const isPermission = this.authService.getPermission();
    const currentUserEntity = this.currentUser?.entities?.find((resp) => resp?.type?.name === isPermission[0]);
    this.currentUserTypeId = currentUserEntity?.type?._id;
    // need to set timeout to wait permission get loaded successfulyy if reload pages
    this.subs.sink = this.utilService.getAppPermission().subscribe((res) => {
      this.appData = res;
      console.log('test', this.appData);
    });
    console.log('ini currenctUser di sidebar', this.currentUser);
    this.getCurrentUser();
    const profilePicUrl = this.currentUser.profile_picture ? this.currentUser.profile_picture : 'assets/img/pro-thumb.jpg';
    this.profilePic.patchValue(profilePicUrl);
    this.getVersion();
    this.isStudent = !!this.permissions.getPermission('Student');
    this.isAlumni = !!this.permissions.getPermission('Alumni');
    this.isAlumniMember = !!this.permissions.getPermission('Alumni Member');
    if (this.isStudent) {
      this.getDataStudent();
    }

    /// check logo only show if operator only
    this.showLogo = this.checkLogo();

    // if(permission)
    // // ************ Get Data User for permission of button quick search
    // this.isADMTC = this.utilService.isUserEntityOPERATOR();
    // this.isAcadDirAdmin = this.utilService.isUserAcadDirAdmin();
    // this.isCertifierDirAdmin = this.utilService.isUserCRDirAdmin();
    this.updateMenuItems();
    this.subs.sink = this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(event => {
      this.updateMenuItems();
    });

  }

  getAppData() {
    this.utilService.getAppPermission().subscribe((resp) => {
      this.appData = resp;
      this.utilService.operator = resp;
      console.log('operatorDetail:', resp);
    });
  }

  ngOnChanges() {
    this.currentUser = this.authService.getLocalStorageUser();
    // ************ Get Data User for permission of button quick search
    // this.isADMTC = this.utilService.isUserEntityOPERATOR();
    // this.isAcadDirAdmin = this.utilService.isUserAcadDirAdmin();
    // this.isCertifierDirAdmin = this.utilService.isUserCRDirAdmin();
  }


  updateMenuItems(): void {
    this.menuitems = this.menuList.getAll(); // Replace with your actual logic

    // Check for active children and set someChildActive for each menu item
    this.menuitems.forEach(menuItem => {
      menuItem.someChildActive = this.hasActiveChild(menuItem);
    });
    
      this.cdr.detectChanges();
  }

  hasActiveChild(menuItem: any): boolean {
    if (menuItem?.children) {
      // return boolean true or fale to fill in the someChildActive variable returned
      return menuItem?.children?.some(child => this.router.isActive(child.state, false));
    }
    return false;
  }

  onPaste(event) {
    // ************ case email
    const value = event.clipboardData.getData('text/plain').trim();
    const regexMail =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const isEmail = regexMail.test(value);

    // ************ case student number
    const regexStudentNumber = /^[aA]\d{5,}$/
    const isStudentNumber = regexStudentNumber.test(value);

    // ************ Automatically Search if match condition
    if(isEmail) {
      this.quickSearchEmail('email', value);
    } else if(isStudentNumber) {
      this.quickSearchStudent(value, 'student');
    }
  }

  getCurrentUser() {
    this.subs.sink = this.userService.reloadCurrentUser$.subscribe((isReload) => {
      if (isReload) {
        this.currentUser = this.authService.getLocalStorageUser();
        this.userService.reloadCurrentUser(false);
        this.isStudent = !!this.permissions.getPermission('Student');
        this.isAlumni = !!this.permissions.getPermission('Alumni');
        this.isAlumniMember = !!this.permissions.getPermission('Alumni Member');
        if (this.isStudent) {
          this.getDataStudent();
        }
        /// check logo only show if operator only
        this.showLogo = this.checkLogo();
      }
    });
    this.subs.sink = this.userService.reloadPhotoUser$.subscribe((isReload) => {
      if (isReload) {
        console.log('Photo Changes!!');
        this.userService.reloadPhotoUser(false);
        this.currentUser = this.authService.getLocalStorageUser();
      }
    });
  }

  sendUrgentMessage() {
    // this.urgentMessageDialogComponent = this.dialog.open(UrgentMessageDialogComponent, this.urgentMessageConfig);
  }

  sendMailToGroup() {
    this.mailToGroupDialogComponent = this.dialog.open(MailToGroupDialogComponent, this.config);
  }
  handleInputChange(fileInput: Event) {
    const acceptable = ['jpg', 'jpeg', 'png'];
    const file = (<HTMLInputElement>fileInput.target).files[0];
    if (file) {
      this.isLoadingUpload = true;
      const fileType = this.utilService.getFileExtension(file.name).toLocaleLowerCase();
      if (acceptable.includes(fileType)) {
        this.subs.sink = this.fileUploadService.singleUpload(file).subscribe(
          (res) => {
            this.isLoadingUpload = false;
            this.profilePic.patchValue(res.s3_file_name);
            this.currentUser.profile_picture = res.s3_file_name;

            const payload = {};
            payload['email'] = this.currentUser.email;
            payload['profile_picture'] = res.s3_file_name;
            payload['first_name'] = this.currentUser.first_name;
            payload['last_name'] = this.currentUser.last_name;

            this.subs.sink = this.userService.updateUser(this.currentUser._id, payload, this.currentUserTypeId).subscribe(
              (resp) => {
                if (resp) {
                  const temp = this.currentUser;
                  temp.profile_picture = res.s3_file_name;
                  localStorage.setItem('userProfile', JSON.stringify(temp));
                  if (this.isStudent) {
                    this.createPayloadForAcademicJourney(temp);
                  }
                }
                // this.subs.sink = this.userService.getUserProfileData(resp.email).subscribe((user) => {
                //   this.authService.setLocalUserProfile(user);
                // });
              },
              (err) => {
                this.isLoadingUpload = false;
                if (
                  err &&
                  err['message'] &&
                  (err['message'].includes('jwt expired') ||
                    err['message'].includes('str & salt required') ||
                    err['message'].includes('Authorization header is missing') ||
                    err['message'].includes('salt'))
                ) {
                  this.authService.handlerSessionExpired();
                  return;
                }
                Swal.fire({
                  type: 'info',
                  title: this.translate.instant('SORRY'),
                  text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                  confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                });
              },
            );
          },
          (err) => {
            this.isLoadingUpload = false;
            if (
              err &&
              err['message'] &&
              (err['message'].includes('jwt expired') ||
                err['message'].includes('str & salt required') ||
                err['message'].includes('Authorization header is missing') ||
                err['message'].includes('salt'))
            ) {
              this.authService.handlerSessionExpired();
              return;
            }
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      } else {
        this.isLoadingUpload = false;
        Swal.fire({
          type: 'info',
          title: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TITLE'),
          text: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: '.jpg, .jpeg, .png' }),
          allowEscapeKey: false,
          allowOutsideClick: false,
          allowEnterKey: false,
        });
      }
    }
    this.resetFileState();
  }

  resetFileState() {
    this.uploadInput.nativeElement.value = '';
  }

  openUploadWindow() {
    const file = this.uploadInput.nativeElement.click();
  }

  // render to the crm page
  onClick() {
    const first = location.pathname.split('/')[1];
    if (first === 'horizontal') {
      this.router.navigate(['/horizontal/guide/table_1']);
    } else {
      // this.router.navigate(['/guide/table_1']);
      if (this.permissions.getPermission('HR')) {
        this.router.navigate(['/students-card']);
      } else if (this.permissions.getPermission('Chief Group Academic')) {
        this.router.navigate(['/school-group']);
      } else if (this.permissions.getPermission('Student')) {
        this.router.navigate(['/my-file']);
      } else {
        this.router.navigate(['/dashboard-register']);
      }
    }
  }

  openExportGroups() {
    this.dialog.open(ExportGroupsDialogComponent, {
      disableClose: true,
      panelClass: 'certification-rule-pop-up',
      width: '600px',
    });
  }

  openStatusUpdateDialog() {
    this.dialog.open(StatusUpdateDialogComponent, {
      disableClose: true,
      panelClass: 'certification-rule-pop-up',
      width: '600px',
    });
  }

  getVersion() {
    // frontend, also
    // const packages = require('../../../../package.json');
    // this.version = packages.version;
    const storedVersion = localStorage.getItem('version');

    this.versionService.getBackendVersion().subscribe((resp) => {
      this.version = resp;
      if (!storedVersion) {
        localStorage.setItem('version', this.version);
      } else if (storedVersion && storedVersion !== this.version) {
        this.authService.logOut();
      }
    });
  }

  imgURL(src: string) {
    return this.sanitizer.bypassSecurityTrustUrl(src);
  }

  getDataStudent() {
    console.log('First Gate!!');
    this.subs.sink = this.acadJourneyService.GetStudentId(this.currentUser._id).subscribe(
      (student) => {
        this.studentId = student.student_id._id;
        this.subs.sink = this.acadJourneyService.getMySummary(student.student_id._id).subscribe(
          (response) => {
            const temp = response;
            if (temp && temp._id) {
              this.acadJourneyId = temp._id;
            } else {
              this.acadJourneyId = '';
            }
            console.log('Masuk Sini Ndak!!');
            this.createPayloadForAcademicJourney(this.currentUser);
          },
          (err) => {
            if (
              err &&
              err['message'] &&
              (err['message'].includes('jwt expired') ||
                err['message'].includes('str & salt required') ||
                err['message'].includes('Authorization header is missing') ||
                err['message'].includes('salt'))
            ) {
              this.authService.handlerSessionExpired();
              return;
            }
            Swal.fire({
              type: 'info',
              title: this.translate.instant('SORRY'),
              text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
              confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
            });
          },
        );
      },
      (err) => {
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.authService.handlerSessionExpired();
          return;
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  createPayloadForAcademicJourney(pay) {
    console.log('Masuk createPayloadForAcademicJourney!!');
    this.subs.sink = this.acadJourneyService.GetStudentDataProfileFirstTime(this.studentId).subscribe(
      (resp) => {
        const temp = _.cloneDeep(resp);

        // *************** Start Do Formatting of the data
        if (temp && temp.student_address && temp.student_address.length) {
          temp.address = temp.student_address.find((address) => address.is_main_address);
          delete temp.student_address;
        }
        if (temp && temp.date_of_birth) {
          temp.date_of_birth = this.parseStringDatePipe.transform(temp.date_of_birth);
        }

        if (pay && pay.profile_picture) {
          temp.photo = pay.profile_picture;
        }
        const payload = {
          student_id: this.studentId,
          general_presentation: temp,
        };
        this.saveFirstTime(payload);
      },
      (err) => {
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.authService.handlerSessionExpired();
          return;
        }
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  saveFirstTime(payload) {
    if (this.acadJourneyId) {
      this.subs.sink = this.acadJourneyService.updateAcademicJourney(this.acadJourneyId, payload).subscribe(
        (resp) => {
          if (resp && resp._id) {
            this.acadJourneyId = resp._id;
            console.log('Academic Journey is Updated!!');
          }
        },
        (err) => {
          if (
            err &&
            err['message'] &&
            (err['message'].includes('jwt expired') ||
              err['message'].includes('str & salt required') ||
              err['message'].includes('Authorization header is missing') ||
              err['message'].includes('salt'))
          ) {
            this.authService.handlerSessionExpired();
            return;
          }
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    } else {
      this.subs.sink = this.acadJourneyService.createAcademicJourney(payload).subscribe(
        (resp) => {
          if (resp && resp._id) {
            this.acadJourneyId = resp._id;
            console.log('Academic Journey Created in First Time!!');
          }
        },
        (err) => {
          if (
            err &&
            err['message'] &&
            (err['message'].includes('jwt expired') ||
              err['message'].includes('str & salt required') ||
              err['message'].includes('Authorization header is missing') ||
              err['message'].includes('salt'))
          ) {
            this.authService.handlerSessionExpired();
            return;
          }
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

  quickSearch(type: string) {
    this.isEntityOperator = this.utilService.isUserEntityOPERATOR();
    this.isAcadDirAdmin = this.utilService.isUserAcadDirAdmin();
    const lastName = this.userSearch.value;
    if (type && lastName) {
      if (type === 'user') {
        this.quickSearchUser(lastName, type);
      } else if (type === 'student') {
        this.quickSearchStudent(lastName, type);
      } else if (type === 'school') {
        this.quickSearchSchool(lastName, type);
      } else if (type === 'teacher') {
        this.quickSearchTeacher(lastName, type);
      } else if (type === 'mentor') {
        this.quickSearchMentor(lastName, type);
      } else if (type === 'tag') {
        this.quickSearchTag(lastName, type);
      } else if (type === 'email') {
        this.quickSearchEmail(type, lastName);
      }
    }

    this.userSearch.patchValue('');
  }

  quickSearchTag(searchInput, type) {
    const tagFilter = {
      tag: searchInput,
      offset: 480,
      readmission_status: 'all_candidates',
      candidate_admission_statuses: [
        'admitted',
        'admission_in_progress',
        'engaged',
        'registered',
        'resigned',
        'resigned_after_engaged',
        'resigned_after_registered',
        'bill_validated',
        'deactivated',
        'report_inscription',
        'financement_validated',
        'mission_card_validated',
        'in_scholarship',
        'resignation_missing_prerequisites',
        'resign_after_school_begins',
        'no_show',
      ],
      exclude_crm_student: true,
    };
    const sorting = {
      // Search CandidateSortInput on playground
      candidate: 'asc', // sort candidate with last name
    };

    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.isWaitingForResponse = true;
    this.subs.sink = this.userService.getTagQuickSearch(tagFilter, userTypesList, sorting).subscribe((resp) => {
      this.isWaitingForResponse = false;

      if (resp && resp.length) {
        // if school found, redirect to table active student with filtered on this school
        if (resp.length === 1) {
          this.goToStudent(resp[0]);
        } else {
          // ************ open pop up
          const temp = _.cloneDeep(resp);
          const dataStudents = temp.map((student) => {
            if (student && student._id) {
              student._id = student._id;
            } else {
              student._id = '';
            }
            return student;
          });
          this.dialog
            .open(QuickSearchListDialogComponent, {
              width: '750px',
              panelClass: 'no-padding-pop-up',
              disableClose: true,
              data: {
                data: dataStudents,
                type: type,
              },
            })
            .afterClosed()
            .subscribe((result) => {
              if (result) {
                console.log('_dialog', result);
              }
            });
        }
      } else {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('Student not Found'),
        });
      }
    });
  }
  quickSearchEmail(type, email) {
    if (this.isAcadDirAdmin) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.authService.getUserById(this.currentUser?._id).subscribe(
        (resp) => {
          if (resp) {
            const schools = this.utilService.getAcademicAllAssignedSchool(resp?.entities);
            this.quickSearchEmailCallAPI(type, email, schools);
          } else {
            this.isWaitingForResponse = false;
          }
        },
        (err) => {
          this.swalError(err);
        },
      );
    } else {
      this.quickSearchEmailCallAPI(type, email);
    }
  }
  quickSearchEmailCallAPI(type, email, school?) {
    const schools = school ? school : [];
    const user_type = [
      '617f64ec5a48fe2228518812',
      '617f64ec5a48fe2228518813',
      '6299dc63ed8388461031b835',
      '617f64ec5a48fe2228518810',
      '617f64ec5a48fe2228518811',
      '60b4421aa16cc71e0c37132d',
      '617f64ec5a48fe2228518814',
      '617f64ec5a48fe2228518815',
      '61ceb560688f572138e023b2',
      '6209f2dc74890f0ecad16670',
      '617f64ec5a48fe222851880e',
      '617f64ec5a48fe222851880f',
      '61dd3ccff647127fd6bf65d7',
      '6009066808ed8724f5a54836',
      '5fe98eeadb866c403defdc6b',
      '5a067bba1c0217218c75f8ab',
      '5fe98eeadb866c403defdc6c',
      '6278e027b97bfb30674e76af',
      '6278e02eb97bfb30674e76b0',
    ];
    this.isWaitingForResponse = true;
    const pagination = {
      limit: 10,
      page: 0,
    };
    this.subs.sink = this.userService.getQuickSearchEmail(email, schools, user_type, pagination).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        this.userSearch.patchValue('');

        if (resp?.length === 1 && resp[0]) {
          if (resp[0]?.candidate_id) {
            this.goToStudent(resp[0]?.candidate_id);
          } else {
            this.goToUser(resp[0]);
          }
        } else if (resp?.length > 1) {
          this.dialog.open(QuickSearchListDialogComponent, {
            width: '900px',
            panelClass: 'no-padding-pop-up',
            disableClose: true,
            data: {
              data: resp,
              type: type,
              filter: {
                email,
                schools,
                user_type,
              },
            },
          });
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('User not Found'),
            allowEscapeKey: false,
            allowOutsideClick: false,
            allowEnterKey: false,
          });
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userSearch.patchValue('');
        this.swalError(err);
      },
    );
  }
  quickSearchTeacher(lastName, type) {
    if (lastName) {
      const filter = {
        name: lastName,
      };
      const sorting = {
        // Search TeacherSortingInput on playground
        name: 'asc',
      };
      this.isWaitingForResponse = true;
      this.subs.sink = this.userService.quickSearchTeacher(filter, sorting).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          if (resp && resp.length === 1) {
            this.goToTeacher(resp[0]);
          } else if (resp && resp.length > 1) {
            this.dialog
              .open(QuickSearchListDialogComponent, {
                width: '750px',
                panelClass: 'no-padding-pop-up',
                disableClose: true,
                data: {
                  data: resp,
                  type: 'teacher',
                },
              })
              .afterClosed()
              .subscribe((result) => {
                console.log('dialog teacher', result);
                // if (result) {
                //   this.goToTeacher(result);
                // }
              });
          } else {
            if (type === 'teacher') {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('Teacher not Found'),
              });
            }
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.swalError(err);
        },
      );
    }
  }

  quickSearchUser(searchInput: string, type: string) {
    const payload = {
      schools: [],
      exclude_company: true,
    };

    this.isWaitingForResponse = true;
    if (this.isAcadDirAdmin) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.authService.getUserById(this.currentUser._id).subscribe((ressp) => {
        this.isWaitingForResponse = false;
        const schools = this.utilService.getUserAllSchoolAcadDirAdmin();
        payload['schools'] = schools;
        payload['schools'] =
          payload['schools'] && payload['schools'].length
            ? payload['schools'].filter((resp) => resp?.school?._id).map((entity) => entity?.school?._id)
            : null;
        this.quickSearchUserCallAPI(searchInput, type, payload);
      });
    } else {
      this.quickSearchUserCallAPI(searchInput, type, payload);
    }
  }

  quickSearchUserCallAPI(lastName: string, type: string, payload) {
    const sorting = { last_name: 'asc' };
    const user_type = [
      '617f64ec5a48fe2228518812',
      '617f64ec5a48fe2228518813',
      '6299dc63ed8388461031b835',
      '617f64ec5a48fe2228518810',
      '617f64ec5a48fe2228518811',
      '60b4421aa16cc71e0c37132d',
      '617f64ec5a48fe2228518814',
      '617f64ec5a48fe2228518815',
      '61ceb560688f572138e023b2',
      '6209f2dc74890f0ecad16670',
      '617f64ec5a48fe222851880e',
      '617f64ec5a48fe222851880f',
      '61dd3ccff647127fd6bf65d7',
      '6009066808ed8724f5a54836',
      '5fe98eeadb866c403defdc6b',
      '64a245893677852cf45c5763',
    ];
    this.isWaitingForResponse = true;
    this.subs.sink = this.userService.getUserQuickSearch(lastName, payload.schools, sorting, user_type).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          if (resp.length === 1) {
            // ************ auto redirect
            this.goToUser(resp[0]);
          } else {
            // ************ open pop up
            this.dialog
              .open(QuickSearchListDialogComponent, {
                width: type === 'user' ? '900px' : '850px',
                panelClass: 'no-padding-pop-up',
                disableClose: true,
                data: {
                  data: resp,
                  type: type,
                },
              })
              .afterClosed()
              .subscribe((result) => {
                console.log(result);
                if (result) {
                  this.goToUser(result);
                }
              });
          }
        } else {
          if (type === 'user') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('User not Found'),
            });
          }
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.authService.handlerSessionExpired();
          return;
        }
        this.swalError(err);
      },
    );
  }

  quickSearchStudent(searchInput: string, type: string) {
    const studentFilter = {
      schools: [],
      candidate: searchInput,
    };
    const lastNameFilter = {
      student_quick_search: searchInput,
      offset: 480,
      readmission_status: 'all_candidates',
      candidate_admission_statuses: [
        'admitted',
        'admission_in_progress',
        'engaged',
        'registered',
        'resigned',
        'resigned_after_engaged',
        'resigned_after_registered',
        'bill_validated',
        'deactivated',
        'report_inscription',
        'financement_validated',
        'mission_card_validated',
        'in_scholarship',
        'resignation_missing_prerequisites',
        'resign_after_school_begins',
        'no_show',
      ],
      exclude_crm_student: true,
    };
    const sorting = {
      // Search CandidateSortInput on playground
      candidate: 'asc', // sort candidate with last name
    };

    const userTypesList = this.currentUser && this.currentUser.app_data ? this.currentUser.app_data.user_type_id : [];
    this.isWaitingForResponse = true;
    this.subs.sink = this.userService.getAllCandidateQuickSearch(lastNameFilter, userTypesList, sorting).subscribe(
      (response) => {
        this.isWaitingForResponse = false;
        this.userSearch.patchValue('');

        if (response?.length) {
          let respData = _.cloneDeep(response)
          if(response?.length >1){
            const tempData = _.cloneDeep(response)?.filter(
              (data) =>
                data?.program_status === 'active' ||
                (data?.program_status === 'not_active' && data?.candidate_admission_status !== 'registered'),
            )
            respData = _.uniqBy(tempData,'user_id._id')
          }
          // if school found, redirect to table active student with filtered on this school
          if (respData.length === 1) {
            this.goToStudent(respData[0]);
          } else {
            // ************ open pop up
            const temp = _.cloneDeep(respData);
            const dataStudents = temp.map((student) => {
              if (student && student._id) {
                student._id = student._id;
              } else {
                student._id = '';
              }
              return student;
            });
            this.dialog
              .open(QuickSearchListDialogComponent, {
                width: '750px',
                panelClass: 'no-padding-pop-up',
                disableClose: true,
                data: {
                  data: dataStudents,
                  type: type,
                },
              })
              .afterClosed()
              .subscribe((result) => {
                if (result) {
                  console.log('_dialog', result);
                }
              });
          }
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('Student not Found'),
          });
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.userSearch.patchValue('');
        this.swalError(err);
      },
    );
  }

  quickSearchMentor(searchInput: string, type: string) {
    // user type for mentor
    const userTypeMentor = ['6278e027b97bfb30674e76af', '6278e02eb97bfb30674e76b0'];
    const sorting = {
      // Search UserSorting on playground
      last_name: 'asc',
    };
    this.isWaitingForResponse = true;
    this.subs.sink = this.userService.getMentorQuickSearch(searchInput, userTypeMentor, sorting).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          if (resp.length === 1) {
            // ************ auto redirect
            this.goToMentor(resp[0]);
          } else {
            // ************ open pop up
            this.dialog
              .open(QuickSearchListDialogComponent, {
                width: type === 'mentor' ? '900px' : '850px',
                panelClass: 'no-padding-pop-up',
                disableClose: true,
                data: {
                  data: resp,
                  type: type,
                },
              })
              .afterClosed()
              .subscribe((result) => {
                console.log(result);
                if (result) {
                  this.goToUser(result);
                }
              });
          }
        } else {
          if (type === 'mentor') {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('Mentor not Found'),
            });
          }
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          this.authService.handlerSessionExpired();
          return;
        }
        this.swalError(err);
      },
    );
  }

  quickSearchSchool(searchInput: string, type: string) {
    const schoolFilter = {
      short_name: searchInput,
      short_names: null,
    };

    const userTypeId =
      this.currentUser && this.currentUser.entities[0] && this.currentUser.entities[0].type ? this.currentUser.entities[0].type._id : null;

    if (this.isAcadDirAdmin) {
      schoolFilter.short_names =
        this.currentUser && this.currentUser.app_data && this.currentUser.app_data.school
          ? this.currentUser.app_data.school.map((res) => res.short_name)
          : null;
    } else {
      schoolFilter.short_names = null;
    }

    const sorting = {
      // Search CandidateSchoolSortingInput on playground
      short_name: 'asc',
    };

    this.isWaitingForResponse = true;
    this.subs.sink = this.userService.getSchoolQuickSearch(schoolFilter, userTypeId, sorting).subscribe(
      (resp) => {
        this.isWaitingForResponse = false;
        if (resp && resp.length) {
          if (resp.length === 1) {
            // ************ auto redirect
            this.goToSchool(resp[0]);
          } else {
            // ************ open pop up
            this.dialog
              .open(QuickSearchListDialogComponent, {
                width: '750px',
                panelClass: 'no-padding-pop-up',
                disableClose: true,
                data: {
                  data: resp,
                  type: type,
                },
              })
              .afterClosed()
              .subscribe((result) => {
                // if (result) {
                //   this.goToSchool(result);
                // }
              });
          }
        } else {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('School not Found'),
          });
        }
      },
      (err) => {
        this.swalError(err);
        this.isWaitingForResponse = false;
      },
    );
  }

  goToSchool(school) {
    window.open(`./schools/school-detail/${school._id}`, '_blank');
  }

  goToStudent(student) {
    window.open(`./candidate-file?selectedCandidate=${student._id}`, '_blank');
  }

  goToUser(user) {
    window.open(`./users/user-list?user=${user._id}`, '_blank');
  }
  goToTeacher(teacher) {
    window.open(`./users/teacher-list?teacherId=${teacher._id}`, '_blank');
  }

  goToMentor(mentor) {
    const query = {
      selectedMentor: mentor._id ? mentor._id : null,
      companyId:
        mentor.entities && mentor.entities.length && mentor.entities[0].companies.length ? mentor.entities[0].companies[0]._id : null,
    };
    const url = this.router.createUrlTree(['companies/branches'], { queryParams: query });
    window.open(url.toString(), '_blank');
  }

  swalError(err) {
    this.isWaitingForResponse = false;
    console.log('[Response BE][Error] : ', err);
    Swal.fire({
      type: 'info',
      title: this.translate.instant('SORRY'),
      text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
      confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
    });
  }

  getDataStudentQuickSearch(resp, type) {
    this.isWaitingForResponse = false;
    if (resp && resp.length) {
      if (resp.length === 1) {
        this.goToStudent(resp[0]);
      } else {
        // ************ open pop up
        this.dialog
          .open(QuickSearchListDialogComponent, {
            width: '750px',
            panelClass: 'no-padding-pop-up',
            disableClose: true,
            data: {
              data: resp,
              type: type,
            },
          })
          .afterClosed()
          .subscribe((result) => {
            if (result) {
              console.log('_dialog', result);
            }
          });
      }
    } else {
      Swal.fire({
        type: 'info',
        title: this.translate.instant('Student not Found'),
      });
    }
  }

  checkLogo(): boolean {
    /// check logo only show if operator only
    const isUserOPERATORAdmin = !!this.permissions.getPermission('operator_admin');
    const isUserOPERATORDirector = !!this.permissions.getPermission('operator_dir');
    const isUserOPERATORVisitor = !!this.permissions.getPermission('operator_visitor');
    const isUserOPERATORSales = !!this.permissions.getPermission('operator_sales');

    if (isUserOPERATORAdmin || isUserOPERATORDirector || isUserOPERATORVisitor || isUserOPERATORSales) {
      return true;
    } else {
      return false;
    }
  }

  selectFile(fileInput: Event) {
    const acceptable = ['jpg', 'jpeg', 'png'];
    this.imageBeforeCompressed = (<HTMLInputElement>fileInput.target).files[0];
    if (this.imageBeforeCompressed) {
      const fileType = this.utilService.getFileExtension(this.imageBeforeCompressed.name).toLocaleLowerCase();
      if (acceptable.includes(fileType)) {
        if (this.imageBeforeCompressed.size > 5000000) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('UPLOAD_IMAGE.TITLE'),
            text: this.translate.instant('UPLOAD_IMAGE.TEXT'),
            confirmButtonText: this.translate.instant('UPLOAD_IMAGE.BUTTON'),
          });
        } else {
          this.isLoadingUpload = true;
          const fileName = this.imageBeforeCompressed?.name;
          const size = this.imageBeforeCompressed?.size;
          const reader = new FileReader();
          reader.onload = (read: any) => {
            const localUrl = read.target.result;
            this.compressFile(localUrl, fileName, size);
          };
          reader.readAsDataURL(this.imageBeforeCompressed);
        }
      } else {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TITLE'),
          text: this.translate.instant('UPLOAD_ERROR.WRONG_TYPE_TEXT', { file_exts: '.jpg, .jpeg, .png' }),
          allowEscapeKey: false,
          allowOutsideClick: false,
          allowEnterKey: false,
        });
      }
    }
  }

  compressFile(image, fileName, size) {
    const orientation = -1;
    let ratio: number;
    const compressedName = fileName.substring(0, fileName.lastIndexOf('.')) + '-Compressed' + fileName.substring(fileName.lastIndexOf('.'));
    // console.log('image size', size);

    // set ratio based on image size
    if (size > 3000000 && size <= 5000000) {
      ratio = 20;
    } else if (size >= 1000000 && size <= 3000000) {
      ratio = 30;
    } else if (size < 1000000) {
      ratio = 40;
    }
    // console.log('ratio:',ratio+'%');

    // compress image
    if (ratio) {
      this.imageCompress.compressFile(image, orientation, ratio, 50).then((result) => {
        fetch(result)
          .then((res) => res.blob())
          .then((blob) => {
            this.imageAfterCompressed = new File([blob], compressedName, { type: 'image/png' });
            // console.log('Before:', this.imageBeforeCompressed);
            // console.log('After:', this.imageAfterCompressed);
            this.uploadFile(this.imageAfterCompressed, this.imageBeforeCompressed);
          });
      });
    }
  }

  uploadFile(imageAfter: File, imageBefore: File) {
    // upload image before compressed
    if (imageBefore) {
      this.subs.sink = this.fileUploadService.singleUpload(imageBefore).subscribe(
        (resp) => {
          this.isLoadingUpload = false;
          this.profilePic.patchValue(resp.s3_file_name);
          this.currentUser.profile_picture = resp.s3_file_name;

          const payload = {};
          payload['email'] = this.currentUser.email;
          payload['profile_picture'] = resp.s3_file_name;
          payload['first_name'] = this.currentUser.first_name;
          payload['last_name'] = this.currentUser.last_name;

          // upload image after compressed
          if (imageAfter) {
            this.subs.sink = this.fileUploadService.singleUpload(imageAfter).subscribe(
              (res) => {
                if (res) {
                  console.log('Image compressed upload success');
                  payload['compressed_photo'] = res.s3_file_name;
                  this.subs.sink = this.userService.updateUser(this.currentUser._id, payload, this.currentUserTypeId).subscribe(
                    (response) => {
                      if (response) {
                        const temp = this.currentUser;
                        temp.profile_picture = resp.s3_file_name;
                        localStorage.setItem('userProfile', JSON.stringify(temp));
                        if (this.isStudent) {
                          this.createPayloadForAcademicJourney(temp);
                        }
                      }
                    },
                    (err) => {
                      this.isLoadingUpload = false;
                      if (
                        err &&
                        err['message'] &&
                        (err['message'].includes('jwt expired') ||
                          err['message'].includes('str & salt required') ||
                          err['message'].includes('Authorization header is missing') ||
                          err['message'].includes('salt'))
                      ) {
                        this.authService.handlerSessionExpired();
                        return;
                      }
                      Swal.fire({
                        type: 'info',
                        title: this.translate.instant('SORRY'),
                        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                      });
                    },
                  );
                }
              },
              (err) => {
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
                    title: 'Error !',
                    confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
                  }).then((res) => {
                    console.log('[BE Message] Error is : ', err);
                  });
                }
              },
            );
          }
        },
        (err) => {
          this.isLoadingUpload = false;
          if (
            err &&
            err['message'] &&
            (err['message'].includes('jwt expired') ||
              err['message'].includes('str & salt required') ||
              err['message'].includes('Authorization header is missing') ||
              err['message'].includes('salt'))
          ) {
            this.authService.handlerSessionExpired();
            return;
          }
          Swal.fire({
            type: 'info',
            title: this.translate.instant('SORRY'),
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    }
    this.resetFileState();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
