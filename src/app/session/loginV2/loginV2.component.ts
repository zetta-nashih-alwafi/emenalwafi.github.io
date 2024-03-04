import { Component, OnInit, AfterContentChecked, OnDestroy, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../service/auth-service/auth.service';
import { ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'app/service/user/user.service';
import { SchoolService } from 'app/service/schools/school.service';
import { NgModel, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxPermissionsService } from 'ngx-permissions';
import { SubSink } from 'subsink';
import { AppPermission } from 'app/models/app-permission.model';
import { UtilityService } from 'app/service/utility/utility.service';
import * as _ from 'lodash';
import { PromoService } from 'app/service/promo/promo.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from 'environments/environment';
import { StudentsService } from 'app/service/students/students.service';
import { GlobalConstants } from 'app/shared/settings';
import { switchMap } from 'rxjs/operators';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'ms-loginV2-session',
  templateUrl: './loginV2-component.html',
  styleUrls: ['./loginV2-component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LoginV2Component implements OnInit, AfterContentChecked, OnDestroy, OnChanges {
  private subs = new SubSink();
  array = [{ school: 'School1' }, { school: 'School2' }, { school: 'School3' }];
  @ViewChild('passwordField', { static: false }) passwordFieldRef: ElementRef;

  slideConfig = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1000,
    dots: false,
    arrows: false,
  };

  sessionSlider: any[] = [];
  showSessionSlider = false;

  passwordVisibility: boolean = false;
  loginForm: UntypedFormGroup;
  email: string;
  password: string;
  checked = false; // to check if the entity radio button is selected or not
  isLoginSuccess: boolean;
  isEmailInvalid: boolean;
  incorrectLogin = false;
  isUserHasOneEntity = true; // if user has only one entity, dont show the radio button
  isSchoolTypeHasOneSchool = true; // if the selected school type has only one school, dont show the school radio button

  myInnerHeight = 600;
  entities: any[];
  userTypeList = [];
  schools: any[] = [];
  schoolIdList: string[] = [];
  schoolType: string[] = [];
  selectedEntityName: string;
  selectedSchoolType: string;
  selectedUserType: string;
  selectedSchoolId: string;
  entityRadioButton: any[];
  entityVisible: any[];
  schoolTypeVisible: any[];
  resetPassword: any;
  schoolTypeRadioButton: any[];
  isWaitingForResponse = false;
  appData: AppPermission;
  tempUserLogin = null;
  studentSafeUrl: SafeResourceUrl;
  isShow: boolean;
  visited: Boolean;

  normalEntities = ['academic', 'finance', 'admission', 'company_relation', 'alumni'];

  returnUrl = '';

  isPasswordShown: boolean = false;

  constructor(
    public authService: AuthService,
    public translate: TranslateService,
    private userService: UserService,
    private schoolService: SchoolService,
    private router: Router,
    private ngxPermissionService: NgxPermissionsService,
    private route: ActivatedRoute,
    public utilService: UtilityService,
    private promoService: PromoService,
    private sanitizer: DomSanitizer,
    private studentsService: StudentsService,
  ) {}

  private _flushPermission() {
    this.swalSSO1().then(resp => window.open(environment.apiUrl.replace('api.', '').replace('/graphql', '') + '/session/login', '_self'))
  }

  ngOnInit() {
    this.isWaitingForResponse = false;
    this.isVisited();
    this.subs.sink = this.route.paramMap.subscribe((param) => {
      console.log('Param : ', param);
      this.resetPassword = param.get('success');
    });
    const encodedData = this.route.snapshot.queryParams['u'];

    if (encodedData) {
      this.callLoginMicrosoft(encodedData);
      return;
    }

    this.checked = false;
    this.isLoginSuccess = false;
    this.isEmailInvalid = false;
    this.initRadioButton();
    this.getAppData();
    this.getPromotionData();

    if (this.resetPassword === 'reset-success') {
      console.log('Reset Success!');
      this.swalNewPassword();
    }

    if (this.route.snapshot.queryParamMap.get('returnUrl')) {
      console.log(this.route.snapshot.queryParamMap.get('returnUrl'));
      this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    }
  }

  ngAfterContentChecked() {
    // ng after content checked will be executed when there is event in the page like click, submit,..
    // if (this.email && !this.entities && !this.isEmailInvalid) {
    //   this.getUserEntities('ngAfterContentChecked');
    // }
  }

  ngOnChanges() {
    // ng after content checked will be executed when there is event in the page like click, submit,..
    if (this.email && !this.entities && !this.isEmailInvalid) {
      this.getUserEntities('ngOnChanges');
    }
  }

  get studentDomain() {
    return `${environment.studentEnvironment}/session/login`;
  }

  getAppData() {
    this.utilService.getAppPermission().subscribe(
      (resp) => {
        this.appData = resp;
      },
      (err) => {
        this.authService.postErrorLog(err);
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

  getUserEntities(datas: any, continueLogin?: string, value?: { email: string; password: string }) {
    this.schoolIdList = [];
    this.schools = [];
    this.userTypeList = [];
    this.selectedEntityName = '';
    console.log('Trigger From', datas);
    const regexMail =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const isEmail = regexMail.test(this.email);

    if (this.email && isEmail) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.userService.getUserEntities(this.email.toLowerCase()).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          this.initRadioButton();
          if (resp) {
            this.entities = resp['entities'];
            console.log('ini entity nya ', this.entities);
            this.setSelectedRadioBtn();
            this.isEmailInvalid = false;

            // *************** For user that tried to login but does not have permission will need to call getuserentities first
            if (continueLogin && continueLogin === 'continue-login' && value) {
              this.login(value);
            }
          } else {
            this.isEmailInvalid = true;
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          this.authService.postErrorLog(err);
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
          // dont do anything
        },
      );
    }
  }

  initRadioButton() {
    this.entityRadioButton = [
      // EDH Entities
      { label: 'operator', isVisible: false },
      { label: 'academic', isVisible: false },
      { label: 'finance', isVisible: false },
      { label: 'admission', isVisible: false },
      { label: 'company_relation', isVisible: false },
      { label: 'alumni', isVisible: false },
    ];
    this.schoolTypeRadioButton = [
      { label: 'certifier', isVisible: false },
      { label: 'preparation_center', isVisible: false },
    ];
  }

  setSelectedRadioBtn() {
    // if user only has 1 entity, then don't need to show entity radio button
    console.log('entities : ', this.entities);
    const unixUserType = _.uniqBy(this.entities, 'type.name');
    const unixEntities = _.uniqBy(this.entities, 'entity_name');
    console.log('unixUserType : ', unixUserType, unixEntities);
    if (this.entities.length === 1 && unixUserType.length === 1) {
      this.selectedEntityName = this.entities[0].entity_name;
      this.selectedSchoolType = this.entities[0] && this.entities[0].school_type ? this.entities[0].school_type : '';
      this.selectedUserType = this.entities[0] && this.entities[0].type ? this.entities[0].type._id : '';
      this.checked = true;
      this.isUserHasOneEntity = true;
    } else {
      let autologin = false;
      // const tempEntities = _.uniqBy(this.entities, 'entity_name');

      let unixSchoolType = [];
      let unixSchool = [];
      if (unixEntities && unixEntities.length && unixEntities[0].entity_name === 'academic') {
        unixSchoolType = _.uniqBy(this.entities, 'school_type');
        unixSchool = _.uniqBy(this.entities, 'school._id');
      }

      // ************** Operator auto login

      // || unixEntities[0].entity_name === 'operator'

      // 10/01/2022 operator need choose before login
      autologin =
        this.entities && unixEntities.length === 1 && unixSchoolType.length <= 1 && unixSchool.length <= 1 && unixUserType.length === 1;

      // *************** User with 1 entity auto login
      if (this.entities && this.entities.length === 1) {
        autologin = true;
      }

      console.log(this.entities);
      console.log('autologin = ', autologin);
      if (autologin) {
        autologin = false;
        this.entities.forEach((entity) => {
          this.schoolType.push(entity.school_type);
        });
        if (this.schoolType.length < 2) {
          autologin = true;
        } else {
          autologin = false;
          const schoolType = this.schoolType[0];
          this.schoolType.forEach((s) => {
            return (autologin = s === schoolType);
          });
        }
      }
      if (autologin) {
        this.selectedEntityName = this.entities[0].entity_name;
        this.selectedSchoolType = this.entities[0] && this.entities[0].school_type ? this.entities[0].school_type : '';
        this.selectedUserType = this.entities[0] && this.entities[0].type ? this.entities[0].type._id : '';
        this.checked = true;
        this.isUserHasOneEntity = true;
      } else {
        this.checked = false;
        this.isUserHasOneEntity = autologin;
        this.setRadioBtnVisibility();
      }
    }
  }

  // show user's entity and school type radio button
  setRadioBtnVisibility() {
    this.schoolTypeVisible = [];
    this.entityVisible = [];
    for (const entity of this.entities) {
      for (let i = 0; i < this.entityRadioButton.length; i++) {
        if (entity.entity_name === this.entityRadioButton[i].label) {
          this.entityRadioButton[i].isVisible = true;
          this.entityVisible.push(this.entityRadioButton[i]);
          this.entityVisible = _.uniqBy(this.entityVisible, 'label');
        }
      }
      for (let i = 0; i < this.schoolTypeRadioButton.length; i++) {
        if (entity.school_type === this.schoolTypeRadioButton[i].label) {
          this.schoolTypeRadioButton[i].isVisible = true;
          this.schoolTypeVisible.push(this.schoolTypeRadioButton[i]);
          this.schoolTypeVisible = _.uniqBy(this.schoolTypeVisible, 'label');
        }
      }
    }
  }

  login(value: { email: string; password: string }) {
    if (value && value.email) {
      value.email = value.email.toLowerCase();

      // if (!this.checked && this.tempUserLogin) {
      //   this.checkedSwal();
      //   return;
      // }
      if (value.email && value.password) {
        this.callLoginAPi(value);
      }
    }
  }
  redirectMicrosoft() {
    this.isWaitingForResponse = true;
    window.open(environment.microsoftSSO, '_self');
  }

  swalSSO1() {
    return Swal.fire({
      type: 'warning',
      title: this.translate.instant('SSO_S1.TITLE'),
      text: this.translate.instant('SSO_S1.TEXT'),
      confirmButtonText: this.translate.instant('SSO_S1.BUTTON'),
      allowOutsideClick: false,
      footer: '<span class="tw-w-full tw-text-end">SSO_S1</span>',
    });
  }

  handleRedirectError(encodedValue): boolean {
    if (typeof encodedValue !== 'string' || encodedValue === undefined || encodedValue == null) {
      return true;
    }
    const decodedValue = JSON.parse(encodedValue);
    if (!decodedValue?.token || !decodedValue?.userId || decodedValue?.error) {
      return true;
    }
    return false; 
  }

  callLoginMicrosoft(encodedData: string) {
    this.isWaitingForResponse = true;
    const encodedValue = window.atob(encodedData);
    // Condition to handle wheter the encoded value has any error or not
    const isRedirectError = this.handleRedirectError(encodedValue)
    if (isRedirectError) {
      this._flushPermission();
      this.isWaitingForResponse = false;
    } else {
      const decodedValue = JSON.parse(encodedValue);
      localStorage?.setItem(environment.tokenKey, decodedValue?.token);
      this.subs.sink = this.userService
        .getOneUserForMicrosoft(decodedValue?.userId).subscribe(
          (resp) => {
            const userLogin: any = {};
            userLogin.user = _.cloneDeep(resp);
            userLogin.token = decodedValue?.token
            if (userLogin?.user?.student_id?._id) {
              const sortedEntities = this.utilService.sortEntitiesByHierarchy(_.cloneDeep(userLogin?.user?.entities));
              const permissions = [];
              const permissionsId = [];
              if (sortedEntities && sortedEntities.length > 0) {
                sortedEntities.forEach((entity) => {
                  permissions.push(entity.type.name);
                  permissionsId.push(entity.type._id);
                });
              }
              this.isWaitingForResponse = false;
              this.authService.connectAsStudentFromLoginPage(userLogin, permissions[0], 'login');
            } else {
              this.getUserTableColumnSettings(userLogin, 'callLoginMicrosoft');
            }
          },
          (err) => {
            this.tempUserLogin = null;
            this.isWaitingForResponse = false;
            this.incorrectLogin = true;
            this.authService.postErrorLog(err);
            if (
              err &&
              err['message'] &&
              (err['message'].includes('jwt expired') ||
                err['message'].includes('str & salt required') ||
                err['message'].includes('Authorization header is missing') ||
                err['message'].includes('salt'))
            ) {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('General_S1.Title'),
                html: this.translate.instant('General_S1.Text'),
                confirmButtonText: this.translate.instant('General_S1.Button'),
                allowOutsideClick: false,
                allowEnterKey: false,
                allowEscapeKey: false,
              });
            } else if (err && err['message'] && err['message'].includes('Password Not Valid')) {
              Swal.fire({
                type: 'info',
                title: this.translate.instant('Sorry'),
                html: this.translate.instant('Password Not Valid'),
                confirmButtonText: this.translate.instant('General_S1.Button'),
                allowOutsideClick: false,
                allowEnterKey: false,
                allowEscapeKey: false,
              });
            } else {
              Swal.fire({
                type: 'info',
                title: 'Warning',
                text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
                confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
              });
            }
          },
        );
    }
  }

  callLoginAPi(value: { email: string; password: string }) {
    this.isWaitingForResponse = true;

    this.subs.sink = this.authService.loginUser(value.email.toLowerCase(), value.password).subscribe(
      (resp) => {
        console.log('loginUser_ = ');
        console.log(resp);
        const userLogin = resp['data']['Login'];
        if (resp?.data?.Login?.user?.student_id?._id) {
          const sortedEntities = this.utilService.sortEntitiesByHierarchy(_.cloneDeep(userLogin?.user.entities));
          const permissions = [];
          const permissionsId = [];
          if (sortedEntities && sortedEntities.length > 0) {
            sortedEntities.forEach((entity) => {
              console.log('UserType name : ', entity.type.name);
              permissions.push(entity.type.name);
              permissionsId.push(entity.type._id);
            });
          }
          this.isWaitingForResponse = false;
          this.authService.connectAsStudentFromLoginPage(userLogin, permissions[0], 'login');
        } else {
          this.getUserTableColumnSettings(_.cloneDeep(resp), 'callLoginAPi', value);
        }
      },
      (err) => {
        this.tempUserLogin = null;
        this.isWaitingForResponse = false;
        this.incorrectLogin = true;
        this.authService.postErrorLog(err);
        if (
          err &&
          err['message'] &&
          (err['message'].includes('jwt expired') ||
            err['message'].includes('str & salt required') ||
            err['message'].includes('Authorization header is missing') ||
            err['message'].includes('salt'))
        ) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('General_S1.Title'),
            html: this.translate.instant('General_S1.Text'),
            confirmButtonText: this.translate.instant('General_S1.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else if (err && err['message'] && err['message'].includes('Password Not Valid')) {
          Swal.fire({
            type: 'info',
            title: this.translate.instant('Sorry'),
            html: this.translate.instant('Password Not Valid'),
            confirmButtonText: this.translate.instant('General_S1.Button'),
            allowOutsideClick: false,
            allowEnterKey: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            type: 'info',
            title: 'Warning',
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        }
      },
    );
  }

  getUserTableColumnSettings(resp, from, value?) {
    let user;
    let userLogin;
    if (from === 'callLoginAPi') {
      user = resp['data']['Login'];
      userLogin = resp['data']['Login']['user'];
    } else if (from === 'callLoginMicrosoft') {
      user = resp;
      console.log('user check', user, resp);
      userLogin = resp?.user;
    }
    if (userLogin?._id) {
      this.subs.sink = this.authService.GetUserTableColumnSettings(userLogin?._id).subscribe(
        (resps) => {
          this.isWaitingForResponse = false;
          if (resps && resps?.length) {
            localStorage.setItem('templateTable', JSON.stringify(resps));
          }          
          if (user) {
            this.tempUserLogin = _.cloneDeep(user?.user);
            if (this.tempUserLogin.entities && this.tempUserLogin.entities.length < 1) {
              this.checkedSwal();
              return;
            }
            const program = this.utilService.setDataProgram(_.cloneDeep(this.tempUserLogin.entities));
            this.tempUserLogin.entities = this.utilService.mergeHierarchyPermission(_.cloneDeep(this.tempUserLogin.entities));
            const sortedEntities = this.utilService.sortEntitiesByHierarchy(_.cloneDeep(this.tempUserLogin.entities));
            console.log('sortedEntities', sortedEntities);
            const permissions = [];
            const permissionsId = [];
            if (sortedEntities && sortedEntities.length > 0) {
              sortedEntities.forEach((entity) => {
                console.log('UserType name : ', entity.type.name);
                permissions.push(entity.type.name);
                permissionsId.push(entity.type._id);
              });
            }

            console.log('permissions value = ');
            console.log(permissions);

            const temp = this.tempUserLogin;
            temp.entities = sortedEntities;
            temp.app_data = program;
            console.log('temp_', temp);
            user.user = temp;
            // const temp = userLogin;
            // temp.entities = entities;
            // localStorage.setItem('userProfile', JSON.stringify(temp));
            this.authService.setLocalUserProfileAndToken(user);
            const listExceptionUserTypeId = ['6278e02eb97bfb30674e76b0', '6278e027b97bfb30674e76af', '5fe98eeadb866c403defdc6c'];
            if (permissions && permissions.length) {
              this.authService.setPermission([permissions[0]]);
              this.ngxPermissionService.flushPermissions();
              this.ngxPermissionService.loadPermissions([permissions[0]]);
              console.log('permissions (UserType): ', permissions);
              const domainUrl = this.router.url.split('/')[0];
              if (this.returnUrl) {
                this.router.navigateByUrl(this.returnUrl);
              } else if (
                permissionsId.findIndex(
                  (permission) => permission === '5a2e603c53b95d22c82f958f' || permission === '5a2e603f53b95d22c82f9590',
                ) > -1
              ) {
                // use window.open to hard reload the page so the styling in login page doesnt broke the styling in other page
                window.open(`${domainUrl}/students-card`, '_self');
              } else if (permissionsId.findIndex((permission) => permission === '5a66cd0813f5aa05902fac1e') > -1) {
                window.open(`${domainUrl}/school`, '_self');
              } else if (permissionsId.findIndex((permission) => permission === '5a067bba1c0217218c75f8ab') > -1) {
                // window.open(`${domainUrl}/my-file`, '_self');
                this.subs.sink = this.studentsService
                  .CreateActivity({
                    type_of_activity: 'login',
                    action: 'login to',
                    description_en: 'login',
                    description_fr: 'login',
                    student_id: userLogin.student_id && userLogin.student_id._id ? userLogin.student_id._id : null,
                  })
                  .subscribe(
                    () => {
                      this.authService.removeLocalUserProfile();
                      this.authService.connectAsStudentFromLoginPage(user, permissions[0], 'login');
                    },
                    (err) => {
                      this.authService.removeLocalUserProfile();
                      this.authService.connectAsStudentFromLoginPage(user, permissions[0], 'login');
                    },
                  );
              } else if (permissionsId.findIndex((permission) => permission === '60b99bd0d824c52eec246fcb') > -1) {
                window.open(`${domainUrl}/mailbox/inbox`, '_self');
              } else if (permissionsId.findIndex((permission) => listExceptionUserTypeId.includes(permission)) < 0) {
                window.open(`${domainUrl}/home`, '_self');
              } else {
                window.open(`${domainUrl}/`, '_self');
              }
            } else {
              this.getUserEntities('callLoginAPi', 'continue-login', value);
            }
          } else {
            this.tempUserLogin = null;
          }
        },
        (err) => {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: 'Warning',
            text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
            confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
          });
        },
      );
    } else {
      this.isWaitingForResponse = false;
    }
  }

  getSchools(schoolType: string) {
    this.schoolIdList = [];
    this.schools = [];
    this.userTypeList = [];
    this.selectedSchoolType = schoolType;

    // get entity of selected school type
    const entitiesOfSchoolType = this.entities.filter((entity) => {
      return entity.school_type === this.selectedSchoolType;
    });

    // get all school id of filtered school
    entitiesOfSchoolType.forEach((entity) => {
      const index = this.schoolIdList.findIndex((indexEn) => {
        return indexEn === entity.school._id;
      });
      if (index < 0) {
        this.schoolIdList.push(entity.school._id);
      }
    });

    // get all filtered school data from API
    for (let i = 0; i < this.schoolIdList.length; i++) {
      this.subs.sink = this.schoolService.getSchoolIdAndShortName(this.schoolIdList[i]).subscribe(
        (resp) => {
          this.schools.push({
            _id: resp._id,
            shortName: resp.short_name,
          });
          this.schools = _.uniqBy(this.schools, 'shortName');
          if (this.schools.length === 1) {
            this.setSelectedSchool(this.schools[0]);
            this.isSchoolTypeHasOneSchool = true;
          } else {
            this.checked = false;
            this.isSchoolTypeHasOneSchool = false;
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
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
    this.getUserType();
  }

  getUserType() {
    this.userTypeList = [];
    let entitySelected = [];
    if (this.selectedEntityName) {
      entitySelected = this.entities.filter((entity) => {
        return entity.entity_name === this.selectedEntityName;
      });
    }
    if (this.selectedEntityName === 'academic') {
      if (this.selectedSchoolType) {
        entitySelected = entitySelected.filter((entity) => {
          return entity.school_type === this.selectedSchoolType;
        });
      }
      if (this.selectedSchoolId) {
        entitySelected = entitySelected.filter((entity) => {
          return entity.school && entity.school._id === this.selectedSchoolId;
        });
      }
    }
    if (entitySelected && entitySelected.length) {
      this.userTypeList = entitySelected.map((entity) => {
        return { value: entity.type._id, label: entity.type.name };
      });
      this.userTypeList = _.uniqBy(this.userTypeList, 'value');
    }
  }

  setSelectedUserType(data) {
    this.selectedUserType = data.value;
  }

  setEntityChecked(entity: string) {
    // if checked false, sweet alert will appear to prevent user to log in.
    // this.checked = entity !== 'academic';
    // this.checked = !this.normalEntities.includes(entity);
    this.checked = this.normalEntities.includes(entity);
    this.selectedEntityName = entity;

    this.getUserType();
  }

  setSelectedSchool(school: any) {
    this.selectedSchoolId = school._id;
    // dont show swal if user already select school radio button
    this.checked = true;
    this.getUserType();
  }

  checkedSwal() {
    if (!this.checked) {
      Swal.fire({
        type: 'warning',
        title: this.translate.instant('REGISTER_MESSAGE.TITLE'),
        allowOutsideClick: false,
        confirmButtonText: this.translate.instant('OK'),
      });
    }
  }

  swalNewPassword() {
    Swal.fire({
      title: this.translate.instant('LOGIN_AFTER_RESET.TITLE'),
      html: this.translate.instant('LOGIN_AFTER_RESET.TEXT'),
      type: 'warning',
      confirmButtonText: this.translate.instant('LOGIN_AFTER_RESET.BUTTON'),
      allowOutsideClick: false,
    }).then((result) => {});
  }

  getPromotionData() {
    this.subs.sink = this.promoService.getAllPromo().subscribe(
      (promos) => {
        console.log(promos);
        if (promos) {
          const loginPromos = promos.filter((promo) => promo.for_login_page);
          if (loginPromos && loginPromos.length > 0) {
            this.sessionSlider.push(...loginPromos);
            this.showSessionSlider = true;
          }
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
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
  isVisited() {
    const dataFromLocalStorage = JSON.parse(localStorage.getItem('cookieVisited'));
    if (dataFromLocalStorage?.visited == true) {
      this.visited = true;
    } else {
      this.visited = false;
    }
  }

  setVisited() {
    const dataVisited = {
      visited: true,
    };
    localStorage.setItem('cookieVisited', JSON.stringify(dataVisited));
    this.visited = true;
  }

  gotoPrivacyPolicy() {
    const privacyPolicylink = document.createElement('a');
    privacyPolicylink.target = '_blank';

    if (this.translate.currentLang.toLowerCase() === 'en') {
      privacyPolicylink.href = GlobalConstants.privacyPolicy.ENLink;
    } else {
      privacyPolicylink.href = GlobalConstants.privacyPolicy.FRLink;
    }

    privacyPolicylink.setAttribute('visibility', 'hidden');
    document.body.appendChild(privacyPolicylink);
    privacyPolicylink.click();
    document.body.removeChild(privacyPolicylink);
  }
  showPassword() {
    this.passwordVisibility = !this.passwordVisibility;
    this.passwordFieldRef.nativeElement.type = this.passwordVisibility ? 'text' : 'password';
  }

  hidePassword() {
    this.isPasswordShown = false;
    this.passwordFieldRef.nativeElement.type = this.isPasswordShown ? 'text' : 'password';
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
