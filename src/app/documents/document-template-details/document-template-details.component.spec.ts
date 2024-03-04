import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCommonModule, MatButtonModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { PageTitleService } from 'app/core/page-title/page-title.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { DocumentIntakeBuilderService } from 'app/service/document-intake-builder/document-intake-builder.service';
import { of } from 'rxjs';

import { DocumentTemplateDetailsComponent } from './document-template-details.component';

describe('DocumentTemplateDetailsComponent', () => {
  let component: DocumentTemplateDetailsComponent;
  let fixture: ComponentFixture<DocumentTemplateDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentTemplateDetailsComponent ],
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
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [{ provide: AuthService, useClass: AuthServiceStub }, PageTitleService],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentTemplateDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle response from isDocumentTemplateSaved', () => {
    const service = TestBed.get(DocumentIntakeBuilderService);
    spyOn(service, 'isDocumentTemplateSaved').and.returnValue(of({
      _id: '61bc8aad851a935350ff39c1'
    }));
    component.getTemplateData();
    expect(component.isDocumentTemplateSaved).toBeDefined();
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

