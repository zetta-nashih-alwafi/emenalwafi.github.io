import { Component, ElementRef, Inject, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth-service/auth.service';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { SubSink } from 'subsink';
import { ReCaptchaV3Service } from 'ngx-captcha';
import { environment } from 'environments/environment';
import { AppPermission } from 'app/models/app-permission.model';
import { UtilityService } from 'app/service/utility/utility.service';
import { PromoService } from 'app/service/promo/promo.service';

@Component({
  selector: 'ms-forgot-password',
  templateUrl: './forgot-passwordV2-component.html',
  styleUrls: ['./forgot-passwordV2-component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ForgotPasswordV2Component implements OnInit, OnDestroy {
  private subs = new SubSink();

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

  // to store email and captcha data
  email: string;
  recaptcha: any;
  siteKey = environment.siteKey;

  // utility variables
  lang = this.translate.currentLang;
  isWaitingForResponse = false;
  appData: AppPermission;

  constructor(
    public authService: AuthService,
    public router: Router,
    private translate: TranslateService,
    private reCaptchaV3Service: ReCaptchaV3Service,
    public utilService: UtilityService,
    private promoService: PromoService,
  ) {
    this.subs.sink = this.translate.onLangChange.subscribe((e: Event) => {
      this.lang = this.translate.currentLang;
    });
  }

  /**
   * send method is used to send a reset password link into your email.
   */
  send(value) {
    this.isWaitingForResponse = true;
    this.subs.sink = this.authService.resetPasswordV2({ lang: this.translate.currentLang, email: value.email }).subscribe(
      (resp) => {
        if (
          resp &&
          resp.errors &&
          resp.errors.length &&
          resp.errors[0] &&
          resp.errors[0].message &&
          resp.errors[0].message === 'Forgot password can only be sent one time in a day'
        ) {
          this.isWaitingForResponse = false;
          this.showErrorForgotOnceDay();
        } else if (
            resp?.data?.RequestForgotPassword?.message === 'user was detected as a student' && 
            resp?.data?.RequestForgotPassword?.school
          ) {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: this.translate.instant('USER_S6.TITLE', {schoolName: resp?.data?.RequestForgotPassword?.school}),
            text: this.translate.instant('USER_S6.TEXT', {schoolName: resp?.data?.RequestForgotPassword?.school}),
            allowOutsideClick: false,
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('USER_S6.BUTTON'),
          });
        } else if (resp?.data?.RequestForgotPassword?.message === 'user was detected as a teacher') {
          this.isWaitingForResponse = false;
          Swal.fire({
            type: 'info',
            title: this.translate.instant('USER_S6B.TITLE'),
            html: this.translate.instant('USER_S6B.TEXT'),
            allowOutsideClick: false,
            showConfirmButton: true,
            confirmButtonText: this.translate.instant('USER_S6B.BUTTON'),
          });
        } else {
          console.log(resp);
          this.isWaitingForResponse = false;
          if (resp && resp.data) {
            Swal.fire({
              type: 'info',
              title: this.translate.instant('USER_S4B.TITLE'),
              html: this.translate.instant('USER_S4B.TEXT'),
              allowOutsideClick: false,
              showConfirmButton: true,
              confirmButtonText: this.translate.instant('USER_S4B.BUTTON'),
            }).then((isConfirm) => {
              this.router.navigate(['/session/login']);
            });
          } else {
            this.isWaitingForResponse = false;
            this.showErrorEmailInvalid();
          }
        }
      },
      (err) => {
        this.isWaitingForResponse = false;
        this.authService.postErrorLog(err)
        Swal.fire({
          type: 'info',
          title: this.translate.instant('SORRY'),
          text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
          confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
        });
      //   this.showErrorEmailInvalid();
      },
    );
  }

  showErrorEmailInvalid() {
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      title: this.translate.instant('FORGOT_PASSWORD.TITLE'),
      text: this.translate.instant('FORGOT_PASSWORD.MESSAGE'),
      showConfirmButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      confirmButtonText: this.translate.instant('FORGOT_PASSWORD.BUTTON'),
    });
  }

  showErrorForgotOnceDay() {
    Swal.fire({
      allowOutsideClick: false,
      type: 'info',
      title: this.translate.instant('FORGOT_PASSWORD_ONCE_A_DAY.TITLE'),
      text: this.translate.instant('FORGOT_PASSWORD_ONCE_A_DAY.MESSAGE'),
      showConfirmButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      confirmButtonText: this.translate.instant('FORGOT_PASSWORD_ONCE_A_DAY.BUTTON'),
    });
  }

  ngOnInit(): void {
    this.getAppData();
    this.getPromotionData();
  }

  getAppData() {
    this.utilService.getAppPermission().subscribe((resp) => {
      this.appData = resp;
    },
    err=>{
      this.authService.postErrorLog(err)
    });
  }

  handleSuccess(event: string) {
    console.log(`Resolved response token: ${event}`);
    this.subs.sink = this.authService.verifRecaptcha(event).subscribe((res) => {
      console.log(res);
    },
    (err) => {
      this.authService.postErrorLog(err)
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
  }

  getPromotionData() {
    this.subs.sink = this.promoService.getAllPromo().subscribe((promos) => {
      console.log(promos);
      if (promos) {
        const loginPromos = promos.filter((promo) => promo.for_forgot_password_page);
        if (loginPromos && loginPromos.length > 0) {
          this.sessionSlider.push(...loginPromos);
          this.showSessionSlider = true;
        }
      }
    },
    (err) => {
      this.authService.postErrorLog(err)
      Swal.fire({
        type: 'info',
        title: this.translate.instant('SORRY'),
        text: err && err['message'] ? this.translate.instant(err['message'].replaceAll('GraphQL error: ', '')) : err,
        confirmButtonText: this.translate.instant('DISCONNECT_SCHOOL.BUTTON3'),
      });
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
