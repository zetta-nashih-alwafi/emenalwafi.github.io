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
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { AuthService } from 'app/service/auth-service/auth.service';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { SetPasswordV2Component } from './set-passwordV2.component';

describe('SetPasswordV2Component', () => {
  let component: SetPasswordV2Component;
  let fixture: ComponentFixture<SetPasswordV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SetPasswordV2Component],
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
    fixture = TestBed.createComponent(SetPasswordV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture = null;
    component = null;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('password should be filled', () => {
    const password = 'MW98U};xdfb(';
    const control = component.setPasswordForm.get('password');
    component.setPasswordForm.patchValue({ password });
    expect(control.value).toBe(password);
  });

  it('should display error required if password is filled then cleared', () => {
    const password = 'MW98U};xdfb(';
    component.setPasswordForm.patchValue({ password });
    expect(component.setPasswordForm.get('password').value).toBe(password);

    component.setPasswordForm.patchValue({ password: '' });
    expect(component.setPasswordForm.valid).toBeFalsy();
  });

  it('confirmation should be filled', () => {
    const confirmPassword = 'MW98U};xdfb(';
    const control = component.setPasswordForm.get('confirmPassword');
    component.setPasswordForm.patchValue({ confirmPassword });
    expect(control.value).toBe(confirmPassword);
  });

  it('should return true if password and confirmation has the same value', () => {
    component.setPasswordForm.patchValue({
      password: 'MW98U};xdfb(',
      confirmPassword: 'MW98U};xdfb(',
    });
    expect(component.setPasswordForm.get('password').value).toBe(component.setPasswordForm.get('confirmPassword').value);
  });

  it('should return false if password and confirmation has no same value', () => {
    component.setPasswordForm.patchValue({
      password: 'MW98U};xdfb(',
      confirmPassword: 'Asd123()',
    });
    expect(component.setPasswordForm.get('password').value).not.toBe(component.setPasswordForm.get('confirmPassword').value);
  });

  it('should display correct swal if forgot password is true', () => {
    const authService = TestBed.get(AuthService);
    spyOn(Swal, 'fire');
    spyOn(authService, 'setPassword').and.returnValue(of({ SetPassword: { email: 'testemail@yopmail.uwu' } }));
    component.isForgotPassword = true;
    component.setPasswordForm.patchValue({
      password: 'MW98U};xdfb(',
      confirmPassword: 'MW98U};xdfb(',
    });
    component.send();
    expect(Swal.fire).toHaveBeenCalledWith({
      type: 'success',
      title: 'USER_S1.TITLE',
      text: 'USER_S1.TEXT',
      showConfirmButton: true,
      confirmButtonText: 'USER_S1.BUTTON',
      allowOutsideClick: false,
    });
  });

  it('should display correct swal if forgot password is false', () => {
    const authService = TestBed.get(AuthService);
    spyOn(Swal, 'fire');
    spyOn(authService, 'setPassword').and.returnValue(of({ SetPassword: { email: 'testemail@yopmail.uwu' } }));
    component.setPasswordForm.patchValue({
      password: 'MW98U};xdfb(',
      confirmPassword: 'MW98U};xdfb(',
    });
    component.send();
    expect(Swal.fire).toHaveBeenCalledWith({
      type: 'success',
      title: 'USER_S4.TITLE',
      text: 'USER_S4.TEXT',
      showConfirmButton: true,
      confirmButtonText: 'USER_S4.BUTTON',
      allowOutsideClick: false,
    });
  });

  it('should display swal error if the backend throws an error', () => {
    const authService = TestBed.get(AuthService);
    spyOn(Swal, 'fire');
    spyOn(authService, 'setPassword').and.returnValue(throwError(new Error('unit testing fake error message')));
    component.setPasswordForm.patchValue({
      password: 'MW98U};xdfb(',
      confirmPassword: 'MW98U};xdfb(',
    });
    component.send();
    expect(Swal.fire).toHaveBeenCalledWith({
      type: 'info',
      allowOutsideClick: false,
      title: 'USER_S2.TITLE',
      text: 'USER_S2.TEXT',
      showConfirmButton: true,
      confirmButtonText: 'USER_S1.BUTTON',
    });
  });
});
