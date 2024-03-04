import { MatDialogModule } from '@angular/material/dialog';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, Injector, NgZone } from '@angular/core';
import { BrowserModule, DomSanitizer, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

import { TranslateModule, TranslateLoader, TranslateService, MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Ng5BreadcrumbModule, BreadcrumbService } from 'ng5-breadcrumb';
import { DeviceDetectorModule } from 'ngx-device-detector';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { RoutingModule } from './app-routing.module';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';

import { AuthService } from './service/auth-service/auth.service';
import { PageTitleService } from './core/page-title/page-title.service';

import { AppComponent } from './app.component';
import { MenuToggleModule } from './core/menu/menu-toggle.module';
import { MenuItems } from './core/menu/menu-items/menu-items';
import { AuthGuard } from './core/guards/auth.guard';

import { WidgetComponentModule } from './widget-component/widget-component.module';
import { HorizontalLayoutComponent } from './horizontal-layout/horizontal-layout.component';
import { HorizontalMenuItems } from './core/menu/horizontal-menu-items/horizontal-menu-items';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

import { GraphQLModule } from './graphql.module';

import { NgxPermissionsModule, NgxPermissionsRestrictStubModule } from 'ngx-permissions';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeId from '@angular/common/locales/id';
import localeEs from '@angular/common/locales/es';
import { SwalErrorHandler } from './error-handler';
import { VoiceRecognitionService } from './service/voice-recognition/voice-recognition.service';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { CustomDatePickerAdapter, CUSTOM_DATE_FORMATS } from './date-adapters';
import { MatTooltipDefaultOptions, MAT_TOOLTIP_DEFAULT_OPTIONS } from '@angular/material/tooltip';

registerLocaleData(localeFr);
registerLocaleData(localeId);
registerLocaleData(localeEs);
// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

export class MissingTranslationHelper implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    if (params.interpolateParams) {
      return params.interpolateParams["default"] || params.key;
    }
    return params.key;
  }
}

export const OtherOptions: MatTooltipDefaultOptions = {
  showDelay: 0,
  hideDelay: 0,
  touchGestures: 'auto',
  touchendHideDelay: 0,
  disableTooltipInteractivity: true,
};

// export error handler

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};

const MAT_MODULES = [
  MatMenuModule,
  MatSidenavModule,
  MatButtonModule,
  MatInputModule,
  MatToolbarModule,
  MatIconModule,
  MatCardModule,
  MatTabsModule,
  MatListModule,
  MatDatepickerModule,
  MatCheckboxModule,
];

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MatDialogModule,
    ReactiveFormsModule,
    DeviceDetectorModule.forRoot(),
    RoutingModule,
    FlexLayoutModule,
    Ng5BreadcrumbModule.forRoot(),
    PerfectScrollbarModule,
    MenuToggleModule,
    HttpClientModule,
    MatSlideToggleModule,
    CKEditorModule,
    TranslateModule.forRoot({
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslationHelper,
      },
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),

    NgxPermissionsModule.forRoot(),
    WidgetComponentModule,
    LoadingBarRouterModule,
    LoadingBarRouterModule,
    ...MAT_MODULES,
    GraphQLModule,

    NgxPermissionsRestrictStubModule,
    NgxMaterialTimepickerModule,
  ],
  declarations: [AppComponent,HorizontalLayoutComponent],
  bootstrap: [AppComponent],
  providers: [
    MenuItems,
    HorizontalMenuItems,
    BreadcrumbService,
    PageTitleService,
    VoiceRecognitionService,
    AuthService,
    Title,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
    AuthGuard,
    {
      provide: ErrorHandler,
      useClass: SwalErrorHandler,
    },
    { provide: DateAdapter, useClass: CustomDatePickerAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    {
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
      useValue: OtherOptions,
    },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GeneAppModule {
  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon('flag', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/flag.svg'));
    iconRegistry.addSvgIcon('file-download-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-download-outline.svg'));
    iconRegistry.addSvgIcon('close-octagon', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/close-octagon.svg'));
    iconRegistry.addSvgIcon('check-octagon', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/check-octagon.svg'));
    iconRegistry.addSvgIcon('file-upload', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-upload.svg'));
    iconRegistry.addSvgIcon('file-eye', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-eye.svg'));
    iconRegistry.addSvgIcon('file-download', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-download.svg'));
    iconRegistry.addSvgIcon('incognito', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/incognito.svg'));
    iconRegistry.addSvgIcon('alarm-light', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/alarm-light.svg'));
    iconRegistry.addSvgIcon('file-excel', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-excel.svg'));
    iconRegistry.addSvgIcon('file-pdf', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-pdf.svg'));
    iconRegistry.addSvgIcon('account-plus', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-plus.svg'));
    iconRegistry.addSvgIcon('file-document-arrow-right-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-document-arrow-right-outline.svg'));
    iconRegistry.addSvgIcon('email-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/email-outline.svg'));
    iconRegistry.addSvgIcon('loop', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/loop.svg'));
    iconRegistry.addSvgIcon('close', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/close.svg'));
    iconRegistry.addSvgIcon('pencil', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/pencil.svg'));
    iconRegistry.addSvgIcon('bank-plus', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/bank-plus.svg'));
    iconRegistry.addSvgIcon('eye', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/eye.svg'));
    iconRegistry.addSvgIcon('gavel', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/gavel.svg'));
    iconRegistry.addSvgIcon('certificate', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/certificate.svg')); // has error when open file in browser
    iconRegistry.addSvgIcon('content-copy', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/content-copy.svg'));
    iconRegistry.addSvgIcon('chevron-right', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/chevron-right.svg'));
    iconRegistry.addSvgIcon('undo-variant', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/undo-variant.svg'));
    iconRegistry.addSvgIcon('file-pdf-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-pdf-outline.svg'));
    iconRegistry.addSvgIcon('thumb-up-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/thumb-up-outline.svg'));
    iconRegistry.addSvgIcon('tick-checkbox', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/tick-checkbox.svg')); // has error when open file in browser
    iconRegistry.addSvgIcon('privacy-policy', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/privacy-policy.svg')); // has error when open file in browser
    iconRegistry.addSvgIcon('email', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/email.svg'));
    iconRegistry.addSvgIcon('receipt', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/receipt.svg'));
    iconRegistry.addSvgIcon('key', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/key.svg')); // has error when open file in browser
    iconRegistry.addSvgIcon(
      'indeterminate_check_box',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/indeterminate_check_box.svg'),
    );
    iconRegistry.addSvgIcon('account-supervisor', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-supervisor.svg')); // has error when open file in browser
    iconRegistry.addSvgIcon('attachment', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/attachment.svg'));
    iconRegistry.addSvgIcon('magnify', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/magnify.svg'));
    iconRegistry.addSvgIcon('backup-restore', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/backup-restore.svg'));
    iconRegistry.addSvgIcon('close-circle-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/close-circle-outline.svg'));
    iconRegistry.addSvgIcon('circle-edit-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/circle-edit-outline.svg'));
    iconRegistry.addSvgIcon('label_draft', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/archive-draft.svg'));
    iconRegistry.addSvgIcon('folder-open-regular', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/folder-open-regular.svg'));
    iconRegistry.addSvgIcon('library', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/library.svg'));
    iconRegistry.addSvgIcon('file-excel-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-excel-outline.svg'));
    iconRegistry.addSvgIcon(
      'checkbox-marked-outline',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/checkbox-marked-outline.svg'),
    );
    iconRegistry.addSvgIcon('check-revise', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/check-revise.svg'));
    iconRegistry.addSvgIcon('companies', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/companies.svg'));
    iconRegistry.addSvgIcon('bullhorn', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/bullhorn.svg'));
    iconRegistry.addSvgIcon('text-box-plus', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/text-box-plus.svg'));
    iconRegistry.addSvgIcon('account-question', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-question.svg'));
    iconRegistry.addSvgIcon('file-search', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-search.svg'));
    iconRegistry.addSvgIcon('microphone', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/microphone.svg'));
    iconRegistry.addSvgIcon('microphone-plus', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/microphone-plus.svg'));
    iconRegistry.addSvgIcon('trash-can', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/trash-can.svg'));
    iconRegistry.addSvgIcon('plus', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/plus.svg'));
    iconRegistry.addSvgIcon('selection', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/selection.svg'));
    iconRegistry.addSvgIcon('reply', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/reply.svg'));
    iconRegistry.addSvgIcon('content-save', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/content-save.svg'));
    iconRegistry.addSvgIcon('account-group', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-group.svg'));
    iconRegistry.addSvgIcon('file-check', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-check.svg'));
    iconRegistry.addSvgIcon('chair-school', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/chair-school.svg'));
    iconRegistry.addSvgIcon('school', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/school.svg'));
    iconRegistry.addSvgIcon('bank', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/bank.svg'));
    iconRegistry.addSvgIcon('pound', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/pound.svg'))
    iconRegistry.addSvgIcon('certsvg', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/certsvg.svg'));
    iconRegistry.addSvgIcon('feather', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/feather.svg'));
    iconRegistry.addSvgIcon('bike', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/bike.svg'));
    iconRegistry.addSvgIcon('briefcase', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/briefcase.svg'));
    iconRegistry.addSvgIcon('translate', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/translate.svg'));
    iconRegistry.addSvgIcon('bank-transfer', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/bank-transfer.svg'));
    iconRegistry.addSvgIcon('transfer-right', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/transfer-right.svg'));
    iconRegistry.addSvgIcon('account-search', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-search.svg'));
    iconRegistry.addSvgIcon('account-tie', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-tie.svg'));
    iconRegistry.addSvgIcon('information-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/information-outline.svg'));
    iconRegistry.addSvgIcon('clipboard-check', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/clipboard-check.svg'));
    iconRegistry.addSvgIcon('calendar-range', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/calendar-range.svg'));
    iconRegistry.addSvgIcon('currency-eur', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/currency-eur.svg'));
    iconRegistry.addSvgIcon('hand-right', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/hand-right.svg'));
    iconRegistry.addSvgIcon('office-building', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/office-building.svg'));
    iconRegistry.addSvgIcon('credit-card-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/credit-card-outline.svg'));
    iconRegistry.addSvgIcon('application-import', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/application-import.svg'));
    iconRegistry.addSvgIcon('account-tie', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-tie.svg'));
    iconRegistry.addSvgIcon('login', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/login.svg'));
    iconRegistry.addSvgIcon('logout', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/logout.svg'));
    iconRegistry.addSvgIcon('basketball', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/basketball.svg'));
    iconRegistry.addSvgIcon('parachute', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/parachute.svg'));
    iconRegistry.addSvgIcon('send', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/send.svg'));
    iconRegistry.addSvgIcon('circle', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/circle.svg'));
    iconRegistry.addSvgIcon('close-thick', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/close-thick.svg'));
    iconRegistry.addSvgIcon('content-duplicate', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/content-duplicate.svg'));
    iconRegistry.addSvgIcon(
      'badge-account-horizontal-outline',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/badge-account-horizontal-outline.svg'),
    );
    iconRegistry.addSvgIcon('file-certificate', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-certificate.svg'));
    iconRegistry.addSvgIcon(
      'account-multiple-outline',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-multiple-outline.svg'),
    );
    iconRegistry.addSvgIcon('signature-freehand', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/signature-freehand.svg'));
    iconRegistry.addSvgIcon('phone-ring-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/phone-ring-outline.svg'));
    iconRegistry.addSvgIcon('door', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/door.svg'));
    iconRegistry.addSvgIcon('account-tie-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-tie-outline.svg'));
    iconRegistry.addSvgIcon('phone-forward', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/phone-forward.svg'));
    iconRegistry.addSvgIcon('whatsapp', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/whatsapp.svg'));
    iconRegistry.addSvgIcon('clipboard-list-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/clipboard-list-outline.svg'));
    iconRegistry.addSvgIcon('flag-variant-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/flag-variant-outline.svg'));
    iconRegistry.addSvgIcon('phone-check-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/phone-check-outline.svg'));
    iconRegistry.addSvgIcon('email-check-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/email-check-outline.svg'));
    iconRegistry.addSvgIcon('account-heart', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-heart.svg'));
    iconRegistry.addSvgIcon('account-switch', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-switch.svg'));
    iconRegistry.addSvgIcon('account-check', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-check.svg'));
    iconRegistry.addSvgIcon('phone', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/phone.svg'));
    iconRegistry.addSvgIcon('trophy-award', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/trophy-award.svg'));
    iconRegistry.addSvgIcon('account-arrow-right', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-arrow-right.svg'));
    iconRegistry.addSvgIcon('target-account', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/target-account.svg'));
    iconRegistry.addSvgIcon('calendar-range', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/calendar-range.svg'));
    iconRegistry.addSvgIcon('flash', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/flash.svg'));
    iconRegistry.addSvgIcon('account', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account.svg'));
    iconRegistry.addSvgIcon('calendar-alert', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/calendar-alert.svg'));
    iconRegistry.addSvgIcon('menu-down', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/menu-down.svg'));
    iconRegistry.addSvgIcon('account-search', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-search.svg'));
    iconRegistry.addSvgIcon('map-marker-radius', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/map-marker-radius.svg'));
    iconRegistry.addSvgIcon('calendar-account', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/calendar-account.svg'));
    iconRegistry.addSvgIcon('link-variant', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/link-variant.svg'));
    iconRegistry.addSvgIcon(
      'clipboard-check-outline',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/clipboard-check-outline.svg'),
    );
    iconRegistry.addSvgIcon('signature-freehand', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/signature-freehand.svg'));
    iconRegistry.addSvgIcon('account-child-circle', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-child-circle.svg'));
    iconRegistry.addSvgIcon(
      'card-account-mail-outline',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/card-account-mail-outline.svg'),
    );
    iconRegistry.addSvgIcon('calender-acount', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/calender-acount'));
    iconRegistry.addSvgIcon('text-box-remove', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/text-box-remove.svg'));
    iconRegistry.addSvgIcon('bell', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/bell.svg'));
    iconRegistry.addSvgIcon(
      'clipboard-arrow-up-outline',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/clipboard-arrow-up-outline.svg'),
    );
    iconRegistry.addSvgIcon('calendar-blank', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/calendar-blank.svg'));
    iconRegistry.addSvgIcon('calendar-weekend', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/calendar-weekend.svg'));
    iconRegistry.addSvgIcon('eye-check', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/eye-check.svg'));
    iconRegistry.addSvgIcon('eye-plus', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/eye-plus.svg'));
    iconRegistry.addSvgIcon(
      'emoticon-excited-outline',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/emoticon-excited-outline.svg'),
    );
    iconRegistry.addSvgIcon(
      'account-question-outline',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-question-outline.svg'),
    );
    iconRegistry.addSvgIcon('text-account', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/text-account.svg'));
    iconRegistry.addSvgIcon('briefcase-plus', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/briefcase-plus.svg'));
    iconRegistry.addSvgIcon('account-tie-voice', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-tie-voice.svg'));
    iconRegistry.addSvgIcon('hand', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/hand.svg'));
    iconRegistry.addSvgIcon('minus', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/minus.svg'));
    iconRegistry.addSvgIcon('clock-time-nine', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/clock-time-nine.svg'));
    iconRegistry.addSvgIcon('content-save-edit', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/content-save-edit.svg'));
    iconRegistry.addSvgIcon('shield-account', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/shield-account.svg'));
    iconRegistry.addSvgIcon('history', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/history.svg'));
    iconRegistry.addSvgIcon('gesture-tap', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/gesture-tap.svg'));
    iconRegistry.addSvgIcon('cloud-upload', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/cloud-upload.svg'));
    iconRegistry.addSvgIcon('parachute', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/parachute.svg'));
    iconRegistry.addSvgIcon('calendar-alert', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/calendar-alert.svg'));
    iconRegistry.addSvgIcon('handshake', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/handshake.svg'));
    iconRegistry.addSvgIcon('handshakes', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/handshakes.svg'));
    iconRegistry.addSvgIcon('call-outgoing', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/call-outgoing.svg'));
    iconRegistry.addSvgIcon('key-variant', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/key-variant.svg'));
    iconRegistry.addSvgIcon('check-underline-circle', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/check-underline-circle.svg'));
    iconRegistry.addSvgIcon('file-document-edit', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-document-edit.svg'));
    iconRegistry.addSvgIcon('heart-cog', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/heart-cog.svg'));
    iconRegistry.addSvgIcon('file-account', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-account.svg'));
    iconRegistry.addSvgIcon('text-box-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/text-box-outline.svg'));
    iconRegistry.addSvgIcon('video', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/video.svg'));
    iconRegistry.addSvgIcon(
      'card-account-details-star-outline',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/card-account-details-star-outline.svg'),
    );
    iconRegistry.addSvgIcon('calendar-blank', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/calendar-blank.svg'));
    iconRegistry.addSvgIcon('infinity', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/infinity.svg'));
    iconRegistry.addSvgIcon('calendar-weekend', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/calendar-weekend.svg'));
    iconRegistry.addSvgIcon('account-hard-hat', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-hard-hat.svg'));
    iconRegistry.addSvgIcon('account-star', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-star.svg'));
    iconRegistry.addSvgIcon('account-circle-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-circle-outline.svg'));
    iconRegistry.addSvgIcon('numeric-1-box', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/numeric-1-box.svg'));
    iconRegistry.addSvgIcon('numeric-2-box', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/numeric-2-box.svg'));
    iconRegistry.addSvgIcon('numeric-3-box', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/numeric-3-box.svg'));
    iconRegistry.addSvgIcon('numeric-4-box', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/numeric-4-box.svg'));
    iconRegistry.addSvgIcon('numeric-5-box', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/numeric-5-box.svg'));
    iconRegistry.addSvgIcon('numeric-6-box', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/numeric-6-box.svg'));
    iconRegistry.addSvgIcon('numeric-7-box', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/numeric-7-box.svg'));
    iconRegistry.addSvgIcon('numeric-8-box', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/numeric-8-box.svg'));
    iconRegistry.addSvgIcon('numeric-9-box', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/numeric-9-box.svg'));
    iconRegistry.addSvgIcon('numeric-10-box', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/numeric-10-box.svg'));
    iconRegistry.addSvgIcon('account-child-circle', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-child-circle.svg'));
    iconRegistry.addSvgIcon('credit-card-check', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/credit-card-check.svg'));
    iconRegistry.addSvgIcon('currency-eur-off', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/currency-eur-off.svg'));
    iconRegistry.addSvgIcon('archive-edit-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/archive-edit-outline.svg'));
    iconRegistry.addSvgIcon('thumb-down-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/thumb-down-outline.svg'));
    iconRegistry.addSvgIcon(
      'checkbox-marked-circle-outline',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/checkbox-marked-circle-outline.svg'),
    );
    iconRegistry.addSvgIcon(
      'credit-card-refund-outline',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/credit-card-refund-outline.svg'),
    );
    iconRegistry.addSvgIcon('card-text-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/card-text-outline.svg'));
    iconRegistry.addSvgIcon('lock', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/lock.svg'));
    iconRegistry.addSvgIcon('lock-open-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/lock-open-outline.svg'));
    iconRegistry.addSvgIcon('archive-plus-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/archive-plus-outline.svg'));
    iconRegistry.addSvgIcon('file-presentation-box', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-presentation-box.svg'));
    iconRegistry.addSvgIcon('youtube', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/youtube.svg'));
    iconRegistry.addSvgIcon(
      'arrow-right-bold-circle',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/arrow-right-bold-circle.svg'),
    );
    iconRegistry.addSvgIcon(
      'format-list-bulleted-square',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/format-list-bulleted-square.svg'),
    );
    iconRegistry.addSvgIcon('book-open', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/book-open.svg'));
    iconRegistry.addSvgIcon('message-question', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/message-question.svg'));
    iconRegistry.addSvgIcon('email-send-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/email-send-outline.svg'));
    iconRegistry.addSvgIcon('file-document-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-document-outline.svg'));
    iconRegistry.addSvgIcon('calendar-plus', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/calendar-plus.svg'));
    iconRegistry.addSvgIcon('linkedin', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/linkedin.svg'));
    iconRegistry.addSvgIcon('twitter', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/twitter.svg'));
    iconRegistry.addSvgIcon('form-select', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/form-select.svg'));
    iconRegistry.addSvgIcon('instagram', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/instagram.svg'));
    iconRegistry.addSvgIcon('text-box-check', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/text-box-check.svg'));
    iconRegistry.addSvgIcon('pencil-ruler', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/pencil-ruler.svg'));
    iconRegistry.addSvgIcon(
      'message-question-outline',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/message-question-outline.svg'),
    );
    iconRegistry.addSvgIcon('message-plus-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/message-plus-outline.svg'));
    iconRegistry.addSvgIcon('account-sync-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-sync-outline.svg'));
    iconRegistry.addSvgIcon('account-settings', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-settings.svg'));
    iconRegistry.addSvgIcon('cash', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/cash.svg'));
    iconRegistry.addSvgIcon('checkbook', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/checkbook.svg'));
    iconRegistry.addSvgIcon('credit-card', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/credit-card.svg'));
    iconRegistry.addSvgIcon(
      'clipboard-account-outline',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/clipboard-account-outline.svg'),
    );
    iconRegistry.addSvgIcon('calendar-check-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/calendar-check-outline.svg'));
    iconRegistry.addSvgIcon(
      'credit-card-fast-outline',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/credit-card-fast-outline.svg'),
    );
    iconRegistry.addSvgIcon('pencil-ruler', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/pencil-ruler.svg'));
    iconRegistry.addSvgIcon('clipboard-flow', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/clipboard-flow.svg'));
    iconRegistry.addSvgIcon(
      'database-marker-outline',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/database-marker-outline.svg'),
    );
    iconRegistry.addSvgIcon('numeric-positive-1', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/numeric-positive-1.svg'));
    iconRegistry.addSvgIcon('map-legend', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/map-legend.svg'));
    iconRegistry.addSvgIcon('event_note', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/event_note_black_24dp.svg'));
    iconRegistry.addSvgIcon('cash-100', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/cash-100.svg'));
    iconRegistry.addSvgIcon(
      'file-document-alert-outline',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-document-alert-outline.svg'),
    );
    iconRegistry.addSvgIcon('account-school-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-school-outline.svg'));
    iconRegistry.addSvgIcon('account-cash', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-cash.svg'));
    iconRegistry.addSvgIcon(
      'file-document-alert-outline',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-document-alert-outline.svg'),
    );
    iconRegistry.addSvgIcon('account-school-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-school-outline.svg'));
    iconRegistry.addSvgIcon('event_note', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/event_note_black_24dp.svg'));
    iconRegistry.addSvgIcon('cash-100', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/cash-100.svg'));
    iconRegistry.addSvgIcon(
      'account-hard-hat-outline',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-hard-hat-outline.svg'),
    );
    iconRegistry.addSvgIcon('content_paste_search', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/content_paste_search.svg'));
    iconRegistry.addSvgIcon('content-paste-search', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/content-paste-search.svg'));
    iconRegistry.addSvgIcon('folder-alert', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/folder-alert.svg'));
    iconRegistry.addSvgIcon('folder-information', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/folder-information.svg'));
    iconRegistry.addSvgIcon('comment-question', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/comment-question.svg'));
    iconRegistry.addSvgIcon('lightbulb-on', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/lightbulb-on.svg'));
    iconRegistry.addSvgIcon('human-male-board', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/human-male-board.svg'));
    iconRegistry.addSvgIcon('recycle', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/recycle.svg'));
    iconRegistry.addSvgIcon(
      'comment-text-multiple-outline',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/comment-text-multiple-outline.svg'),
    );
    iconRegistry.addSvgIcon(
      'calendar-blank-multiple',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/calendar-blank-multiple.svg'),
    );
    iconRegistry.addSvgIcon('town-hall', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/town-hall.svg'));
    iconRegistry.addSvgIcon(
      'order-numeric-ascending',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/order-numeric-ascending.svg'),
    );
    iconRegistry.addSvgIcon('book-education-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/book-education-outline.svg'));
    iconRegistry.addSvgIcon('file-document-check', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-document-check.svg'));
    iconRegistry.addSvgIcon('account-edit-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-edit-outline.svg'));
    iconRegistry.addSvgIcon('bullseye-arrow', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/bullseye-arrow.svg'));
    iconRegistry.addSvgIcon(
      'file-document-plus-outline',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-document-plus-outline.svg'),
    );
    iconRegistry.addSvgIcon('handshake-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/handshake-outline.svg'));
    iconRegistry.addSvgIcon('counter', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/counter.svg'));
    iconRegistry.addSvgIcon('numeric-10-box', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/numeric-10-box.svg'));
    iconRegistry.addSvgIcon('file-send-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-send-outline.svg'));
    iconRegistry.addSvgIcon(
      'financement-circle-outline',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/financement-circle-outline.svg'),
    );
    iconRegistry.addSvgIcon('eye-off-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/eye-off-outline.svg'));
    iconRegistry.addSvgIcon('account-balance', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/account-balance.svg'));
    iconRegistry.addSvgIcon('note-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/note-outline.svg'));
    iconRegistry.addSvgIcon('file', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file.svg'));
    iconRegistry.addSvgIcon('stamp', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/stamp.svg'));
    iconRegistry.addSvgIcon('email-search.svg', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/email-search.svg'));
    iconRegistry.addSvgIcon('bookmark-plus-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/bookmark-plus-outline.svg'));
    iconRegistry.addSvgIcon('cash-remove', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/cash-remove.svg'));
    iconRegistry.addSvgIcon('file-document-refresh', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-document-refresh.svg'));
    iconRegistry.addSvgIcon('setting-column', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/setting-column.svg'));
    iconRegistry.addSvgIcon('drag_indicator', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/drag_indicator.svg'));
    iconRegistry.addSvgIcon('email-sync', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/email-sync.svg'));
    iconRegistry.addSvgIcon('scale-balance', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/scale-balance.svg'));
    iconRegistry.addSvgIcon('scale-unbalanced', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/scale-unbalanced.svg'));
    iconRegistry.addSvgIcon('ship-wheel', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ship-wheel.svg'));
    iconRegistry.addSvgIcon('file-document-plus-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/file-document-plus-outline.svg'));
    iconRegistry.addSvgIcon('menu-custom', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/menu-custom.svg'));
    iconRegistry.addSvgIcon('script-text-outline', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/script-text-outline.svg'));
    iconRegistry.addSvgIcon('paperclip-plus', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/paperclip-plus.svg'));
  }
}
