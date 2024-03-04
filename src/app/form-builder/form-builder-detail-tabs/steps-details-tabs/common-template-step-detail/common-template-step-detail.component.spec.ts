import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCommonModule, MatButtonModule, MatTooltipModule, MatIconModule, MatFormFieldModule, MatInputModule, MatExpansionModule, MatCardModule, MatStepperModule, MatSliderModule, MatDialogModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { FormBuilderService } from 'app/form-builder/form-builder.service';
import { AuthService } from 'app/service/auth-service/auth.service';
import { NgxPermissionsModule } from 'ngx-permissions';
import { of } from 'rxjs';

import { CommonTemplateStepDetailComponent } from './common-template-step-detail.component';

describe('CommonTemplateStepDetailComponent', () => {
  let component: CommonTemplateStepDetailComponent;
  let fixture: ComponentFixture<CommonTemplateStepDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommonTemplateStepDetailComponent ],
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
        MatTooltipModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatExpansionModule,
        FormsModule,
        ReactiveFormsModule,
        CKEditorModule,
        MatCardModule,
        NgSelectModule,
        MatStepperModule,
        MatSliderModule,
        DragDropModule,
        MatDialogModule,
        NgxPermissionsModule.forRoot(),
        BrowserAnimationsModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ],
      providers: [{ provide: AuthService, useClass: AuthServiceStub }],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonTemplateStepDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle response from populateStepData', () => {
    const service = TestBed.get(FormBuilderService);
    spyOn(service, 'getOneFormBuilderStep').and.returnValue(of({
      _id: '61bc8aad851a935350ff39c1'
    }));
    component.populateStepData();
    expect(component.isWaitingForResponse).toBeFalsy();
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
