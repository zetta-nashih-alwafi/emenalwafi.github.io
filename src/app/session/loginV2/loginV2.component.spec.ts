import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from 'app/shared/shared.module';
import { NgxCaptchaModule } from 'ngx-captcha';
import { AdmissionFormComponent } from '../admission-form/admission-form.component';
import { CancelPageComponent } from '../admission-form/cancel-page/cancel-page.component';
import { SuccessPageComponent } from '../admission-form/success-page/success-page.component';
import { ForgotPasswordV2Component } from '../forgot-passwordV2/forgot-passwordV2.component';
import { LockScreenV2Component } from '../lockscreenV2/lockscreenV2.component';
import { SessionRoutingModule } from '../session.routing';
import { SetPasswordV2Component } from '../set-passwordV2/set-passwordV2.component';
import { LoginV2Component } from './loginV2.component';

import { RouterTestingModule } from '@angular/router/testing';
import { ApolloTestingModule, ApolloTestingController } from 'apollo-angular/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NgxPermissionsModule } from 'ngx-permissions';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule } from '@angular/material';
import { AuthService } from 'app/service/auth-service/auth.service';
import { Observable, of } from 'rxjs';
import { UserService } from 'app/service/user/user.service';

class MockAuthService extends AuthService {
  loginUser(email: string, password: string): Observable<any> {
    return of({
      data: {
        Login: {
          token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZmZlYzVjMmNlNjM1YjJmYjZhODFmMmQiLCJlbWFpbCI6Im0ubXVnbmllcjJAeW9wbWFpbC5jb20iLCJpYXQiOjE2NTI4NTUwMjUsImV4cCI6MTY1Mjk0MTQyNX0.9xgfOC_gNGTGbFNHcOhbMmRKlmmGuefbFdYJSCiZzPA',
          user: {
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
                  usertype_permission_id: {
                    _id: '5fe98eebdb866c403defdc6f',
                    user_type_name: 'operator_dir',
                    status: 'active',
                    companies: {
                      show_perm: true,
                      edit_perm: true,
                      add_company: false,
                      delete_perm: false,
                      organization: {
                        show_perm: true,
                        add_organization: {
                          show_perm: true,
                        },
                        edit_organization: {
                          show_perm: true,
                        },
                        delete_organization: {
                          show_perm: true,
                        },
                        organization_details: {
                          show_perm: true,
                        },
                        contact: {
                          show_perm: true,
                          add_contact: {
                            show_perm: true,
                          },
                          edit_contact: {
                            show_perm: true,
                          },
                          delete_contact: {
                            show_perm: true,
                          },
                        },
                      },
                      company_details: {
                        company_detail: {
                          show_perm: false,
                          revision_perm: false,
                          edit_perm: false,
                        },
                        company_staff: {
                          show_perm: false,
                          edit_perm: false,
                          add_perm: false,
                          actions: {
                            edit_perm: false,
                            send_email: false,
                            delete_perm: false,
                          },
                        },
                        connected_school: {
                          show_perm: false,
                          edit_perm: false,
                          connect_school: false,
                          actions: {
                            connect_mentor_to_School: false,
                            delete_perm: false,
                          },
                        },
                      },
                      company_entity: {
                        show_perm: true,
                        edit_perm: true,
                        edit_company: {
                          show_perm: true,
                          edit_perm: true,
                        },
                        add_company: {
                          show_perm: true,
                          edit_perm: true,
                        },
                        history_company: {
                          show_perm: true,
                          edit_perm: true,
                        },
                        note_company: {
                          show_perm: true,
                          edit_perm: true,
                        },
                        member_company: {
                          show_perm: true,
                          edit_perm: true,
                        },
                        branch_company: {
                          show_perm: true,
                          edit_perm: true,
                        },
                        internship_company: {
                          show_perm: true,
                          edit_perm: true,
                        },
                        connect_school: {
                          show_perm: true,
                          edit_perm: true,
                        },
                      },
                      company_branch: {
                        show_perm: true,
                        edit_perm: true,
                        edit_company: {
                          show_perm: true,
                          edit_perm: true,
                        },
                        add_company: {
                          show_perm: true,
                          edit_perm: true,
                        },
                        history_company: {
                          show_perm: true,
                        },
                        note_company: {
                          show_perm: true,
                          edit_perm: true,
                        },
                        member_company: {
                          show_perm: true,
                          edit_perm: true,
                        },
                        branch_company: {
                          show_perm: true,
                          edit_perm: true,
                        },
                        internship_company: {
                          show_perm: true,
                          edit_perm: true,
                        },
                        connect_school: {
                          show_perm: true,
                          edit_perm: true,
                        },
                      },
                      mentors: {
                        show_perm: true,
                      },
                    },
                    tasks: {
                      show_perm: true,
                      add_task: true,
                      internal_task: null,
                      add_test_task: null,
                      actions: {
                        delete_task: true,
                        edit_perm: true,
                      },
                    },
                    mailbox: {
                      show_perm: true,
                      edit_perm: true,
                      inbox: true,
                      sent: true,
                      important: true,
                      draft: true,
                      trash: true,
                      actions: {
                        download_email: true,
                        urgent_message: true,
                        mail_to_group: true,
                        compose: true,
                        important: true,
                        delete: true,
                      },
                    },
                    users: {
                      show_perm: true,
                      edit_perm: true,
                      add_perm: true,
                      export: true,
                      transfer_responsibility: true,
                      actions: {
                        incognito: true,
                        error_email: true,
                        delete_perm: true,
                        edit_perm: true,
                        send_email: true,
                        reminder_reg_user: true,
                        btn_transfer_another_dev: true,
                        btn_transfer_another_program: true,
                        btn_view_student_card: true,
                        btn_view_admission_file: true,
                        btn_resend_registration_email: true,
                      },
                    },
                    tutorials: {
                      show_perm: false,
                      edit_perm: false,
                      tutorial_table: false,
                      add_perm: false,
                      actions: {
                        view_perm: true,
                        edit_perm: true,
                        delete_perm: true,
                        send: true,
                      },
                      inapp_tutorials: {
                        show_perm: true,
                        edit_perm: true,
                      },
                    },
                    candidate: {
                      candidate_tab: {
                        show_perm: true,
                        edit_perm: true,
                        connect_as: true,
                      },
                      candidate_history: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      admission_member: {
                        show_perm: false,
                        edit_perm: false,
                      },
                      mentor: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      my_note: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      oscar_campus: {
                        show_perm: true,
                        edit_perm: true,
                        oscar_import_button: {
                          show_perm: true,
                          edit_perm: null,
                        },
                        hubspot_import_button: {
                          show_perm: false,
                          edit_perm: null,
                        },
                        actions: {
                          btn_import: true,
                          btn_assign_program: true,
                          btn_get_oscar_student: true,
                          btn_export: true,
                          btn_reset: true,
                        },
                      },
                      hubspot: {
                        show_perm: true,
                        edit_perm: true,
                        oscar_import_button: {
                          show_perm: false,
                          edit_perm: null,
                        },
                        hubspot_import_button: {
                          show_perm: true,
                        },
                        actions: {
                          btn_assign_program: true,
                          btn_get_hubspot_student: true,
                          btn_export: true,
                          btn_reset: true,
                        },
                      },
                      follow_up_continuous: {
                        show_perm: true,
                      },
                      show_perm: true,
                      edit_perm: true,
                      actions: {
                        report_inscription: {
                          show_perm: false,
                        },
                        btn_crm_ok: true,
                        btn_assign_registration_profile: true,
                        btn_1st_call_done: true,
                        btn_1st_email_of_annoucment: true,
                        btn_transfer_to_another_dev_multiple: true,
                        btn_send_email_multiple: true,
                        btn_export_csv: true,
                        btn_reset: true,
                        btn_send_email: true,
                        btn_transfer_another_program: true,
                        btn_view_student_card: true,
                        btn_view_admission_file: true,
                      },
                      candidate_dashboard: {
                        show_perm: true,
                        edit_perm: true,
                      },
                    },
                    intake_channel: {
                      intake_channel: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      scholar_season: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      school: {
                        show_perm: true,
                        edit_perm: true,
                        actions: {
                          btn_delete_school: true,
                          btn_edit_school: true,
                          btn_add_school: true,
                          btn_export_csv: true,
                          btn_reset: true,
                        },
                      },
                      level: {
                        show_perm: true,
                        edit_perm: true,
                        actions: {
                          btn_edit: true,
                          btn_delete: true,
                        },
                      },
                      site: {
                        show_perm: true,
                        edit_perm: true,
                        actions: {
                          btn_edit: true,
                          btn_delete: true,
                        },
                      },
                      campus: {
                        show_perm: true,
                        edit_perm: true,
                        actions: {
                          btn_pin: true,
                          btn_edit: true,
                          btn_delete: true,
                        },
                      },
                      sector: {
                        show_perm: true,
                        edit_perm: true,
                        actions: {
                          btn_edit_sector: true,
                          btn_delete_sector: true,
                          btn_add_sector: true,
                          btn_export_csv: true,
                        },
                      },
                      full_rate: {
                        show_perm: true,
                        edit_perm: true,
                        actions: {
                          btn_edit_mode: true,
                          btn_import: true,
                          btn_export: true,
                        },
                      },
                      speciality: {
                        show_perm: true,
                        edit_perm: true,
                        actions: {
                          btn_delete_speciality: true,
                          btn_edit_speciality: true,
                          btn_add_speciality: true,
                          btn_export_csv: true,
                          btn_reset: true,
                        },
                      },
                      payment_terms: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      pricing_profile: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      show_perm: true,
                      edit_perm: true,
                      setting: {
                        show_perm: true,
                        edit_perm: true,
                        additional_expense: {
                          show_perm: true,
                          edit_perm: true,
                          actions: {
                            btn_add_additional_expense: true,
                            btn_export_additional_expense: true,
                            btn_edit_additional_expense: true,
                            btn_delete_additional_expense: true,
                          },
                        },
                      },
                    },
                    setting: {
                      user_permission: {
                        show_perm: true,
                      },
                      import_objective: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      import_objective_finance: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      import_finance_n1: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      external_promotion: {
                        show_perm: true,
                        edit_perm: true,
                        actions: {
                          btn_delete_diapos_external: true,
                          btn_edit_diapos_external: true,
                          btn_add_diapos_external: true,
                          btn_view_diapos_external: true,
                          btn_send_email: true,
                          btn_duplicate_diapos_external: true,
                          btn_publish_diapos_external: true,
                          btn_export_csv: true,
                          btn_reset: true,
                        },
                      },
                      message_step: {
                        show_perm: true,
                        edit_perm: true,
                        actions: {
                          btn_delete_message_step: true,
                          btn_edit_message_step: true,
                          btn_add_message_step: true,
                          btn_view_message_step: true,
                          btn_send_email: true,
                          btn_duplicate_message_step: true,
                          btn_publish_message_step: true,
                          btn_export_csv: true,
                          btn_reset: true,
                        },
                      },
                      cels_segmentation: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      cels_action: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      notification_management: {
                        show_perm: true,
                        edit_perm: true,
                        actions: {
                          btn_edit_notification: true,
                          btn_reset: true,
                          btn_delete_template: true,
                          btn_edit_template: true,
                          btn_add_template: true,
                          btn_view_template: true,
                          btn_reset_template: true,
                        },
                      },
                      show_perm: true,
                      edit_perm: true,
                    },
                    history: {
                      notifications: {
                        show_perm: true,
                      },
                      show_perm: true,
                    },
                    finance: {
                      timeline_template: {
                        show_perm: true,
                        create_timeline_template: {
                          show_perm: true,
                        },
                        edit_timeline_template: {
                          show_perm: true,
                        },
                        delete_timeline_template: {
                          show_perm: true,
                        },
                      },
                      general: {
                        show_perm: false,
                        edit_perm: false,
                      },
                      cash_in: {
                        show_perm: false,
                        edit_perm: false,
                      },
                      payment: {
                        show_perm: false,
                        edit_perm: false,
                      },
                      follow_up: {
                        show_perm: true,
                        edit_perm: true,
                        actions: {
                          btn_send_email: true,
                          btn_export: true,
                          btn_reset: true,
                        },
                      },
                      member: {
                        show_perm: false,
                        edit_perm: false,
                      },
                      history: {
                        show_perm: true,
                        edit_perm: true,
                        actions: {
                          btn_reconciliation: true,
                          btn_lettrage: true,
                          btn_see_student_file: true,
                          btn_create_internal_task: true,
                          btn_send_email: true,
                          btn_export_csv: true,
                          btn_reset: true,
                        },
                      },
                      reconciliation_letterage: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      cheque: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      transaction_report: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      balance_report: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      follow_up_organization: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      show_perm: true,
                      edit_perm: true,
                    },
                    alumni: {
                      follow_up: {
                        show_perm: true,
                        edit_perm: true,
                        actions: {
                          btn_export: true,
                          btn_send_survey: true,
                          btn_reset: true,
                        },
                      },
                      member: {
                        show_perm: false,
                        edit_perm: false,
                      },
                      card: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      trombinoscope: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      show_perm: true,
                      edit_perm: true,
                    },
                    internship: {
                      internship_posting: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      internship_profile: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      candidature: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      agreement: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      show_perm: true,
                      follow_up: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      setting: {
                        show_perm: true,
                      },
                      user: {
                        show_perm: true,
                      },
                      edit_perm: true,
                    },
                    contracts: {
                      show_perm: true,
                      edit_perm: true,
                      contract_process: {
                        show_perm: true,
                        edit_perm: true,
                        actions: {
                          btn_send_the_form: true,
                          btn_template_for_import: true,
                          btn_import_contract: true,
                          btn_new_contract: true,
                          btn_reset: true,
                        },
                      },
                      contract_template: {
                        show_perm: true,
                        actions: {
                          btn_contract_template_detail: true,
                          btn_reset: true,
                        },
                      },
                    },
                    process: {
                      show_perm: true,
                      edit_perm: true,
                      form_builder: {
                        show_perm: true,
                        edit_perm: true,
                      },
                      alumni_survey: {
                        show_perm: true,
                        edit_perm: true,
                      },
                    },
                    courses_sequences: {
                      show_perm: true,
                      edit_perm: true,
                      btn_export: null,
                      btn_reset: null,
                      btn_add_subject: null,
                    },
                  },
                },
              },
            ],
          },
        },
      },
    });
  }
}

describe('LoginV2Component', () => {
  let component: LoginV2Component;
  let fixture: ComponentFixture<LoginV2Component>;
  let spy: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        LoginV2Component,
        SetPasswordV2Component,
        ForgotPasswordV2Component,
        LockScreenV2Component,
        AdmissionFormComponent,
        SuccessPageComponent,
        CancelPageComponent,
      ],
      imports: [
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
        NgxPermissionsModule.forRoot(),
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        ApolloTestingModule,
        RouterTestingModule,
        NoopAnimationsModule,
        SlickCarouselModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatCheckboxModule,
        NgxCaptchaModule,
        NgSelectModule,
        MatIconModule,
      ],
      providers: [{ provide: AuthService, useClass: MockAuthService }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture = null;
    component = null;
    spy = null;
    localStorage.clear();
  });

  it('should be exist in the world', () => {
    expect(component).toBeDefined();
  });

  it('email should be filled', async(() => {
    const email = 'm.mugnier2@yopmail.com';
    component.email = email;
    fixture.detectChanges();
    expect(component.email).toBe(email);
    expect(component.isEmailInvalid).toBeFalsy();
  }));

  it('password should be filled', async(() => {
    const password = 'MW98U};xdfb(';
    component.password = password;
    fixture.detectChanges();
    expect(component.password).toBe(password);
  }));

  it('should be uwu', async(() => {
    const userService = TestBed.get(UserService);
    spyOn(window, 'open');
    spyOn(userService, 'getUserEntities').and.returnValue(
      of({
        email: 'm.mugnier2@yopmail.com',
        entities: [
          {
            entity_name: 'operator',
            school_type: null,
            group_of_schools: [],
            school: null,
            assigned_rncp_title: null,
            class: null,
            type: {
              _id: '5fe98eeadb866c403defdc6b',
              name: 'operator_dir',
            },
          },
        ],
      }),
    );
    component.email = 'm.mugnier2@yopmail.com';
    component.password = 'MW98U};xdfb(';
    component.login({
      email: component.email,
      password: component.password,
    });
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      expect(localStorage.getItem('userProfile')).toBeDefined('userProfile in local storage is still not defined');
      expect(window.open).toHaveBeenCalled();
    });
  }));

  it('should display entities selection when user with multiple entities log in', async(() => {
    const service = TestBed.get(UserService);
    const de: DebugElement = fixture.debugElement;
    const emailInput: HTMLInputElement = de.query(By.css('input[name=email]')).nativeElement;

    spy = spyOn(service, 'getUserEntities').and.returnValue(
      of({
        email: 'n.horlacher@yopmail.com',
        entities: [
          {
            entity_name: 'admission',
            school_type: null,
            group_of_schools: [],
            school: {
              _id: '5fe998070719bc42c65d30e4',
            },
            assigned_rncp_title: null,
            class: null,
            type: {
              _id: '617f64ec5a48fe2228518811',
              name: 'Admission Member',
            },
          },
          {
            entity_name: 'admission',
            school_type: null,
            group_of_schools: [],
            school: {
              _id: '5ffbe03cc93fb37c75f8ea77',
            },
            assigned_rncp_title: null,
            class: null,
            type: {
              _id: '617f64ec5a48fe2228518811',
              name: 'Admission Member',
            },
          },
          {
            entity_name: 'operator',
            school_type: null,
            group_of_schools: [],
            school: null,
            assigned_rncp_title: null,
            class: null,
            type: {
              _id: '6009066808ed8724f5a54836',
              name: 'operator_admin',
            },
          },
        ],
      }),
    );
    component.email = 'n.horlacher@yopmail.com';
    component.password = 'MW98U};xdfb(';
    emailInput.dispatchEvent(new Event('keyup'));
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const select = de.query(By.css('#entities-selection'));
      expect(select).toBeTruthy();
    });
  }));

  it('should display user types selection when user with multiple entities log in', async(() => {
    const service = TestBed.get(UserService);
    const de: DebugElement = fixture.debugElement;
    const emailInput: HTMLInputElement = de.query(By.css('input[name=email]')).nativeElement;

    spyOn(service, 'getUserEntities').and.returnValue(
      of({
        email: 'n.horlacher@yopmail.com',
        entities: [
          {
            entity_name: 'admission',
            school_type: null,
            group_of_schools: [],
            school: {
              _id: '5fe998070719bc42c65d30e4',
            },
            assigned_rncp_title: null,
            class: null,
            type: {
              _id: '617f64ec5a48fe2228518811',
              name: 'Admission Member',
            },
          },
          {
            entity_name: 'admission',
            school_type: null,
            group_of_schools: [],
            school: {
              _id: '5ffbe03cc93fb37c75f8ea77',
            },
            assigned_rncp_title: null,
            class: null,
            type: {
              _id: '617f64ec5a48fe2228518811',
              name: 'Admission Member',
            },
          },
          {
            entity_name: 'operator',
            school_type: null,
            group_of_schools: [],
            school: null,
            assigned_rncp_title: null,
            class: null,
            type: {
              _id: '6009066808ed8724f5a54836',
              name: 'operator_admin',
            },
          },
        ],
      }),
    );
    component.email = 'n.horlacher@yopmail.com';
    component.password = 'MW98U};xdfb(';
    emailInput.dispatchEvent(new Event('keyup'));
    component.setEntityChecked('operator');
    fixture.whenStable().then(() => {
      fixture.detectChanges();
      const select = de.query(By.css('#user-types-selection'));
      expect(select).toBeTruthy();
    });
  }));
});
