import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
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
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { NgxCaptchaModule } from 'ngx-captcha';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { ValidationMessageComponent } from './validation-message.component';
import { By } from '@angular/platform-browser';

describe('ValidationMessageComponent', () => {
  let component: ValidationMessageComponent;
  let fixture: ComponentFixture<ValidationMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ValidationMessageComponent],
      imports: [CommonModule, NoopAnimationsModule],
      providers: [],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidationMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct key', () => {
    const obj = {
      key_one: 'value_one',
      key_two: 'value_two',
    };
    const key = component.getFirstKey(obj);
    expect(key).toBe('key_one');
  });

  it('should not return the second key', () => {
    const obj = {
      key_one: 'value_one',
      key_two: 'value_two',
    };
    const key = component.getFirstKey(obj);
    expect(key).not.toBe('key_two');
  });

  it('should return null', () => {
    const obj = {};
    const key = component.getFirstKey(obj);
    expect(key).toBe(null);
  });
  it('input messages not empty', () => {
    component.messages = {email:'test@yopmail.com'}
    expect(component.messages.email).toBe('test@yopmail.com')
  });
});
