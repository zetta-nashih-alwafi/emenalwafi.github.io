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

import { NotificationMessagesKeysTableComponent } from './notification-messages-keys-table.component';

describe('NotificationMessagesKeysTableComponent', () => {
  let component: NotificationMessagesKeysTableComponent;
  let fixture: ComponentFixture<NotificationMessagesKeysTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationMessagesKeysTableComponent],
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
    fixture = TestBed.createComponent(NotificationMessagesKeysTableComponent);
    component = fixture.componentInstance;
    component.stepId = '62947cad1c9a64306dfcb1f7';
    component.templateId = '62947cad1c9a64306dfcb1f9';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call fetchKeysAndPopulateTable when templateType equal alumni', () => {
    component.templateType = 'alumni';
    const result = spyOn(component, 'fetchKeysAndPopulateTableForAlumni');
    component.fetchKeysAndPopulateTable();
    expect(result).toHaveBeenCalled();
  });

  it('after call fetchKeysAndPopulateTable, and templateType was not alumni will make isWaitingForResponse to be false', () => {
    component.fetchKeysAndPopulateTable();
    expect(component.isWaitingForResponse).toEqual(false);
  });
});
