import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCommonModule, MatButtonModule, MatFormFieldModule, MatAutocompleteModule, MatInputModule, MatTooltipModule, MatSliderModule, MatSelectModule, MAT_DIALOG_DATA, MatDialogRef, MatSlideToggleModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { AuthService } from 'app/service/auth-service/auth.service';
import { NgxPermissionsModule, NgxPermissionsService } from 'ngx-permissions';

import { DocumentTemplateParameterStepComponent } from './document-template-parameter-step.component';

fdescribe('DocumentTemplateParameterStepComponent', () => {
  let component: DocumentTemplateParameterStepComponent;
  let fixture: ComponentFixture<DocumentTemplateParameterStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentTemplateParameterStepComponent ],
      imports: [
        CommonModule,
        MatCommonModule,
        MatButtonModule,
        ApolloTestingModule,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        MatInputModule,
        MatTooltipModule,
        NgxPermissionsModule.forRoot(),
        BrowserAnimationsModule,
        MatSlideToggleModule,
        MatSelectModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [{ provide: AuthService, useClass: AuthServiceStub }],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTemplateParameterStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

export class AuthServiceStub {
  getPermission() {
    return ['operator_dir'];
  }
  getLocalStorageUser() {
    return {
      _id: '5ffec5c2ce635b2fb6a81f2d',
      civility: 'MRS',
      first_name: 'Maeva',
      last_name: 'Mugnier',
      email: 'm.mugnier2@yopmail.com',
      position: null,
      student_id: null,
      office_phone: '',
      direct_line: '',
      portable_phone: '',
      profile_picture: 'POC-Maeva-Mugnier-2-2c010322-3bb7-43e8-81ca-f3133d78b3ac.png',
      is_password_set: true,
      is_registered: true,
      entities: [
        {
          school: null,
          campus: null,
          level: null,
          entity_name: 'operator',
          school_type: null,
          group_of_schools: [],
          group_of_school: null,
          assigned_rncp_title: null,
          class: null,
          type: {
            _id: '5fe98eeadb866c403defdc6b',
            name: 'operator_dir',
          },
        },
      ],
    };
  }
}


