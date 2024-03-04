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

import { NotificationDetailsComponent } from './notification-details.component';

describe('NotificationDetailsComponent', () => {
  let component: NotificationDetailsComponent;
  let fixture: ComponentFixture<NotificationDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationDetailsComponent],
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
    fixture = TestBed.createComponent(NotificationDetailsComponent);
    component = fixture.componentInstance;
    component.refSelected = {
      _id: '6296e12ec3dda72a79f56a2b',
      type: 'notification',
      ref_id: 'NotificationS1_N1',
      form_builder_id: {
        _id: '62947cad1c9a64306dfcb1f9',
        form_builder_name: 'Template Alumni Test',
      },
      step_id: {
        _id: '62947cad1c9a64306dfcb1f7',
        step_title: 'Step Identity Alumnus',
        step_type: 'question_and_field',
      },
      recipient_id: null,
      recipient_cc_id: null,
      signatory_id: null,
      is_include_pdf_this_step: false,
      pdf_attachments: [],
      subject: '',
      body: '',
      first_button: '',
      second_button: '',
      status: 'active',
    };
    fixture.detectChanges();
  });

  afterAll(() => {
    component.isWaitingForResponse = false;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should init form, with ref_id: "NotificationS1_N1", recipient_id, recipient_cc_id, signatory_id, is_include_pdf_this_step, pdf_attachments, subject, body, financial_support_as_cc has value null except is_include_pdf_this_step will has default value false', () => {
    component.initFormDetails();

    expect(component.formDetails.get('ref_id').value).toEqual('NotificationS1_N1');
    expect(component.formDetails.get('recipient_id').value).toEqual(null);
    expect(component.formDetails.get('recipient_cc_id').value).toEqual(null);
    expect(component.formDetails.get('signatory_id').value).toEqual(null);
    expect(component.formDetails.get('is_include_pdf_this_step').value).toEqual(false);
    expect(component.formDetails.get('pdf_attachments').value).toEqual(null);
    expect(component.formDetails.get('subject').value).toEqual(null);
    expect(component.formDetails.get('financial_support_as_cc').value).toEqual(null);
  });

  it('when call patchNotifForm if templateType equal alumni, patchNotifFormForAlumni will called', () => {
    component.templateType = 'alumni';
    const result = spyOn(component, 'patchNotifFormForAlumni');
    component.patchNotifForm();
    expect(result).toHaveBeenCalled();
  });

  it('should detect form changes and return value false', () => {
    component.initFormDetails();
    component.initialData = {
      ref_id: null,
      recipient_id: null,
      recipient_cc_id: null,
      signatory_id: null,
      is_include_pdf_this_step: false,
      pdf_attachments: null,
      subject: null,
      body: null,
      financial_support_as_cc: null,
    };
    component.refSelected = {
      ref_id: 'dummy1',
      recipient_id: 'dummy1',
      recipient_cc_id: 'dummy1',
      signatory_id: 'dummy1',
      is_include_pdf_this_step: false,
      pdf_attachments: null,
      subject: 'dummy1',
      body: 'dummy1',
      financial_support_as_cc: 'dummy1',
    };
    component.formDetails.patchValue(component.refSelected);
    const result = component.isFormUnchanged();
    expect(result).toBe(false);
  });
});
