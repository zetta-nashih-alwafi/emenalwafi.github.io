import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { NgxPermission } from 'ngx-permissions/lib/model/permission.model';
import { NgxPermissionsService } from 'ngx-permissions';
import * as _ from 'lodash';
import { PermissionService } from '../permission/permission.service';
import { AuthService } from '../auth-service/auth.service';
import { UtilityService } from '../utility/utility.service';
import { SubSink } from 'subsink';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  private subs = new SubSink();
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private permissions: NgxPermissionsService,
    public permissionService: PermissionService,
    private authService: AuthService,
    private utilService: UtilityService,
    private translate: TranslateService,
  ) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!localStorage.getItem(environment.tokenKey) || !localStorage.getItem('permissions') || !localStorage.getItem('userProfile')) {
      // If any guard returns a UrlTree, the current navigation is cancelled and a new navigation begins to the UrlTree returned from the guard.
      return this.router.createUrlTree(['/session/login'], { queryParams: { returnUrl: state.url } });
    }
    const expectedPermission = route.data.permission;
    if (expectedPermission) {
      let allow = this.permissionService.showMenu(expectedPermission);
      console.log('permission', expectedPermission, allow);

      // *************** Start Exceptions for users that use a module(have access) inside another module(do not have access)
      if (this.permissions.getPermission('Chief Group Academic')) {
        if (expectedPermission === 'rncp_title.show_perm') {
          allow = this.permissionService.showMenu('rncp_title.show_chief_group_perm');
        }
      }
      if (this.permissions.getPermission('Mentor') || this.permissions.getPermission('HR')) {
        if (expectedPermission === 'schools.show_perm') {
          allow = true;
        }
      }

      // if (this.permissions.getPermission('Alumni')) {
      //   if (expectedPermission === 'mailbox.show_perm') {
      //     allow = true;
      //   }
      // }
      // if (this.permissions.getPermission('Director of Admissions')) {
      //     allow = true;
      // }
      // if (this.permissions.getPermission('Candidate')) {
      //     allow = false;
      // }
      // *************** End Exceptions for users that use a module(have access) inside another module(do not have access)

      const permissions = this.permissions.getPermissions();

      if (!allow) {
        if (this.permissions.getPermission('Mentor') || this.permissions.getPermission('HR')) {
          this.router.navigate(['/students-card']);
        } else if (this.permissions.getPermission('Chief Group Academic')) {
          this.router.navigate(['/school-group']);
        } else if (this.permissions.getPermission('Chief Group Academic')) {
          this.router.navigate(['/school-group']);
        } else if (this.permissions.getPermission('Student')) {
          this.router.navigate(['/my-file']);
        } else if (this.permissions.getPermission('Candidate')) {
          this.router.navigate(['/mailbox/inbox']);
        } else if (this.permissions.getPermission('Alumni')) {
          this.router.navigate(['/alumni-trombinoscope']);
        } else if (this.permissions.getPermission('Director of Admissions')) {
          this.router.navigate(['/dashboard-register']);
        } else if (
          (permissions.constructor === Object && Object.keys(permissions).length === 0) ||
          !this.permissionService.getEntityPermission()
        ) {
          this.authService.logOut();
        } else if (!this.permissionService.showMenu('rncp_title.show_perm')) {
          this.router.navigate(['/task']);
        } else {
          this.router.navigate(['/task']);
        }
      }
    }

    // console.log('data test user profile', localStorage.getItem('userProfile'));
    const userData = JSON.parse(localStorage.getItem('userProfile'));
    let isLogin = false;
    let isPasswordSet = false;
    if (userData) {
      isLogin = true;
      if (userData.is_password_set) {
        isPasswordSet = true;
      }
      return true;
    }

    // *************** Get Query Param from link, usually to check from notif link
    let userId = '';
    let setPasswordToken = '';
    let autoLoginEmail = '';
    let autoLoginToken = '';
    console.log(route.queryParamMap.keys);
    if (route.queryParams.hasOwnProperty('userId')) {
      userId = route.queryParams.userId;
    }
    if (route.queryParams.hasOwnProperty('setPasswordToken') && !isLogin && !isPasswordSet) {
      setPasswordToken = route.queryParams.setPasswordToken;
    }
    if (route.queryParams.hasOwnProperty('email')) {
      autoLoginEmail = route.queryParams.email;
    }
    if (route.queryParams.hasOwnProperty('token')) {
      autoLoginToken = route.queryParams.token;
    }

    // *************** If link has email and password in the link, then we do autologin
    if (autoLoginEmail && autoLoginToken) {
      console.log(state.url);
      this.autoLogin(autoLoginEmail, autoLoginToken, state.url);
      return;
    }

    if (userId !== '' && setPasswordToken !== '') {
      // if user from notif and has set password token, route to set-password while store original url
      this.router.navigate([`/session/setPassword/${userId}`], { queryParams: { returnUrl: state.url, token: setPasswordToken } });
    } else {
      // not logged in so redirect to login page with the return url
      this.router.navigate(['/session/login'], { queryParams: { returnUrl: state.url } });
    }
    return false;
  }

  private autoLogin(email: string, token: string, originalUrl) {
    this.subs.unsubscribe();
    this.subs.sink = this.authService.autoLoginFromAuth(email.toLowerCase()).subscribe(
      (resp) => {
        if (resp) {
          console.log(resp);
          const userLogin = resp;
          console.log(resp);
          this.getUserTableColumnSettings(userLogin, resp, resp?._id, originalUrl, token);
          console.log(userLogin);
        } else {
          this.authService.logOut();
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
        this.authService.logOut();
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      },
    );
  }

  getUserTableColumnSettings(userLogin, resp, user_id, originalUrl, token) {
    if (user_id) {
      this.subs.sink = this.authService.GetUserTableColumnSettings(user_id).subscribe(
        (resps) => {
          if (resps && resps?.length) {
            localStorage.setItem('templateTable', JSON.stringify(resps));
          }
          const program = this.utilService.setDataProgram(userLogin.entities);
          userLogin.entities = this.utilService.mergeHierarchyPermission(_.cloneDeep(userLogin.entities));
          const sortedEntities = this.utilService.sortEntitiesByHierarchy(userLogin.entities);
          const permissions = [];
          const permissionsId = [];
          if (sortedEntities && sortedEntities.length > 0) {
            sortedEntities.forEach((entity) => {
              console.log('UserType name : ', entity.type.name);
              permissions.push(entity.type.name);
              permissionsId.push(entity.type._id);
            });
          }

          const temp = userLogin;
          temp.entities = sortedEntities;
          temp.app_data = program;

          localStorage.setItem('userProfile', JSON.stringify(temp));

          if (permissions && permissions.length) {
            // this.authService.setLocalUserProfileAndToken(resp);
            this.authService.setLocalUserProfileAndToken({ token: token, user: resp });
            this.authService.setPermission(permissions);
            this.permissions.flushPermissions();
            this.permissions.loadPermissions(permissions);
            console.log('permissions (UserType): ', permissions);

            const cleanedUrl = originalUrl.split('?')[0];
            this.router.navigateByUrl(cleanedUrl);
          } else {
            this.authService.logOut();
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
    } else {
      const program = this.utilService.setDataProgram(userLogin.entities);
      userLogin.entities = this.utilService.mergeHierarchyPermission(_.cloneDeep(userLogin.entities));
      const sortedEntities = this.utilService.sortEntitiesByHierarchy(userLogin.entities);
      const permissions = [];
      const permissionsId = [];
      if (sortedEntities && sortedEntities.length > 0) {
        sortedEntities.forEach((entity) => {
          console.log('UserType name : ', entity.type.name);
          permissions.push(entity.type.name);
          permissionsId.push(entity.type._id);
        });
      }

      const temp = userLogin;
      temp.entities = sortedEntities;
      temp.app_data = program;

      localStorage.setItem('userProfile', JSON.stringify(temp));

      if (permissions && permissions.length) {
        // this.authService.setLocalUserProfileAndToken(resp);
        this.authService.setLocalUserProfileAndToken({ token: token, user: resp });
        this.authService.setPermission(permissions);
        this.permissions.flushPermissions();
        this.permissions.loadPermissions(permissions);
        console.log('permissions (UserType): ', permissions);

        const cleanedUrl = originalUrl.split('?')[0];
        this.router.navigateByUrl(cleanedUrl);
      } else {
        this.authService.logOut();
      }
    }
  }
}
