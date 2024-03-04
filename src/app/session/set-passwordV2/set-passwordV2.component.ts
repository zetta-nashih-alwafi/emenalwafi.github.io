import { Component, ViewEncapsulation, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../service/auth-service/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ApplicationUrls, GlobalConstants } from '../../shared/settings';
import Swal from 'sweetalert2';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { UserProfileData } from '../../users/user.model';
import { UserService } from '../../service/user/user.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { SubSink } from 'subsink';
import * as _ from 'lodash';
import { AppPermission } from 'app/models/app-permission.model';
import { UtilityService } from 'app/service/utility/utility.service';
import { PromoService } from 'app/service/promo/promo.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
    const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);

    return invalidCtrl || invalidParent;
  }
}

@Component({
  selector: 'ms-set-password',
  templateUrl: './set-passwordV2.component.html',
  styleUrls: ['./set-passwordV2.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SetPasswordV2Component implements OnInit, OnDestroy {
  private subs = new SubSink();
  upperPasswordVisibility: boolean = false;
  lowerPasswordVisibility: boolean = false;
  userData: any;
  schools: any[] = [];
  isShow: boolean;
  visited: Boolean;
  entities: any[];
  schoolIdList: string[] = [];
  password: string;
  confirmPassword: string;
  chechbox = false;
  showCookieInfo = true;
  token: string;
  isForgotPassword = false;
  isAcademic: any;
  isADMTC: any;
  isGroupSchool: any;
  isCompany: any;
  isStudent: any;
  schoolLength: any;
  setPasswordForm: UntypedFormGroup;
  matcher: ErrorStateMatcher;
  isWaitingForResponse = false;
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

  returnUrl = '';
  isReturnUrl = false;
  appData: AppPermission;

  @ViewChild('passwordField', { static: false }) passwordFieldRef: ElementRef;
  isPasswordShown: boolean = false;
  @ViewChild('confirmPasswordField', { static: false }) confirmPasswordFieldRef: ElementRef;
  isConfirmPasswordShown: boolean = false;
  inputPasswordName: string = '';

  constructor(
    private userService: UserService,
    public authService: AuthService,
    public router: Router,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private ngxPermissionService: NgxPermissionsService,
    private promoService: PromoService,
    public utilService: UtilityService,
  ) {}

  ngOnInit() {
    this.getAppData();
    this.getPromotionData();
    setTimeout(() => {
      this.checkIfTokenExpired();
    }, 500);
    this.setPasswordForm = this.fb.group(
      {
        password: [''],
        confirmPassword: [''],
      },
      { validator: this.checkPassword },
    );

    this.matcher = new MyErrorStateMatcher();
    const userId = this.route.snapshot.paramMap.get('userId');
    this.getUserById(userId);
    this.subs.sink = this.route.queryParamMap.subscribe(
      (params) => {
        this.token = params.get('token');
        const forgot = params.get('forgot');
        console.log(forgot);
        console.log(this.token);

        if (forgot) {
          this.isForgotPassword = true;
        }
        console.log('forgoooot ' + this.isForgotPassword);
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

    if (this.route.snapshot.queryParamMap.get('returnUrl')) {
      console.log(this.route.snapshot.queryParamMap.get('returnUrl'));
      this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      this.isReturnUrl = true;
    }
    this.isVisited();
  }

  getAppData() {
    this.utilService.getAppPermission().subscribe(
      (resp) => {
        this.appData = resp;
      },
      (err) => {
        this.authService.postErrorLog(err);
      },
    );
  }

  checkIfTokenExpired() {
    if (this.route && this.route.snapshot && this.route.snapshot.queryParamMap) {
      console.log(this.route.snapshot.queryParamMap.get('token'));
      const token = this.route.snapshot.queryParamMap.get('token');
      this.authService.checkLinkStatus(token).subscribe(
        (resp) => {
          console.log(resp);
          if (resp) {
            if (resp && resp.errors && resp.errors.length && resp.errors[0].message === 'jwt expired') {
              Swal.fire({
                type: 'info',
                allowOutsideClick: false,
                title: this.translate.instant('USER_LINK_EXPIRED.TITLE'),
                text: this.translate.instant('USER_LINK_EXPIRED.TEXT'),
                showConfirmButton: true,
                allowEnterKey: false,
                allowEscapeKey: false,
                confirmButtonText: this.translate.instant('USER_LINK_EXPIRED.BUTTON'),
              }).then((result) => {
                this.router.navigate(['/session/forgot-password']);
              });
            } else if (resp && resp.data && resp.data.CheckLinkStatus === null) {
              Swal.fire({
                type: 'info',
                allowOutsideClick: false,
                title: this.translate.instant('USER_LINK_EXPIRED.TITLE'),
                text: this.translate.instant('USER_LINK_EXPIRED.TEXT'),
                showConfirmButton: true,
                allowEnterKey: false,
                allowEscapeKey: false,
                confirmButtonText: this.translate.instant('USER_LINK_EXPIRED.BUTTON'),
              }).then((result) => {
                this.router.navigate(['/session/forgot-password']);
              });
            } else if (resp && resp.data && resp.data.CheckLinkStatus === 'Link Already Used') {
              Swal.fire({
                type: 'info',
                allowOutsideClick: false,
                title: this.translate.instant('USER_S2.TITLE'),
                text: this.translate.instant('USER_S2.TEXT'),
                showConfirmButton: true,
                allowEnterKey: false,
                allowEscapeKey: false,
                confirmButtonText: this.translate.instant('USER_S1.BUTTON'),
              }).then((result) => {
                this.router.navigate(['/session/login']);
              });
            }
          }
        },
        (err) => {
          this.authService.postErrorLog(err);
        },
      );
    }
  }

  checkPassword(group: UntypedFormGroup) {
    const pass = group.get('password').value;
    const confirmPass = group.get('confirmPassword').value;
    return pass === confirmPass ? null : { missMatch: true };
  }

  /**
   * send method is used to send a reset password link into your email.
   */
  send() {
    if (this.setPasswordForm.get('password').value === this.setPasswordForm.get('confirmPassword').value) {
      this.isWaitingForResponse = true;
      this.subs.sink = this.authService.setPassword(this.token, this.setPasswordForm.get('password').value).subscribe(
        (resp) => {
          this.isWaitingForResponse = false;
          const test = JSON.stringify(this.userData);
          if (this.isForgotPassword) {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('USER_S10.TITLE'),
              text: this.translate.instant('USER_S10.TEXT'),
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('USER_S10.BUTTON'),
              allowOutsideClick: false,
            }).then((isComfirm) => {
              this.autoLogin();
            });
          } else {
            Swal.fire({
              type: 'success',
              title: this.translate.instant('USER_S4.TITLE'),
              text: this.translate.instant('USER_S4.TEXT'),
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('USER_S4.BUTTON'),
              allowOutsideClick: false,
            }).then((isComfirm) => {
              this.autoLogin();
            });
          }
        },
        (error) => {
          this.isWaitingForResponse = false;
          console.log('this error' + error);
          this.authService.postErrorLog(error);
          Swal.fire({
            type: 'info',
            allowOutsideClick: false,
            title: this.translate.instant('USER_S2.TITLE'),
            text: this.translate.instant('USER_S2.TEXT'),
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('USER_S1.BUTTON'),
          });
        },
      );
    }
  }

  autoLogin() {
    this.subs.sink = this.authService.loginUser(this.userData.email.toLowerCase(), this.setPasswordForm.get('password').value).subscribe(
      (resp) => {
        if (resp) {
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
            this.getUserTableColumnSettings(resp);
          }
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getUserTableColumnSettings(resp) {
    const user = resp['data']['Login'];
    const userLogin = resp['data']['Login']['user'];
    if (userLogin?._id) {
      this.subs.sink = this.authService.GetUserTableColumnSettings(userLogin?._id).subscribe(
        (resps) => {
          if (resps && resps?.length) {
            localStorage.setItem('templateTable', JSON.stringify(resps));
          }
          const program = this.utilService.setDataProgram(_.cloneDeep(userLogin.entities));
          userLogin.entities = this.utilService.mergeHierarchyPermission(_.cloneDeep(userLogin.entities));
          const sortedEntities = this.utilService.sortEntitiesByHierarchy(_.cloneDeep(userLogin.entities));
          console.log('sortedEntities', sortedEntities);
          const permissions = [];
          const permissionsId = [];
          if (sortedEntities && sortedEntities.length > 0) {
            sortedEntities.forEach((entitsy) => {
              console.log('UserType name : ', entitsy.type.name);
              permissions.push(entitsy.type.name);
              permissionsId.push(entitsy.type._id);
            });
          }
          const temp = userLogin;
          temp.entities = sortedEntities;
          temp.app_data = program;
          user.user = temp;
          this.authService.setLocalUserProfileAndToken(user);
          if (permissions && permissions.length) {
            this.authService.setPermission([permissions[0]]);
            this.ngxPermissionService.flushPermissions();
            this.ngxPermissionService.loadPermissions([permissions[0]]);
            console.log('permissions (UserType): ', permissions);
            const domainUrl = this.router.url.split('/')[0];
            if (this.isReturnUrl) {
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
              window.open(`${domainUrl}/my-file`, '_self');
            } else if (permissionsId.findIndex((permission) => permission === '60b99bd0d824c52eec246fcb') > -1) {
              window.open(`${domainUrl}/mailbox/inbox`, '_self');
            } else {
              window.open(`${domainUrl}/`, '_self');
            }
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
    } else {
      const user = resp['data']['Login'];
      const userLogin = resp['data']['Login']['user'];
      const program = this.utilService.setDataProgram(_.cloneDeep(userLogin.entities));
      userLogin.entities = this.utilService.mergeHierarchyPermission(_.cloneDeep(userLogin.entities));
      const sortedEntities = this.utilService.sortEntitiesByHierarchy(_.cloneDeep(userLogin.entities));
      console.log('sortedEntities', sortedEntities);
      const permissions = [];
      const permissionsId = [];
      if (sortedEntities && sortedEntities.length > 0) {
        sortedEntities.forEach((entitsy) => {
          console.log('UserType name : ', entitsy.type.name);
          permissions.push(entitsy.type.name);
          permissionsId.push(entitsy.type._id);
        });
      }

      const temp = userLogin;
      temp.entities = sortedEntities;
      temp.app_data = program;
      user.user = temp;
      this.authService.setLocalUserProfileAndToken(user);
      if (permissions && permissions.length) {
        this.authService.setPermission([permissions[0]]);
        this.ngxPermissionService.flushPermissions();
        this.ngxPermissionService.loadPermissions([permissions[0]]);
        console.log('permissions (UserType): ', permissions);
        const domainUrl = this.router.url.split('/')[0];
        if (this.isReturnUrl) {
          this.router.navigateByUrl(this.returnUrl);
        } else if (
          permissionsId.findIndex((permission) => permission === '5a2e603c53b95d22c82f958f' || permission === '5a2e603f53b95d22c82f9590') >
          -1
        ) {
          // use window.open to hard reload the page so the styling in login page doesnt broke the styling in other page
          window.open(`${domainUrl}/students-card`, '_self');
        } else if (permissionsId.findIndex((permission) => permission === '5a66cd0813f5aa05902fac1e') > -1) {
          window.open(`${domainUrl}/school`, '_self');
        } else if (permissionsId.findIndex((permission) => permission === '5a067bba1c0217218c75f8ab') > -1) {
          window.open(`${domainUrl}/my-file`, '_self');
        } else if (permissionsId.findIndex((permission) => permission === '60b99bd0d824c52eec246fcb') > -1) {
          window.open(`${domainUrl}/mailbox/inbox`, '_self');
        } else {
          window.open(`${domainUrl}/`, '_self');
        }
      }
    }
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

  hideConcentText() {
    this.showCookieInfo = false;
  }

  private getUserById(userId: string) {
    console.log(userId);
    this.subs.sink = this.authService.getUserById(userId).subscribe(
      (res) => {
        this.userData = res;
        this.entities = res.entities;
      },
      (err) => {
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getUniqueSchools(entities) {
    const newEntity = _.filter(entities, function (entity) {
      return entity.school !== null;
    });
    return _.uniqBy(newEntity, 'school.short_name');
  }
  getUniqueSchoolType(entities) {
    return _.uniqBy(entities, 'school_type');
  }
  getUniqueEntity(entities) {
    return _.uniqBy(entities, 'entity_name');
  }

  getPromotionData() {
    this.subs.sink = this.promoService.getAllPromo().subscribe(
      (promos) => {
        console.log(promos);
        if (promos) {
          const loginPromos = promos.filter((promo) => promo.for_set_password_page);
          if (loginPromos && loginPromos.length > 0) {
            this.sessionSlider.push(...loginPromos);
            this.showSessionSlider = true;
          }
        }
      },
      (err) => {
        this.authService.postErrorLog(err);
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  showPassword(field: string) {
    if (field === 'upper') {
      this.upperPasswordVisibility = !this.upperPasswordVisibility;
      this.passwordFieldRef.nativeElement.type = this.upperPasswordVisibility ? 'text' : 'password';
    } else if (field === 'lower') {
      this.lowerPasswordVisibility = !this.lowerPasswordVisibility;
      this.confirmPasswordFieldRef.nativeElement.type = this.lowerPasswordVisibility ? 'text' : 'password';
    }
  }

  hidePassword() {
    if (this.inputPasswordName === 'passwordInput') {
      this.isPasswordShown = !this.isPasswordShown;
      this.passwordFieldRef.nativeElement.type = this.isPasswordShown ? 'text' : 'password';
      this.inputPasswordName = '';
    } else if (this.inputPasswordName === 'confirmPasswordInput') {
      this.isConfirmPasswordShown = !this.isConfirmPasswordShown;
      this.confirmPasswordFieldRef.nativeElement.type = this.isConfirmPasswordShown ? 'text' : 'password';
      this.inputPasswordName = '';
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
