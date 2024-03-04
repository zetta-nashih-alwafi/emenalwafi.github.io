import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { SharedModule } from 'app/shared/shared.module';
import { NgxPermissionsModule } from 'ngx-permissions';

import { MessagesDetailsComponent } from './messages-details.component';

describe('MessagesDetailsComponent', () => {
  let component: MessagesDetailsComponent;
  let fixture: ComponentFixture<MessagesDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MessagesDetailsComponent],
      imports: [
        CommonModule,
        SharedModule,
        CKEditorModule,
        NgSelectModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        ApolloTestingModule,
        RouterTestingModule,
        NgxPermissionsModule.forRoot(),
        SweetAlert2Module.forRoot(),
        TranslateModule.forRoot({
          loader: [{ provide: TranslateLoader, useClass: TranslateFakeLoader }],
        }),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessagesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should init form and have ref_id, body, first_button and second_button and has value empty string / null', () => {
    component.initForm();
    expect(component.messageForm.get('ref_id').value).toEqual('');
    expect(component.messageForm.get('body').value).toEqual('');
    expect(component.messageForm.get('first_button').value).toEqual('');
    expect(component.messageForm.get('second_button').value).toEqual('');
  });

  it('should patch form and have ref_id, body, first_button and second_button and has value same like dummy', () => {
    component.initForm();
    component.refSelected = {
      ref_id: 'dummy ref id',
      body: 'dummy body',
      first_button: 'dummy first button',
      second_button: 'dummy second button',
    };
    component.patchNotifForm();
    expect(component.messageForm.get('ref_id').value).toEqual('dummy ref id');
    expect(component.messageForm.get('body').value).toEqual('dummy body');
    expect(component.messageForm.get('first_button').value).toEqual('dummy first button');
    expect(component.messageForm.get('second_button').value).toEqual('dummy second button');
  });

  it('should detect form changes and return value false', () => {
    component.initForm();
    component.initialData = {
      ref_id: '',
      body: '',
      first_button: '',
      second_button: '',
    };
    component.refSelected = {
      ref_id: 'dummy ref id',
      body: 'dummy body',
      first_button: 'dummy first button',
      second_button: 'dummy second button',
    };
    component.messageForm.patchValue(component.refSelected);
    const result = component.isFormUnchanged();
    expect(result).toBe(false);
  });

  it('should detect form if invalid will return true', () => {
    component.messageForm.setErrors({ incorrect: true });
    const result = component.messageForm.invalid;
    expect(result).toBe(true);
  });
});
