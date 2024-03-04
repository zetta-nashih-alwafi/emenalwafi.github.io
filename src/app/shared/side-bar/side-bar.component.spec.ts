import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCommonModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { MenuItems } from 'app/core/menu/menu-items/menu-items';
import { AuthService } from 'app/service/auth-service/auth.service';
import { FileUploadService } from 'app/service/file-upload/file-upload.service';
import { UserService } from 'app/service/user/user.service';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgxPermissionsModule } from 'ngx-permissions';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { SideBarComponent } from './side-bar.component';

describe('SideBarComponent', () => {
  let component: SideBarComponent;
  let fixture: ComponentFixture<SideBarComponent>;
  let image: Blob;
  let file: File;
  let event: Event;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SideBarComponent],
      imports: [
        CommonModule,
        MatIconModule,
        MatDialogModule,
        MatCommonModule,
        MatToolbarModule,
        MatSidenavModule,
        MatProgressSpinnerModule,
        RouterTestingModule,
        ApolloTestingModule,
        PerfectScrollbarModule,
        HttpClientTestingModule,
        NgxPermissionsModule.forRoot(),
        TranslateModule.forRoot({ loader: [{ provide: TranslateLoader, useClass: TranslateFakeLoader }] }),
      ],
      providers: [{ provide: MenuItems, useValue: {} }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    localStorage.setItem('userProfile', JSON.stringify(USER_PROFILE_MOCK_DATA));
    localStorage.setItem('permissions', 'U2FsdGVkX19X3bC8PSQUzndiTWCqfhNt3dnAW5vbb1XcC1kniana6q4nNzHEz/rB');
    image = new Blob(
      ['R0lGODlhDAAMAKIFAF5LAP/zxAAAANyuAP/gaP///wAAAAAAACH5BAEAAAUALAAAAAAMAAwAAAMlWLPcGjDKFYi9lxKBOaGcF35DhWHamZUW0K4mAbiwWtuf0uxFAgA7'],
      { type: 'image/png' },
    );
    file = new File([image], 'smiley.png', { type: 'image/png' });
    event = {
      target: {
        files: [file],
      },
    } as unknown as Event;
    fixture = TestBed.createComponent(SideBarComponent);
    component = fixture.componentInstance;
    component.menuList = new MenuListStub();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture = null;
    component = null;
    image = null;
    file = null;
    event = null;
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should handle file input', () => {
    const fileUploadService = TestBed.get(FileUploadService);
    const userService = TestBed.get(UserService);

    spyOn(fileUploadService, 'singleUpload').and.returnValue(of({ s3_file_name: 'smiley-s3-file-name.png' }));
    spyOn(userService, 'updateUser').and.returnValue(of({ ...USER_PROFILE_MOCK_DATA, profile_picture: 'smiley-s3-file-name.png' }));
    spyOn(localStorage, 'setItem');

    component.handleInputChange(event);
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'userProfile',
      JSON.stringify({ ...USER_PROFILE_MOCK_DATA, profile_picture: 'smiley-s3-file-name.png' }),
    );
  });

  it('should handle file upload unknown error', () => {
    const fileUploadService = TestBed.get(FileUploadService);

    spyOn(fileUploadService, 'singleUpload').and.returnValue(throwError('hello from unit test'));
    spyOn(Swal, 'fire');

    component.handleInputChange(event);
    expect(Swal.fire).toHaveBeenCalledWith({
      type: 'info',
      title: this.translate.instant('SORRY'),
      text: 'hello from unit test',
      confirmButtonText: 'DISCONNECT_SCHOOL.BUTTON3',
    });
  });

  it('should handle user update unknown error', () => {
    const fileUploadService = TestBed.get(FileUploadService);
    const userService = TestBed.get(UserService);

    spyOn(fileUploadService, 'singleUpload').and.returnValue(of({ s3_file_name: 'smiley-s3-file-name.png' }));
    spyOn(userService, 'updateUser').and.returnValue(throwError('hello from unit test'));
    spyOn(Swal, 'fire');

    component.handleInputChange(event);
    expect(Swal.fire).toHaveBeenCalledWith({
      type: 'info',
      title: this.translate.instant('SORRY'),
      text: 'hello from unit test',
      confirmButtonText: 'DISCONNECT_SCHOOL.BUTTON3',
    });
  });

  it('should handle file upload auth error', () => {
    const fileUploadService = TestBed.get(FileUploadService);
    const authService = TestBed.get(AuthService);

    spyOn(fileUploadService, 'singleUpload').and.returnValue(throwError({ message: 'Authorization header is missing' }));
    spyOn(authService, 'handlerSessionExpired');

    component.handleInputChange(event);
    expect(authService.handlerSessionExpired).toHaveBeenCalled();
  });

  it('should handle user update auth error', () => {
    const fileUploadService = TestBed.get(FileUploadService);
    const userService = TestBed.get(UserService);
    const authService = TestBed.get(AuthService);

    spyOn(fileUploadService, 'singleUpload').and.returnValue(of({ s3_file_name: 'smiley-s3-file-name.png' }));
    spyOn(userService, 'updateUser').and.returnValue(throwError({ message: 'Authorization header is missing' }));
    spyOn(authService, 'handlerSessionExpired');

    component.handleInputChange(event);
    expect(authService.handlerSessionExpired).toHaveBeenCalled();
  });

  it('should handle wrong file input', () => {
    const file = new File([], 'asgard.txt', { type: 'text/plain' });
    const event = {
      target: { files: [file] },
    } as unknown as Event;

    spyOn(Swal, 'fire');

    component.handleInputChange(event);
    expect(Swal.fire).toHaveBeenCalledWith({
      type: 'info',
      title: 'UPLOAD_ERROR.WRONG_TYPE_TITLE',
      text: 'UPLOAD_ERROR.WRONG_TYPE_TEXT',
      allowEscapeKey: false,
      allowOutsideClick: false,
      allowEnterKey: false,
    });
  });
});

class MenuListStub {
  getAll = () => MENU_ITEMS_MOCK_DATA;
}

const MENU_ITEMS_MOCK_DATA = [
  {
    state: 'candidates',
    name: 'Admissions',
    type: 'sub',
    icon: 'candidates',
    permissions: 'candidate.show_perm',
    children: [
      { state: 'candidates', name: 'NAV.Follow up FI', icon: 'candidates', permissions: 'candidate.show_perm' },
      { state: 'candidates-fc', name: 'NAV.Follow up FC', icon: 'candidates', permissions: 'candidate.follow_up_continuous.show_perm' },
      {
        state: 'oscar-campus',
        name: 'NAV.CRM Oscar Campus',
        icon: 'account-settings',
        permissions: 'candidate.oscar_campus.show_perm',
      },
      {
        state: 'hubspot',
        name: 'NAV.CRM Hubspot',
        icon: 'account-settings',
        permissions: 'candidate.hubspot.show_perm',
      },
      {
        state: 'dashboard-register',
        name: 'NAV.DASHBOARDS.General',
        icon: 'dashboard',
        permissions: 'candidate.candidate_dashboard.show_perm',
      },
    ],
  },
  {
    state: 'my-internships',
    name: 'My Internships',
    type: 'link',
    icon: 'my-internships',
    permissions: 'my_internship.show_perm',
  },
  {
    state: 'alumni-follow-up',
    name: 'Alumni',
    type: 'sub',
    icon: 'group',
    permissions: 'alumni.show_perm',
    children: [
      { state: 'alumni-follow-up', name: 'NAV.alumni-follow-up', icon: 'group', permissions: 'alumni.follow_up.show_perm' },
      { state: 'alumni-cards', name: 'NAV.alumni-cards', icon: 'group', permissions: 'alumni.card.show_perm' },
    ],
  },
];

const USER_PROFILE_MOCK_DATA = {
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
};
