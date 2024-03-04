import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './service/auth-service/auth.service';
import { Injector, NgZone, Injectable } from '@angular/core';
import { GlobalErrorService } from './service/global-error-service/global-error-service.service';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';

@Injectable()
export class SwalErrorHandler {
  constructor(private translate: TranslateService, private ngZone: NgZone, private injector: Injector) {}

  // Get the authService via injector to avoid instantiate cyclic dependency error
  public get authService(): AuthService {
    // this creates authService object to refer to the service.
    return this.injector.get(AuthService);
  }

  public get globalErrorService(): GlobalErrorService {
    return this.injector.get(GlobalErrorService);
  }

  private get _router() {
    return this.injector.get(Router);
  }

  call(error: any, stackTrace: any = null, reason: any = null) {}

  public handleError(Error): void {
    console.log('current url: ', window.location.href);
    console.log(Error);
    if (Error) {
      const error = String(Error);
      let exception = false;

      // Exception, dont add unless absolutely neccessary
      // temporary disable swal for route that include word "students"
      if (
        error.includes('ExpressionChangedAfterItHasBeenCheckedError') ||
        error.includes('confirmButton') ||
        error.includes('toElement') ||
        error.includes('salt') ||
        window.location.href.includes('students')
      ) {
        exception = true;
      }

      if (
        !error?.includes('jwt expired') &&
        !error?.includes('invalid signature') &&
        !error?.toLowerCase().includes('jwt') &&
        !error.includes('str & salt required') &&
        !error.includes('UnAuthenticated') &&
        !error.includes('salt') &&
        !error.includes('Authorization header is missing') &&
        !error.includes('ExpressionChangedAfterItHasBeenCheckedError') &&
        !error.includes('Password Not Valid')
      ) {
        const err = Error && Error.stack ? JSON.stringify(Error.stack) : error;
        this.authService.postErrorLog(err);
      }
      if (
        error?.includes('jwt expired') ||
        error?.toLowerCase().includes('jwt') ||
        error?.includes('invalid signature') ||
        error?.includes('str & salt required') ||
        error?.includes('Authorization header is missing') ||
        error?.includes('UnAuthenticated') ||
        error?.includes('salt') ||
        (error.includes('salt') && !exception)
      ) {
        this.ngZone.run(() => this.authService.logOut());
      } else if (error.includes('ExpressionChangedAfterItHasBeenCheckedError') && !exception) {
        this.globalErrorService.setGlobalError(true);
      } else if (error.includes('site is unpublished')) {
        this.ngZone.run(() => this._router.navigate(['/404']));
      } else if (!exception && Error.error !== 'popup_closed_by_user') {
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          html: error + '<br>' + this.translate.instant('ERROR_HANDLER.Please Alert The Administration'),
          confirmButtonText: this.translate.instant('ERROR_HANDLER.OK'),
          allowOutsideClick: false,
          allowEnterKey: false,
          allowEscapeKey: false,
        }).then(() => {
          this.globalErrorService.setGlobalError(true);
        });
      }
      if (Error && Error.error === 'popup_closed_by_user') {
        // This condition for google api message when user cancel auth
        Swal.fire({
          type: 'warning',
          title: 'Attention',
          html: this.translate.instant('Dialog Authentication Closed By User'),
          confirmButtonText: this.translate.instant('ERROR_HANDLER.OK'),
          allowOutsideClick: false,
          allowEnterKey: false,
          allowEscapeKey: false,
        }).then(() => {
          this.globalErrorService.setGlobalError(true);
        });
      }
      console.log('error', error);
      if (error.includes('Network error: Http failure response for')) {
        Swal.fire({
          type: 'warning',
          title: this.translate.instant('BAD_CONNECTION.Title'),
          html: this.translate.instant('BAD_CONNECTION.Text'),
          confirmButtonText: this.translate.instant('BAD_CONNECTION.Button'),
          allowOutsideClick: false,
          allowEnterKey: false,
          allowEscapeKey: false,
        });
      }
    }
  }
}
