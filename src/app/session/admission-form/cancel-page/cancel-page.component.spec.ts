import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule, MatCommonModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { AuthService } from 'app/service/auth-service/auth.service';

import { CancelPageComponent } from './cancel-page.component';

describe('CancelPageComponent', () => {
  let component: CancelPageComponent;
  let fixture: ComponentFixture<CancelPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelPageComponent ],
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
      ],
      providers: [{ provide: AuthService, useClass: AuthServiceStub }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have current candidate Id', async () => {
    component.ngOnInit();
    expect(component.candidateId).toBeDefined();
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
