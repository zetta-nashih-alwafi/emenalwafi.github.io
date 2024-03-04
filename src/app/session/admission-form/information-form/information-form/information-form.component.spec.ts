import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatButtonModule, MatCommonModule, MatDatepickerModule, MatNativeDateModule, MatRadioModule, MatTooltipModule } from '@angular/material';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { AuthService } from 'app/service/auth-service/auth.service';

import { InformationFormComponent } from './information-form.component';

describe('InformationFormComponent', () => {
  let component: InformationFormComponent;
  let fixture: ComponentFixture<InformationFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformationFormComponent ],
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
        MatTooltipModule,
        MatAutocompleteModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatMomentDateModule,
        MatRadioModule,
      ],
      providers: [
        { provide: AuthService, useClass: AuthServiceStub }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformationFormComponent);
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
