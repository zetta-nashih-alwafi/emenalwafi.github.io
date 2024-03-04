import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatCommonModule,
  MatFormFieldModule,
  MatInputModule,
  MatProgressSpinnerModule,
} from '@angular/material';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { AuthService } from 'app/service/auth-service/auth.service';
import { NgxCaptchaModule } from 'ngx-captcha';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

import { ForgotPasswordV2Component } from './forgot-passwordV2.component';

describe('ForgotPasswordV2Component', () => {
  let component: ForgotPasswordV2Component;
  let fixture: ComponentFixture<ForgotPasswordV2Component>;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ForgotPasswordV2Component],
      imports: [
        CommonModule,
        MatCommonModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatButtonModule,
        NoopAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        SlickCarouselModule,
        ApolloTestingModule,
        HttpClientTestingModule,
        RouterTestingModule,
        NgxCaptchaModule,
        NgxPermissionsModule.forRoot(),
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
      ],
      providers: [],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotPasswordV2Component);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    setTimeout(() => {
      fixture.detectChanges();
    }, 2000);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('email should be filled', async () => {
    const email = 'testemail@yopmail.uwu';
    component.email = email;
    fixture.detectChanges();
    await fixture.whenStable();
    const el = de.query(By.css('input[name=email]'));
    expect(el.nativeElement.value).toBe(email);
  });

  it('should show a swal error for forgot password can only be sent one time in a day', async () => {
    const authService = TestBed.get(AuthService);
    spyOn(Swal, 'fire');
    spyOn(authService, 'resetPasswordV2').and.returnValue(
      of({
        errors: [
          {
            message: 'Forgot password can only be sent one time in a day',
          },
        ],
      }),
    );
    component.send({ email: 'testemail@yopmail.uwu' });
    expect(Swal.fire).toHaveBeenCalledWith({
      allowOutsideClick: false,
      type: 'info',
      title: 'FORGOT_PASSWORD_ONCE_A_DAY.TITLE',
      text: 'FORGOT_PASSWORD_ONCE_A_DAY.MESSAGE',
      showConfirmButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      confirmButtonText: 'FORGOT_PASSWORD_ONCE_A_DAY.BUTTON',
    });
  });

  it('should show a correct swal when got success response from the backend', async () => {
    const authService = TestBed.get(AuthService);
    spyOn(Swal, 'fire');
    spyOn(authService, 'resetPasswordV2').and.returnValue(
      of({
        data: { ok: true },
      }),
    );
    component.send({ email: 'testemail@yopmail.uwu' });
    expect(Swal.fire).toHaveBeenCalledWith({
      type: 'info',
      title: 'USER_S4B.TITLE',
      html: 'USER_S4B.TEXT',
      allowOutsideClick: false,
      showConfirmButton: true,
      confirmButtonText: 'USER_S4B.BUTTON',
    });
  });

  it('should show a swal for invalid email', async () => {
    const authService = TestBed.get(AuthService);
    spyOn(Swal, 'fire');
    spyOn(authService, 'resetPasswordV2').and.returnValue(of({}));
    component.send({ email: 'testemail@yopmail.uwu' });
    expect(Swal.fire).toHaveBeenCalledWith({
      allowOutsideClick: false,
      type: 'info',
      title: 'FORGOT_PASSWORD.TITLE',
      text: 'FORGOT_PASSWORD.MESSAGE',
      showConfirmButton: true,
      allowEnterKey: false,
      allowEscapeKey: false,
      confirmButtonText: 'FORGOT_PASSWORD.BUTTON',
    });
  });
});
