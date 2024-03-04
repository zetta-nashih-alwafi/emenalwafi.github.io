import { Injectable } from '@angular/core';

export interface ChildrenItems {
  state: string;
  name: string;
  type?: string;
  icon?: string;
}

export interface Menu {
  state: string;
  name: string;
  type: string;
  icon?: string;
  children?: ChildrenItems[];
}

const MENUITEMS = [
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
        state: 'contract-follow-up',
        name: 'Follow up Contract/Convention',
        icon: 'candidates',
        permissions: 'candidate.follow_up_contract.show_perm',
      },
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
    state: 'assignment',
    name: 'NAV.Re-Admission',
    type: 'sub',
    icon: 'readmission',
    permissions: 'readmission.show_perm',
    children: [
      {
        state: 'assignment',
        name: 'NAV.Assignment',
        icon: 'pencil-ruler',
        permissions: 'readmission.assignment.show_perm',
      },
      {
        state: 'follow-up',
        name: 'NAV.Follow up',
        icon: 'candidates',
        permissions: 'readmission.follow_up.show_perm',
      },
    ],
  },
  {
    state: 'students-table',
    name: 'NAV.Students',
    type: 'sub',
    icon: 'school',
    permissions: 'students.show_perm',
    children: [
      { state: 'students-table', name: 'NAV.STUDENT.Registered', icon: 'account-arrow-right', permissions: 'students.follow_up.show_perm' },
      { state: 'all-students', name: 'NAV.STUDENT.All students', icon: 'groups', permissions: 'students.all_students.show_perm' },
      {
        state: 'students-trombinoscope',
        name: 'NAV.STUDENT.Trombinoscope',
        icon: 'account-box',
        permissions: 'students.trombinoscope.show_perm',
      },
    ],
  },
  {
    state: 'finance-follow-up',
    name: 'Finance',
    type: 'sub',
    icon: 'euro',
    permissions: 'finance.show_perm',
    children: [
      // { state: 'dashboard-finance', name: 'NAV.DASHBOARDS.General', icon: 'dashboard', permissions: 'finance.general.show_perm' },
      // { state: 'dashboard-cash-flow', name: 'NAV.FINANCE.Cash In', icon: 'dashboard', permissions: 'finance.cash_in.show_perm' },
      // { state: 'dashboard-payment', name: 'NAV.FINANCE.Comparative', icon: 'dashboard', permissions: 'finance.payment.show_perm' },
      { state: 'finance-follow-up', name: 'NAV.FINANCE.Follow Up', icon: 'euro', permissions: 'finance.follow_up.show_perm' },
      {
        state: 'finance-follow-up-organization',
        name: 'NAV.FINANCE.Follow Up Organization',
        icon: 'euro',
        permissions: 'finance.follow_up_organization.show_perm',
      },
      {
        state: 'operation-lines',
        name: 'NAV.FINANCE.Operations Lines',
        icon: 'operation-lines',
        permissions: 'finance.operation_lines.show_perm',
      },
      {
        state: 'unbalanced-balance',
        name: 'NAV.FINANCE.Unbalanced Balance',
        icon: 'unbalanced-balance',
        permissions: 'finance.unbalanced_balance.show_perm',
      },
      {
        state: 'finance-import',
        name: 'NAV.FINANCE.Reconciliation and Lettrage',
        icon: 'export',
        permissions: 'finance.reconciliation_letterage.show_perm',
      },
      { state: 'cheque-transaction', name: 'NAV.FINANCE.Check', icon: 'euro', permissions: 'finance.cheque.show_perm' },
      {
        state: 'timeline-template',
        name: 'NAV.FINANCE.Timeline template',
        icon: 'event_busy',
        // permissions: 'finance.follow_up_organization.show_perm',
        permissions: 'finance.timeline_template.show_perm',
      },
      { state: 'transaction-report', name: 'NAV.Transaction', icon: 'euro', permissions: 'finance.transaction_report.show_perm' },
      {
        state: 'master-transaction',
        name: 'NAV.Master Transaction',
        icon: 'euro',
        permissions: 'finance.master_table_transaction.show_perm',
      },
      { state: 'balance-report', name: 'NAV.Balance Report', icon: 'euro', permissions: 'finance.balance_report.show_perm' },
    ],
  },
  {
    state: 'teacher-management',
    name: 'NAV.Teacher Management',
    type: 'sub',
    icon: 'teacher-management',
    permissions: 'teacher_management.show_perm',
    children: [
      {
        state: 'teacher-management/follow-up',
        name: 'NAV.Follow up',
        icon: 'teacher-management',
        permissions: 'teacher_management.teacher_follow_up.show_perm',
      },
      {
        state: 'teacher-management/teachers',
        name: 'NAV.Teachers',
        icon: 'teacher-management',
        permissions: 'teacher_management.teachers_table.show_perm',
      },
      {
        state: 'teacher-contract/contract-management',
        name: 'NAV.TEACHER_CONTRACT.CONTRACT_MANAGEMENT',
        icon: 'text-box-check',
        permissions: 'teacher_management.contract_process.show_perm',
      },
    ],
  },
  // {
  //   state: 'internship',
  //   name: 'Internship',
  //   type: 'sub',
  //   icon: 'target-account',
  //   permissions: 'internship.show_perm',
  //   children: [
  //     // {
  //     //   state: 'internship/job-offer',
  //     //   name: 'Internship Postings',
  //     //   icon: 'bullhorn',
  //     //   permissions: 'internship.internship_posting.show_perm',
  //     // },
  //     // {
  //     //   state: 'internship/intern-profile',
  //     //   name: 'Intern Profile',
  //     //   icon: 'account-circle-outline',
  //     //   permissions: 'internship.internship_profile.show_perm',
  //     // },
  //     // {
  //     //   state: 'internship/intern-candidates',
  //     //   name: 'Candidatures',
  //     //   icon: 'account-question-outline',
  //     //   permissions: 'internship.candidature.show_perm',
  //     // },
  //     // {
  //     //   state: 'internship/agreement',
  //     //   name: 'Agreements',
  //     //   icon: 'signature-freehand',
  //     //   permissions: 'internship.agreement.show_perm',
  //     // },
  //     {
  //       state: 'internship/follow-up',
  //       name: 'Follow Up',
  //       icon: 'person',
  //       permissions: 'internship.follow_up.show_perm',
  //     },
  //     {
  //       state: 'internship/settings',
  //       name: 'Internship Settings',
  //       icon: 'settings',
  //       permissions: 'internship.setting.show_perm',
  //     },
  //     {
  //       state: 'internship/users',
  //       name: 'Users',
  //       icon: 'account-circle-outline',
  //       permissions: 'internship.user.show_perm',
  //     },
  //   ],
  // },
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
  // {
  //   state: 'companies-internship',
  //   name: 'NAV.COMPANIES',
  //   type: 'sub',
  //   icon: 'business',
  //   permissions: 'companies.show_perm',
  //   children: [
  //     {
  //       state: 'companies-internship/entities',
  //       name: 'Companies Entity',
  //       icon: 'business',
  //       permissions: 'companies.company_entity.show_perm',
  //     },
  //     {
  //       state: 'companies-internship/branches',
  //       name: 'Companies Branches',
  //       icon: 'business',
  //       permissions: 'companies.company_branch.show_perm',
  //     },
  //   ],
  // },
  {
    state: 'rncpTitles',
    name: 'NAV.RNCP_TITLES',
    type: 'link',
    icon: 'import_contacts',
    permissions: 'rncp_title.show_perm',
  },
  {
    state: 'school-group',
    name: 'NAV.RNCP_TITLES',
    type: 'link',
    icon: 'import_contacts',
    permissions: 'chief_group_school.show_perm',
  },

  {
    state: 'my-file',
    name: 'NAV.myFile',
    type: 'link',
    icon: 'library',
    permissions: 'my_file.show_perm',
  },
  // {
  //   state: 'admission-entrypoint',
  //   name: 'NAV.Admission Entry Point',
  //   type: 'link',
  //   icon: 'login',
  //   permissions: 'intake_channel.show_perm'
  // },
  // {
  //   state: 'promo-external',
  //   name: 'NAV.Promo External',
  //   type: 'sub',
  //   icon: 'promo-external',
  //   children: [
  //     { state: 'promo-external', name: 'Promo External', icon: 'promo-external', permissions: 'rncp_title.show_perm'
  //     },
  //     { state: 'step-validation-message', name: 'Registration Steps Messages', icon: 'step-validation',
  //     permissions: 'rncp_title.show_perm'
  //     },
  //   ],
  //   permissions: 'setting.external_promotion.show_perm'
  // },
  {
    state: 'academic-journeys',
    name: 'NAV.Academic Journeys',
    type: 'sub',
    icon: 'AcademicJourneys',
    permissions: 'academic_journeys.show_perm',
    children: [
      { state: 'academic-journeys/summary', name: 'NAV.Summary', icon: 'AcademicJourneys', permissions: 'academic_journeys.show_perm' },
      {
        state: 'academic-journeys/my-profile',
        name: 'NAV.My Profile',
        icon: 'my_profile',
        permissions: 'academic_journeys.show_perm',
      },
      {
        state: 'academic-journeys/my-diploma',
        name: 'NAV.My Diploma',
        icon: 'my_diploma',
        permissions: 'academic_journeys.show_perm',
      },
      {
        state: 'academic-journeys/my-experience',
        name: 'NAV.My Experience',
        icon: 'my_experience',
        permissions: 'academic_journeys.show_perm',
      },
      {
        state: 'academic-journeys/my-skill',
        name: 'NAV.My Skill',
        icon: 'my_skill',
        permissions: 'academic_journeys.show_perm',
      },
      {
        state: 'academic-journeys/my-language',
        name: 'NAV.My Language',
        icon: 'my_language',
        permissions: 'academic_journeys.show_perm',
      },
      {
        state: 'academic-journeys/my-interest',
        name: 'NAV.My Interest',
        icon: 'my_interest',
        permissions: 'academic_journeys.show_perm',
      },
    ],
  },

  {
    state: 'school',
    name: 'NAV.SCHOOLS',
    type: 'sub',
    icon: 'account_balance',
    permissions: 'schools.group_of_schools.show_perm',
    children: [
      { state: 'school', name: 'NAV.List of School', icon: 'account_balance', permissions: 'schools.list_of_schools.show_perm' },
      {
        state: 'group-of-schools',
        name: 'NAV.Group of School',
        icon: 'account_balance',
        permissions: 'schools.group_of_schools.show_perm',
      },
    ],
  },
  {
    state: 'school-detail',
    name: 'NAV.SCHOOLS',
    type: 'link',
    icon: 'account_balance',
    permissions: 'schools.list_of_schools.show_perm',
  },

  {
    state: 'students',
    name: 'NAV.STUDENTS',
    type: 'sub',
    icon: 'school',
    permissions: 'students.active_students.show_perm',
    children: [
      { state: 'students', name: 'NAV.Active Student', icon: 'school', permissions: 'students.active_students.show_perm' },
      { state: 'completed-students', name: 'NAV.Completed Student', icon: 'school', permissions: 'students.completed_students.show_perm' },
      {
        state: 'deactivated-students',
        name: 'NAV.Deactivated Student',
        icon: 'school',
        permissions: 'students.deactivated_students.show_perm',
      },
      { state: 'suspended-students', name: 'NAV.Suspended Student', icon: 'school', permissions: 'students.suspended_students.show_perm' },
    ],
  },
  {
    state: 'students-card',
    name: 'NAV.STUDENTS',
    type: 'link',
    icon: 'school',
    permissions: 'company_student.show_perm',
  },
  {
    state: 'students',
    name: 'NAV.STUDENTS',
    type: 'link',
    icon: 'school',
    permissions: 'students.student_detail.show_perm',
  },
  {
    state: 'companies',
    name: 'NAV.COMPANIES',
    type: 'sub',
    icon: 'business',
    permissions: 'companies.show_perm',
    children: [
      { state: 'companies/entities', name: 'NAV.Companies Entity', icon: 'companies', permissions: 'companies.company_entity.show_perm' },
      {
        state: 'companies/branches',
        name: 'NAV.Companies Branches',
        icon: 'companies',
        permissions: 'companies.company_branch.show_perm',
      },
      {
        state: 'organization',
        name: 'NAV.Organization',
        icon: 'database-marker-outline',
        permissions: 'companies.organization.show_perm',
      },
    ],
  },
  {
    state: 'form-follow-up',
    name: 'NAV.Form Follow Up',
    icon: 'content_paste_search',
    type: 'sub',
    permissions: 'form_follow_up.show_perm', // Please change later on ERP_052 FE_034, currently BE not ready
    children: [
      {
        state: 'form-follow-up/general-form-follow-up',
        name: 'NAV.General Form Follow Up',
        icon: 'content_paste_search',
        permissions: 'form_follow_up.general_form_follow_up.show_perm',
      },
    ],
  },
  {
    state: 'task',
    name: 'NAV.MYTASKS',
    type: 'link',
    icon: 'task',
    permissions: 'tasks.show_perm',
  },
  // {
  //   state: '404',
  //   name: 'NAV.Notes',
  //   type: 'link',
  //   icon: 'content-save-edit',
  //   permissions: 'candidate.my_note.show_perm',
  // },
  {
    state: '404',
    name: 'NAV.Registration form',
    type: 'link',
    icon: 'key-variant',
    permissions: 'candidate_registration_form.show_perm',
  },
  {
    state: 'mailbox',
    name: 'NAV.MAILBOX',
    type: 'link',
    icon: 'mail',
    permissions: 'mailbox.show_perm',
    // children: [
    // { state: 'mailbox/inbox', name: 'MailBox.INBOX', icon: 'inbox' },
    // { state: 'mailbox/sentBox', name: 'MailBox.SENT', icon: 'send' },
    // { state: 'mailbox/important', name: 'MailBox.IMPORTANT', icon: 'label_important' },
    // { state: 'mailbox/draft', name: 'MailBox.DRAFT', icon: 'label_draft' },
    // { state: 'mailbox/trash', name: 'MailBox.TRASH', icon: 'delete' },
    // ],
  },
  // {
  // state: 'teacher-contract',
  // name: 'NAV.TEACHER_CONTRACT.CONTRACT',
  // type: 'sub',
  // icon: 'process',
  // permissions: 'contracts.show_perm',
  // children: [
  // {
  //   state: 'teacher-contract/contract-management',
  //   name: 'NAV.TEACHER_CONTRACT.CONTRACT_MANAGEMENT',
  //   icon: 'text-box-check',
  //   permissions: 'contracts.contract_process.show_perm',
  // },
  // {
  //   state: 'teacher-contract/contract-template',
  //   name: 'NAV.TEACHER_CONTRACT.CONTRACT_TEMPLATE',
  //   icon: 'pencil-ruler',
  //   permissions: 'contracts.contract_template.show_perm',
  // },
  // ],
  // },
  {
    state: 'parameters',
    name: 'NAV.PARAMETERS.NAME',
    type: 'sub',
    icon: 'settings',
    permissions: 'parameters.rncp_title_management.show_perm',
    children: [
      // { state: 'import-register', name: 'Import Objectives', icon: 'account_balance', permissions: 'parameters.import_objective' },
      // { state: 'import-register', name: 'Import Objectives', icon: 'account_balance', permissions: 'import_objective' },
      { state: 'platform', name: 'NAV.PARAMETERS.PLATFORM', icon: 'tune', permissions: 'parameters.platform.show_perm' },
      { state: 'title-rncp', name: 'NAV.TITLE_MANAGEMENT', icon: 'titles', permissions: 'parameters.rncp_title_management.show_perm' },
    ],
  },
  {
    state: 'export',
    name: 'NAV.EXPORT.NAME',
    type: 'sub',
    icon: 'export',
    permissions: 'export.show_perm',
    children: [
      { state: 'groups', name: 'NAV.EXPORT.GROUPS', icon: 'groups', permissions: 'export.groups.show_perm' },
      {
        state: 'status-update',
        name: 'NAV.EXPORT.STATUS_UPDATE',
        icon: 'assignment_turned_in',
        permissions: 'export.status_update.show_perm',
      },
    ],
  },
  {
    state: 'history',
    name: 'NAV.HISTORY.NAME',
    type: 'sub',
    icon: 'format_list_bulleted',
    permissions: 'history.show_perm',
    children: [
      { state: 'notifications', name: 'NAV.HISTORY.NOTIFICATIONS', icon: 'notifications', permissions: 'history.notifications.show_perm' },
      // {
      //   state: 'doctest',
      //   name: 'NAV.HISTORY.TESTS',
      //   icon: 'tests',
      //   permissions: 'history.tests.show_perm',
      // },
    ],
  },
  {
    state: 'messages',
    name: 'NAV.MESSAGES.NAME',
    type: 'sub',
    icon: 'send',
    permissions: 'messages.show_perm',
    children: [
      { state: 'urgent-message', name: 'NAV.MESSAGES.URGENT_MESSAGE', icon: 'flash_on', permissions: 'messages.urgent_message.show_perm' },
      { state: 'group-mailing', name: 'NAV.MESSAGES.GROUP_MAILING', icon: 'send', permissions: 'messages.group_mailing.show_perm' },
      {
        state: 'alert-functionality',
        name: 'NAV.MESSAGES.FUNCTIONALITY_ALERT',
        icon: 'functionality-alert',
        permissions: 'messages.alert_func.show_perm',
      },
    ],
  },
  {
    state: 'certification',
    name: 'NAV.CERTIFICATION.NAME',
    type: 'sub',
    icon: 'certification',
    permissions: 'certifications.show_perm',
    children: [
      {
        state: 'jury-organization',
        name: 'NAV.CERTIFICATION.JURY_ORGANIZATION',
        icon: 'jury-organization',
        permissions: 'certifications.jury_organization.show_perm',
      },
      // {
      //   state: 'grand-oral',
      //   name: 'NAV.CERTIFICATION.GRAND_ORAL',
      //   icon: 'jury-organization',
      //   permissions: 'certifications.jury_organization.show_perm',
      // },
      {
        state: 'global-jury-organization/all-jury-schedule',
        name: 'NAV.CERTIFICATION.ALL_JURY_SCHEDULE',
        icon: 'calender-acount',
        permissions: 'certifications.jury_schedule.show_perm',
      },
      {
        state: 'final-retake',
        name: 'NAV.CERTIFICATION.FINAL_RETAKE',
        icon: 'cached',
        permissions: 'certifications.final_retake.show_perm',
      },
      {
        state: 'certidegree',
        name: 'NAV.CERTIFICATION.CERTIDEGREE',
        icon: 'certidegree',
        permissions: 'certifications.certidegree.show_perm',
      },
      {
        state: 'transcript-process',
        name: 'NAV.CERTIFICATION.TRANSCRIPT_PROCESS',
        icon: 'final-transcript',
        permissions: 'certifications.final_transcript.show_perm',
      },
      {
        state: 'transcript-builder',
        name: 'NAV.TRANSCRIPT-BUILDER',
        icon: 'tutorial',
        permissions: 'transcript_builder.show_perm',
      },
      {
        state: 'test-status',
        name: 'NAV.CERTIFICATION.TEST_STATUS',
        icon: 'final-transcript',
        permissions: 'certifications.test_status.show_perm',
      },
    ],
  },
  // {
  //   state: 'courses-sequences',
  //   name: 'Courses & Sequences',
  //   type: 'link',
  //   icon: 'login',
  //   permissions: 'courses_sequences.show_perm',
  // },
  {
    state: 'template-sequences',
    name: 'course_sequence.Courses & Sequences',
    type: 'sub',
    icon: 'login',
    permissions: 'courses_sequences.show_perm',
    children: [
      {
        state: 'template-sequences',
        name: 'course_sequence.Template',
        icon: 'pencil-ruler',
        permissions: 'courses_sequences.template.show_perm',
      },
      {
        state: 'sequences',
        name: 'course_sequence.Sequences',
        icon: 'clipboard-list-outline',
        permissions: 'courses_sequences.sequence.show_perm',
      },
      {
        state: 'modules',
        name: 'course_sequence.Modules',
        icon: 'clipboard-list-outline',
        permissions: 'courses_sequences.module.show_perm',
      },
      {
        state: 'subjects',
        name: 'course_sequence.Subjects',
        icon: 'clipboard-list-outline',
        permissions: 'courses_sequences.subject.show_perm',
      },
    ],
  },
  {
    state: 'users',
    name: 'NAV.USERS',
    type: 'link',
    icon: 'person',
    permissions: 'users.show_perm', // Permission need to be changed later
  },

  // {
  //   state: 'scholar-card',
  //   name: 'NAV.INTAKE_CHANNEL.Intake channel',
  //   type: 'link',
  //   icon: 'login',
  //   permissions: 'intake_channel.intake_channel.show_perm',
  // },

  // intake channel v2
  {
    state: 'schools',
    name: 'NAV.INTAKE_CHANNEL.Intake channel',
    type: 'sub',
    icon: 'login',
    permissions: 'intake_channel.show_perm',
    children: [
      {
        state: 'scholar-season',
        name: 'NAV.INTAKE_CHANNEL.Scholar season',
        icon: 'scholar-season',
        permissions: 'intake_channel.scholar_season.show_perm',
      },
      {
        state: 'schools',
        name: 'NAV.INTAKE_CHANNEL.Schools',
        icon: 'account_balance',
        permissions: 'intake_channel.school.show_perm',
      },
      {
        state: 'campus',
        name: 'NAV.INTAKE_CHANNEL.Campus',
        icon: 'campus',
        permissions: 'intake_channel.campus.show_perm',
      },
      {
        state: 'level',
        name: 'NAV.INTAKE_CHANNEL.Level',
        icon: 'level',
        permissions: 'intake_channel.level.show_perm',
      },
      {
        state: 'sector',
        name: 'NAV.INTAKE_CHANNEL.Sector',
        icon: 'sector',
        permissions: 'intake_channel.sector.show_perm',
      },
      {
        state: 'speciality',
        name: 'NAV.INTAKE_CHANNEL.Speciality',
        icon: 'speciality',
        permissions: 'intake_channel.speciality.show_perm',
      },
      {
        state: 'site',
        name: 'NAV.INTAKE_CHANNEL.Sites',
        icon: 'location_on',
        permissions: 'intake_channel.site.show_perm',
      },
      {
        state: 'settings',
        name: 'NAV.INTAKE_CHANNEL.Settings',
        icon: 'settings',
        permissions: 'intake_channel.setting.show_perm',
      },
    ],
  },

  // {
  //   state: 'admission-entrypoint',
  //   name: 'NAV.INTAKE_CHANNEL.Intake channel',
  //   type: 'sub',
  //   icon: 'login',
  //   permissions: 'intake_channel.show_perm',
  //   children: [
  //     {
  //       state: 'admission-entrypoint',
  //       name: 'NAV.INTAKE_CHANNEL.Intake channel',
  //       icon: 'login',
  //       permissions: 'intake_channel.intake_channel.show_perm',
  //     },
  //     {
  //       state: '404',
  //       name: 'NAV.INTAKE_CHANNEL.Scholar season',
  //       icon: 'calendar-range',
  //       permissions: 'intake_channel.scholar_season.show_perm',
  //     },
  //     {
  //       state: '404',
  //       name: 'NAV.INTAKE_CHANNEL.Schools',
  //       icon: 'account_balance',
  //       permissions: 'intake_channel.school.show_perm',
  //     },
  //     {
  //       state: '404',
  //       name: 'NAV.INTAKE_CHANNEL.Full rate',
  //       icon: 'tools',
  //       permissions: 'intake_channel.full_rate.show_perm',
  //     },
  //     {
  //       state: '404',
  //       name: 'NAV.INTAKE_CHANNEL.Speciality',
  //       icon: 'hand-right',
  //       permissions: 'intake_channel.speciality.show_perm',
  //     },
  //     {
  //       state: '404',
  //       name: 'NAV.INTAKE_CHANNEL.Legal Entities',
  //       icon: 'companies',
  //       permissions: 'intake_channel.legal_entities.show_perm',
  //     },
  //     {
  //       state: '404',
  //       name: 'NAV.INTAKE_CHANNEL.Payment terms',
  //       icon: 'credit-card-outline',
  //       permissions: 'intake_channel.payment_terms.show_perm',
  //     },
  //     {
  //       state: '404',
  //       name: 'NAV.INTAKE_CHANNEL.Pricing Profiles',
  //       icon: 'currency-eur',
  //       permissions: 'intake_channel.pricing_profile.show_perm',
  //     },
  //   ],
  // },
  {
    state: 'import-register',
    name: 'NAV.SETTINGS.Settings',
    type: 'sub',
    icon: 'settings',
    permissions: 'setting.show_perm',
    children: [
      // { state: 'import-register', name: 'Import Objectives', icon: 'account_balance', permissions: 'parameters.import_objective' },
      {
        state: 'import-register',
        name: 'NAV.SETTINGS.Import of Registration Objectives',
        icon: 'export',
        permissions: 'setting.import_objective.show_perm',
      },
      {
        state: 'import-finance',
        name: 'NAV.SETTINGS.Import of financial objectives',
        icon: 'export',
        permissions: 'setting.import_objective_finance.show_perm',
      },
      {
        state: 'import-previous-finance',
        name: 'NAV.SETTINGS.Import of financial N - 1',
        icon: 'export',
        permissions: 'setting.import_finance_n1.show_perm',
      },
      {
        state: 'promo-external',
        name: 'NAV.SETTINGS.External promotions',
        icon: 'promo-external',
        permissions: 'setting.external_promotion.show_perm',
      },
      {
        state: 'step-validation-message',
        name: 'NAV.SETTINGS.Messages Steps',
        icon: 'step-validation',
        permissions: 'setting.message_step.show_perm',
      },
      // {
      //   state: '404',
      //   name: 'NAV.SETTINGS.CELS - Segmentation',
      //   icon: 'handshakes',
      //   permissions: 'setting.cels_segmentation.show_perm',
      // },
      // {
      //   state: '404',
      //   name: 'NAV.SETTINGS.CELS - Actions',
      //   icon: 'movie-play-outline',
      //   permissions: 'setting.cels_action.show_perm',
      // },
      {
        state: 'notification-management',
        name: 'NAV.PROCESS.NOTIFICATION_MANAGEMENT',
        icon: 'clipboard-flow',
        permissions: 'setting.notification_management.show_perm',
      },
      {
        state: 'user-permission',
        name: 'NAV.SETTINGS.USER_PERMISSION',
        icon: 'settings',
        permissions: 'setting.user_permission.show_perm',
      },
      {
        state: 'country-nationality',
        name: 'NAV.SETTINGS.COUNTRY_NATIONALITY',
        icon: 'flag',
        // permissions: 'setting.country_nationality.show_perm',
      },
    ],
  },
  {
    state: 'process',
    name: 'NAV.PROCESS.NAME',
    type: 'sub',
    icon: 'process',
    permissions: 'process.show_perm',
    children: [
      {
        state: 'form-builder',
        name: 'NAV.PROCESS.FORM_BUILDER',
        icon: 'pencil-ruler',
        permissions: 'process.form_builder.show_perm',
      },
      {
        state: 'document-builder',
        name: 'Documents',
        icon: 'Doc-builder',
        permissions: 'process.document.show_perm',
      },
    ],
  },
  {
    state: 'transcript-builder',
    name: 'NAV.TRANSCRIPT-BUILDER',
    type: 'link',
    icon: 'tutorial',
    permissions: 'transcript_builder.show_perm',
  },
  {
    state: 'previous-course',
    name: 'NAV.Previous Course',
    type: 'link',
    icon: 'PreviousCourse',
    permissions: 'previous_course.show_perm',
  },
  {
    state: 'ideas',
    name: 'NAV.IDEAS',
    type: 'link',
    icon: 'ideas',
    permissions: 'ideas.show_perm',
  },
  {
    state: 'tutorial-app',
    name: 'InApp Tutorials',
    type: 'link',
    icon: 'tutorial',
    permissions: 'candidate_dashboard.show_perm',
  },
  {
    state: 'tutorial',
    name: 'NAV.TUTORIALS',
    type: 'link',
    icon: 'tutorial',
    permissions: 'tutorials.tutorial_table',
  },
  {
    state: 'tutorial-app',
    name: 'InApp Tutorials',
    type: 'link',
    icon: 'tutorial',
    permissions: 'tutorials.inapp_tutorials.show_perm',
  },
  {
    state: 'promo',
    name: 'Promo',
    type: 'link',
    icon: 'horizontal_split',
    permissions: 'promos.show_perm',
  },
  {
    state: 'news',
    name: 'NAV.News',
    type: 'sub',
    icon: 'script-text-outline',
    permissions: '',
    children: [
      {
        state: '',
        name: 'NAV.All News',
        icon: 'clipboard-text-outline',
        permissions: '',
      },
      {
        state: 'manage-news',
        name: 'NAV.Manage News',
        icon: 'hammer-wrench',
        permissions: '',
      },
    ],
  },

  // {
  //   state: 'finance-follow-up',
  //   name: 'Paiement follow up',
  //   type: 'link',
  //   icon: 'euro',
  //   permissions: 'candidate_dashboard.show_perm',
  // },
  // {
  //   state: 'correction-eval-pro-step',
  //   name: 'Correction Eval Pro',
  //   type: 'link',
  //   icon: 'task',
  //   permissions: 'rncp_title.show_perm',
  // },
  // {
  //   state: 'needhelp',
  //   name: 'NAV.NEEDHELP',
  //   type: 'button',
  //   icon: 'help',
  //   permissions: 'need_help.show_perm',
  // },
];

@Injectable()
export class MenuItems {
  getAll(): Menu[] {
    return MENUITEMS;
  }
  add(menu: any) {
    MENUITEMS.push(menu);
  }
}
