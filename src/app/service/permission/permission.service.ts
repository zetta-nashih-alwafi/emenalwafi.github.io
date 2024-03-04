import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  userData;
  entityData;
  permissionData;
  isLoggedIn;
  isManualPermission = true;

  constructor(public httpClient: HttpClient, private apollo: Apollo, private translate: TranslateService) { }

  // Get data from local storage
  getLocalStorageUser() {
    if (!this.userData) {
      this.userData = JSON.parse(localStorage.getItem('userProfile'));
      this.isLoggedIn = this.userData ? true : false;
    }
    return this.userData;
  }

  getEntityUser() {
    if (!this.entityData) {
      this.entityData =
        this.getLocalStorageUser() && this.getLocalStorageUser().entities[0] ? this.getLocalStorageUser().entities[0] : null;
    }
    return this.entityData;
  }

  getEntityPermission() {
    if (!this.permissionData) {
      this.permissionData = this.getEntityUser() ? this.getEntityUser().type.usertype_permission_id : null;
    }
    return this.permissionData;
  }

  resetServiceData() {
    this.userData = null;
    this.entityData = null;
    this.permissionData = null;
  }


  // Permission to show menu
  showMenu(path) {
    const data = this.getEntityPermission();
    return _.get(data, path);
  }

  // Start of Pending Task and Calendar Permission in Title Dashboard
  showPendingTaskPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'rncp_title.pending_task.show_perm');
  }

  editPendingTaskPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'rncp_title.pending_task.edit_perm');
  }

  showCalendarPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'rncp_title.calendar.show_perm');
  }

  addCalendarPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'rncp_title.calendar.add_perm');
  }

  editCalendarPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'rncp_title.calendar.edit_perm');
  }

  deleteCalendarPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'rncp_title.calendar.delete_perm');
  }

  // Start of Acad Kit Permission
  showAcadKitPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'rncp_title.acad_kit.show_perm');
  }

  editAcadKitNot06Perm() {
    const data = this.getEntityPermission();
    return _.get(data, 'rncp_title.acad_kit.edit_perm');
  }

  editAcadKit06Perm() {
    const data = this.getEntityPermission();
    return false;
    // return _.get(data, 'rncp_title.acad_kit.edit_06_perm');
  }

  showAcadKitFolderOnePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'rncp_title.acad_kit.folder_permissions.folder_one.show_perm');
  }

  showAcadKitFolderTwoPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'rncp_title.acad_kit.folder_permissions.folder_two.show_perm');
  }

  showAcadKitFolderThreePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'rncp_title.acad_kit.folder_permissions.folder_three.show_perm');
  }

  showAcadKitFolderFourPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'rncp_title.acad_kit.folder_permissions.folder_four.show_perm');
  }

  showAcadKitFolderFivePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'rncp_title.acad_kit.folder_permissions.folder_five.show_perm');
  }

  showAcadKitFolderSixPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'rncp_title.acad_kit.folder_permissions.folder_six.show_perm');
  }

  showAcadKitFolderSevenPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'rncp_title.acad_kit.folder_permissions.folder_seven.show_perm');
  }

  showAcadKitFolderOthersPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'rncp_title.acad_kit.folder_permissions.folder_others.show_perm');
  }

  // Start of School Table Permission
  showSchoolTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.school_table.show_perm');
  }

  addSchoolTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.school_table.add_perm');
  }

  editchoolTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.school_table.actions.edit_perm');
  }

  sendMailSchoolTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.school_table.actions.send_email');
  }

  // Start of school identity permission inside school detail
  showSchoolIdentityPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.school_details.show_perm');
  }

  editSchoolIdentityPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.school_details.edit_perm');
  }

  showConnectedRncpTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.school_details.connected_rncp.show_perm');
  }

  addConnectedRncpTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.school_details.connected_rncp.add_perm');
  }

  editConnectedRncpTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.school_details.connected_rncp.actions.edit_perm');
  }

  deleteConnectedRncpTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.school_details.connected_rncp.actions.delete_perm');
  }

  // Start of school staff permission inside school detail
  showSchoolStaffPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.school_staff.show_perm');
  }

  addStaffSchoolStaffPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.school_staff.add_user');
  }

  exportStaffSchoolStaffPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.school_staff.export_button');
  }

  incignitoActionSchoolStaffPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.school_staff.school_staff_table.actions.incognito');
  }

  errorMailActionSchoolStaffPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.school_staff.school_staff_table.actions.error_email');
  }

  editActionSchoolStaffPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.school_staff.school_staff_table.actions.edit_perm');
  }

  deleteActionSchoolStaffPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.school_staff.school_staff_table.actions.delete_perm');
  }

  sendMailActionSchoolStaffPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.school_staff.school_staff_table.actions.send_email');
  }

  // Start of student table permission inside school detail
  showStudentTableInSchoolPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_table.show_perm');
  }

  addStudentInStudentTableInSchoolPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_table.add_perm');
  }

  importStudentInStudentTableInSchoolPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_table.import_student');
  }

  exportListOfStudentInStudentTableInSchoolPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_table.export_list_of_student');
  }

  exportESStudentInStudentTableInSchoolPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_table.export_ES');
  }

  thumbsupActionStudentTableInSchoolPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_table.actions.thumbsup');
  }

  resignActionStudentTableInSchoolPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_table.actions.resignation');
  }

  editActionStudentTableInSchoolPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_table.actions.edit_perm');
  }

  sendMailActionStudentTableInSchoolPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_table.actions.send_email');
  }

  // Start of deactivated student table permission inside school detail
  showDeactivatedStudentTableInSchoolPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.deactivate_student_table.show_perm');
  }

  exportDeactivatedStudentTableInSchoolPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.deactivate_student_table.export_perm');
  }

  reactiveDeactivatedStudentTableInSchoolPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.deactivate_student_table.reactive_perm');
  }

  // Start of student card permission inside school detail
  showStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.show_perm');
  }

  addStudentInStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.add_perm');
  }

  importStudentInStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.import_student');
  }

  showCourseTabStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.student_details.course.show_perm');
  }

  editCourseTabStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.student_details.course.edit_perm');
  }

  showIdentityTabStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.student_details.identity.show_perm');
  }

  editIdentityTabStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.student_details.identity.edit_perm');
  }

  showParentTabStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.student_details.parent.show_perm');
  }

  showCertificationRuleTabStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.student_details.certification_rule.show_perm');
  }

  showAcadJourneyTabStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.student_details.academic_journey.show_perm');
  }

  editParentTabStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.student_details.parent.edit_perm');
  }

  showEmpSurveyTabStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.student_details.emp_survey.show_perm');
  }

  showCompanyTabStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.student_details.company.show_perm');
  }

  editCompanyTabStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.student_details.company.edit_perm');
  }

  showJobDescTabStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.student_details.job_desc.show_perm');
  }

  showProblematicTabStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.student_details.problematic.show_perm');
  }

  showDiplomaTabStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.student_details.diploma.show_perm');
  }

  showSubjectCertTabStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.student_details.subject_of_cert.show_perm');
  }

  showDocumentTabStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.student_details.document.show_perm');
  }

  showCertificationTabStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.student_details.certification.show_perm');
  }

  showDetailCertificationTabStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.student_details.details_of_certification.show_perm');
  }

  showRetakeDuringYearTabStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.student_details.retake_during_year.show_perm');
  }

  showMentorEvalTabStudentCardPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.list_of_schools.student_card.student_details.mentor_evaluation.show_perm');
  }

  // Start of Group of School Permission
  showGroupOfSchoolPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.group_of_schools.show_perm');
  }

  addGroupOfSchoolPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.group_of_schools.add_perm');
  }

  editGroupOfSchoolPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.group_of_schools.actions.edit_perm');
  }

  deleteGroupOfSchoolPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'schools.group_of_schools.actions.delete_perm');
  }

  // Start of Activated Student table permission
  showStudentTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.active_students.show_perm');
  }

  transfertActionInStudentTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.active_students.student_table.transfer_student');
  }

  exportListOfStudentInTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.active_students.student_table.export_list_of_student');
  }

  exportESInStudentTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.active_students.student_table.export_ES');
  }

  editActiontInStudentTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.active_students.student_table.actions.edit_perm');
  }

  thumbsupActionInStudentTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.active_students.student_table.actions.thumbsup');
  }

  incignitoActionInStudentTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.active_students.student_table.actions.incognito');
  }

  errorMailActionInStudentTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.active_students.student_table.actions.error_email');
  }

  sendMailActionInStudentTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.active_students.student_table.actions.send_email');
  }

  resignationActionInStudentTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.active_students.student_table.actions.resignation_perm');
  }

  deactiveActionInStudentTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.active_students.student_table.actions.deactive_perm');
  }

  viewActionInStudentTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.active_students.student_table.actions.view_perm');
  }

  // Start of Deactivated Student table permission
  showStudentTablePermDeactivated() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.deactivated_students.show_perm');
  }

  exportListOfStudentInTablePermDeactivated() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.deactivated_students.student_table.export_list_of_student');
  }

  exportESInStudentTablePermDeactivated() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.deactivated_students.student_table.export_ES');
  }

  editActiontInStudentTablePermDeactivated() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.deactivated_students.student_table.actions.edit_perm');
  }

  thumbsupActionInStudentTablePermDeactivated() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.deactivated_students.student_table.actions.thumbsup');
  }

  incignitoActionInStudentTablePermDeactivated() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.deactivated_students.student_table.actions.incognito');
  }

  errorMailActionInStudentTablePermDeactivated() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.deactivated_students.student_table.actions.error_email');
  }

  reactivateActionInStudentTablePermDeactivated() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.deactivated_students.student_table.actions.reactivation_perm');
  }

  sendMailActionInStudentTablePermDeactivated() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.deactivated_students.student_table.actions.send_email');
  }

  resignationActionInStudentTablePermDeactivated() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.deactivated_students.student_table.actions.resignation_perm');
  }

  deactiveActionInStudentTablePermDeactivated() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.deactivated_students.student_table.actions.deactive_perm');
  }

  viewActionInStudentTablePermDeactivated() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.deactivated_students.student_table.actions.view_perm');
  }

  // Start of Completed table permission
  showStudentTablePermCompleted() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.completed_students.show_perm');
  }

  exportListOfStudentInTablePermCompleted() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.completed_students.student_table.export_list_of_student');
  }

  exportESInStudentTablePermCompleted() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.completed_students.student_table.export_ES');
  }

  editActiontInStudentTablePermCompleted() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.completed_students.student_table.actions.edit_perm');
  }

  thumbsupActionInStudentTablePermCompleted() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.completed_students.student_table.actions.thumbsup');
  }

  incignitoActionInStudentTablePermCompleted() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.completed_students.student_table.actions.incognito');
  }

  errorMailActionInStudentTablePermCompleted() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.completed_students.student_table.actions.error_email');
  }

  sendMailActionInStudentTablePermCompleted() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.completed_students.student_table.actions.send_email');
  }

  resignationActionInStudentTablePermCompleted() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.completed_students.student_table.actions.resignation_perm');
  }

  deactiveActionInStudentTablePermCompleted() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.completed_students.student_table.actions.deactive_perm');
  }

  viewActionInStudentTablePermCompleted() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.completed_students.student_table.actions.view_perm');
  }

  // Start of Suspended Student table permission
  showStudentTablePermSuspended() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.suspended_students.show_perm');
  }

  exportListOfStudentInTablePermSuspended() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.suspended_students.student_table.export_list_of_student');
  }

  exportESInStudentTablePermSuspended() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.suspended_students.student_table.export_ES');
  }

  editActiontInStudentTablePermSuspended() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.suspended_students.student_table.actions.edit_perm');
  }

  thumbsupActionInStudentTablePermSuspended() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.suspended_students.student_table.actions.thumbsup');
  }

  incignitoActionInStudentTablePermSuspended() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.suspended_students.student_table.actions.incognito');
  }

  errorMailActionInStudentTablePermSuspended() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.suspended_students.student_table.actions.error_email');
  }

  reactivateActionInStudentTablePermSuspended() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.suspended_students.student_table.actions.reactivation_perm');
  }

  sendMailActionInStudentTablePermSuspended() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.suspended_students.student_table.actions.send_email');
  }

  resignationActionInStudentTablePermSuspended() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.suspended_students.student_table.actions.resignation_perm');
  }

  deactiveActionInStudentTablePermSuspended() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.suspended_students.student_table.actions.deactive_perm');
  }

  // Start of Companies Permission
  showCompaniesTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.show_perm');
  }

  addcompanyPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.add_company');
  }

  deleteCompanyPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.delete_perm');
  }

  showsCompanyDetailsTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.company_details.company_detail.show_perm');
  }

  editCompanyDetailsTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.company_details.company_detail.edit_perm');
  }
  revisionCompanyDetailsTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.company_details.company_detail.revision_perm');
  }

  showsCompanyStaffTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.company_branch.company_staff.show_perm');
  }

  addStaffInCompanyStaffTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.company_branch.company_staff.add_perm');
  }

  editActionInCompanyStaffTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.company_branch.company_staff.actions.edit_perm');
  }

  sendMailActionInCompanyStaffTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.company_branch.company_staff.actions.send_email');
  }

  deleteActionInCompanyStaffTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.company_branch.company_staff.actions.delete_perm');
  }

  showsConnectedSchoolTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.company_details.connected_school.show_perm');
  }

  connectSchoolInConnectedSchoolTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.company_details.connected_school.connect_school');
  }

  connectMentorActionInConnectedSchoolTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.company_details.connected_school.actions.connect_mentor_to_School');
  }

  deleteActionInConnectedSchoolTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.company_details.connected_school.actions.delete_perm');
  }
  addNoteInCompany() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.company_entity.note.add_note');
  }
  editNoteInCompany() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.company_entity.note.edit_perm');
  }
  addCompanyInCompany() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.company_entity.add_company.show_perm');
  }
  editCompanyInCompany() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.company_branch.edit_company.show_perm');
  }
  addOrganization() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.organization.add_organization.show_perm');
  }
  editOrganization() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.organization.edit_organization.show_perm');
  }
  deleteOrganization() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.organization.delete_organization.show_perm');
  }
  addContactInOrganization() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.organization.contact.add_contact.show_perm');
  }
  editContactInOrganization() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.organization.contact.edit_contact.show_perm');
  }
  deleteContactInOrganization() {
    const data = this.getEntityPermission();
    return _.get(data, 'companies.organization.contact.delete_contact.show_perm');
  }

  // Start of Task Table Permission
  showTaskTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'tasks.show_perm');
  }

  addTaskInTaskTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'tasks.add_task');
  }

  internalTaskInTaskTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'tasks.internal_task');
  }

  addTestTaskInTaskTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'tasks.add_test_task');
  }

  deleteTaskActionInTaskTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'tasks.actions.delete_task');
  }

  editTaskActionInTaskTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'tasks.actions.edit_perm');
  }

  // Start of mailbox permission
  showMailboxTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'mailbox.show_perm');
  }

  composeActionInTaskTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'mailbox.actions.compose');
  }

  sendGroupMailActionInTaskTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'mailbox.actions.mail_to_group');
  }

  urgentMessageActionInTaskTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'mailbox.actions.urgent_message');
  }

  downloadMailActionInTaskTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'mailbox.actions.download_email');
  }

  deleteMailActionInTaskTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'mailbox.actions.delete');
  }

  importantMailActionInTaskTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'mailbox.actions.important');
  }

  // Start of Users Table permission
  showUsersTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'users.show_perm');
  }

  addUserInUsersTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'users.add_perm');
  }

  exportUsersTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'users.export');
  }
  resetUsersTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'users.actions.btn_reset');
  }

  incignitoActionInUsersTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'users.actions.incognito');
  }

  incignitoActionInCandidatePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.candidate_tab.connect_as');
  }

  postponeActionInCandidatePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.actions.report_inscription.show_perm');
  }

  errorMailActionInUsersTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'users.actions.error_email');
  }

  deleteUserActionInUsersTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'users.actions.delete_perm');
  }

  editUserActionInUsersTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'users.actions.edit_perm');
  }

  sendMailActionInUsersTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'users.actions.send_email');
  }

  reminderRegistrationActionInUsersTablePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'users.actions.reminder_reg_user');
  }

  // RNCP Title Management Permission
  showTitleManagementPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'parameters.rncp_title_management.show_perm');
  }

  addTitleManagementPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'parameters.rncp_title_management.add_perm');
  }

  editTitleManagementPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'parameters.rncp_title_management.edit_perm');
  }

  // Ideas Permission
  showIdeasPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'ideas.show_perm');
  }

  shareIdeasPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'ideas.actions.share');
  }

  replyIdeasPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'ideas.actions.reply');
  }

  deleteIdeasPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'ideas.actions.delete_perm');
  }

  detailIdeasPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'ideas.actions.details');
  }

  // Tutorial Permission
  showTutorialPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'tutorials.show_perm');
  }

  addTutorialPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'tutorials.add_perm');
  }

  deleteTutorialPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'tutorials.actions.delete_perm');
  }

  editTutorialPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'tutorials.actions.edit_perm');
  }

  viewTutorialPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'tutorials.actions.view_perm');
  }

  sendTutorialPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'tutorials.actions.send');
  }

  // *************** Start of Buttons Permission for Questionnaire Tools
  addQuestionnaireToolsTemplatePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'process.ques_tools.add_perm');
  }

  editActionQuestionnaireToolsTemplatePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'process.ques_tools.actions.edit_perm');
  }

  duplicateActionQuestionnaireToolsTemplatePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'process.ques_tools.actions.duplicate_perm');
  }

  deleteActionQuestionnaireToolsTemplatePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'process.ques_tools.actions.delete_perm');
  }
  // Process Form Builder
  addFormBuilder() {
    const data = this.getEntityPermission();
    return _.get(data, 'process.form_builder.actions.btn_add_template');
  }
  resetFormBuilder() {
    const data = this.getEntityPermission();
    return _.get(data, 'process.form_builder.actions.btn_reset');
  }
  deleteFormBuilder() {
    const data = this.getEntityPermission();
    return _.get(data, 'process.form_builder.actions.btn_delete_template');
  }
  editFormBuilder() {
    const data = this.getEntityPermission();
    return _.get(data, 'process.form_builder.actions.btn_edit_template');
  }
  duplicateFormBuilder() {
    const data = this.getEntityPermission();
    return _.get(data, 'process.form_builder.actions.btn_duplicate_template');
  }

  // *************** Start of Buttons Permission for Promo
  addPromoPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'promos.add_perm');
  }

  editPromoPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'promos.actions.edit_perm');
  }

  deletePromoPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'promos.actions.delete_perm');
  }

  viewPromoPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'promos.actions.view_perm');
  }

  // ************ Jury Organization button permission
  addJuryOrganizationPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'certifications.jury_organization.add_perm');
  }

  viewActionJuryOrganizationPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'certifications.jury_organization.actions.view_perm');
  }

  deleteActionJuryOrganizationPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'certifications.jury_organization.actions.delete_perm');
  }

  editActionJuryOrganizationPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'certifications.jury_organization.actions.edit_perm');
  }

  viewAssignJuryTabJuryOrganizationPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'certifications.jury_organization.jury_organization_assign_jury.show_perm');
  }

  viewAssignPresidentTabJuryOrganizationPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'certifications.jury_organization.jury_organization_assign_president_jury.show_perm');
  }

  viewAssignMemberTabJuryOrganizationPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'certifications.jury_organization.jury_organization_assign_member_jury.show_perm');
  }

  viewAssignStudentTabJuryOrganizationPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'certifications.jury_organization.jury_organization_assign_student.show_perm');
  }

  viewScheduleTabJuryOrganizationPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'certifications.jury_organization.jury_organization_schedule_jury.show_perm');
  }

  // ************ Start of Permission for ACAD_045 Transfer Responsibility
  transferResponsibilityPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'users.transfer_responsibility');
  }

  // ***************** Start of ERP_023 User Management & User Type ************************
  crmOkAdmissionFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.actions.btn_crm_ok');
  }
  assignRegistrationProfileMultiple() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.actions.btn_assign_registration_profile_multiple');
  }
  firstCallDoneMultipleCandidates() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.actions.btn_1st_call_done_multiple');
  }
  firstEmailOfAnnoucmentMultipleCandidates() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.actions.btn_1st_email_of_annoucment_multiple');
  }
  transferToAnotherDevCandidate() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.actions.btn_transfer_to_another_dev');
  }
  assignRegistrationProfileAdmissionFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.actions.btn_assign_registration_profile');
  }
  firstCallDoneAdmissionFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.actions.btn_1st_call_done');
  }
  firstEmailOfAnnoucmentAdmissionFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.actions.btn_1st_email_of_annoucment');
  }
  transferToAnotherDevAdmissionFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.actions.btn_transfer_to_another_dev_multiple');
  }
  assignInternshipFCPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_continuous.actions.btn_assign_internship_exchange');
  }
  
  sendEmailMultipleAdmissionFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.actions.btn_send_email_multiple');
  }
  exportCsvAdmissionFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.actions.btn_export_csv');
  }
  resetAdmissionFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.actions.btn_reset');
  }
  sendEmailAdmissionFollowUpAdmissionFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.actions.btn_send_email');
  }
  transferToAnotherProgramAdmissionFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.actions.btn_transfer_another_program');
  }
  viewStudentCardAdmissionFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.actions.btn_view_student_card');
  }
  viewAdmissionFileAdmissionFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.actions.btn_view_admission_file');
  }
  resendRegistrationEmailAdmissionFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.actions.btn_resend_registration_email');
  }
  // Candidate FC - follow up continuous
  crmOkFollowUpContinuous() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_continuous.actions.btn_crm_ok');
  }
  assignRegistrationProfileMultipleFollowUpContinuous() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_continuous.actions.btn_assign_registration_profile_multiple');
  }
  firstCallDoneMultipleFollowUpContinuous() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_continuous.actions.btn_1st_call_done_multiple');
  }
  firstEmailMultipleFollowUpContinuous() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_continuous.actions.btn_1st_email_of_annoucment_multiple');
  }
  transferToAnotherMemberMultipleFollowUpContinuous() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_continuous.actions.btn_transfer_to_another_dev_multiple');
  }
  sendEmailMultipleFollowUpContinuous() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_continuous.actions.btn_send_email_multiple');
  }
  exportFollowUpContinuous() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_continuous.actions.btn_export_csv');
  }
  resetFollowUpContinuous() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_continuous.actions.btn_reset');
  }
  assignRegistrationProfileFollowUpContinuous() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_continuous.actions.btn_assign_registration_profile');
  }
  firstCallDoneFollowUpContinuous() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_continuous.actions.btn_1st_call_done');
  }
  firstEmailFollowUpContinuous() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_continuous.actions.btn_1st_email_of_annoucment');
  }
  sendEmailFollowUpContinuous() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_continuous.actions.btn_send_email');
  }
  transferToAnotherMemberFollowUpContinuous() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_continuous.actions.btn_transfer_to_another_dev');
  }
  transferToAnotherProgramFollowUpContinuous() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_continuous.actions.btn_transfer_another_program');
  }
  viewStudentCardFollowUpContinuous() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_continuous.actions.btn_view_student_card');
  }
  viewAdmissionFileFollowUpContinuous() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_continuous.actions.btn_view_admission_file');
  }
  resendRegistrationEmailFollowUpContinuous() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_continuous.actions.btn_resend_registration_email');
  }

  //Candidate - Follow up Contract
  addContractFollowUpContract() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_contract.actions.btn_add_contract');
  }
  sendEmailFollowUpContract() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_contract.actions.btn_send_email');
  }
  sendReminderFollowUpContract() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_contract.actions.btn_send_reminder');
  }
  viewStudentCardFollowUpContract() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_contract.actions.btn_view_student_card');
  }
  viewAdmissionContractFollowUpContract() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_contract.actions.btn_view_admission_contract');
  }
  editFollowUpContractPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.follow_up_contract.edit_perm');
  }

  // Course & Sequence Permission
  exportCourseSequencePerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'courses_sequences.btn_export');
  }
  resetCourseSequencePerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'courses_sequences.btn_reset');
  }
  addSubjectCourseSequencePerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'courses_sequences.btn_add_subject');
  }
  addTemplatePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.template.create_perm');
  }
  exportTemplatePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.template.export_perm');
  }
  resetTemplatePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.template.actions.btn_reset');
  }
  duplicateTemplatePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.template.actions.btn_duplicate');
  }
  deleteTemplatePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.template.actions.btn_delete');
  }
  editTemplatePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.template.edit_perm');
  }
  // sequence
  addSequencePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.sequence.create_perm');
  }
  exportSequencePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.sequence.export_perm');
  }
  resetSequencePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.sequence.actions.btn_reset');
  }
  deleteSequencePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.sequence.actions.btn_delete');
  }
  duplicateSequencePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.sequence.actions.btn_duplicate');
  }
  editSequencePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.sequence.edit_perm');
  }
  //module
  templateImportModulePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.module.actions.btn_template_import');
  }
  importModulePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.module.actions.btn_import_module');
  }
  resetModulePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.module.actions.btn_reset');
  }
  deleteModulePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.module.actions.btn_delete');
  }
  addModulePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.module.create_perm');
  }
  exportModulePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.module.export_perm');
  }
  editModulePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.module.edit_perm');
  }
  //subject
  addSubjectPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.subject.create_perm');
  }
  exportSubjectPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.subject.export_perm');
  }
  editSubjectPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.subject.edit_perm');
  }
  templateImportSubjectPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.subject.actions.btn_template_import');
  }
  importSubjectPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.subject.actions.btn_import_subject');
  }
  resetSubjectPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.subject.actions.btn_reset');
  }
  deleteSubjectPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'courses_sequences.subject.actions.btn_delete');
  }
  // user Permission
  addUsersTabPermission() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'users.add.send_email');
  }
  sendEmailUsersTabPermission() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'users.actions.send_email');
  }
  transferAnotherDevUsersTabPermission() {
    const data = this.getEntityPermission();
    return _.get(data, 'users.actions.btn_transfer_another_dev');
  }
  transferAnotherProgramUsersTabPermission() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'users.actions.btn_transfer_another_program');
  }
  viewStudentCardUsersTabPermission() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'users.actions.btn_view_student_card');
  }
  viewAdmissionFileUsersTabPermission() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'users.actions.btn_view_admission_file');
  }
  resendRegistratUsersTabPermission() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'users.actions.btn_resend_registration_email');
  }

  // ***************** Start of ERP_023 User Management & User Type ************************

  // Admission - Oscar
  importAdmissionOscarPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.oscar_campus.actions.btn_import');
  }

  assignProgramAdmissionOscarPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.oscar_campus.actions.btn_assign_program');
  }

  getAdmissionOscarStudentsPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.oscar_campus.actions.btn_get_oscar_student');
  }

  exportAdmissionOscarPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.oscar_campus.actions.btn_export');
  }

  resetAdmissionOscarPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.oscar_campus.actions.btn_reset');
  }

  // Admission - Hubspot
  assignProgramAdmissionHubspotPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.hubspot.actions.btn_assign_program');
  }

  getAdmissionHubspotStudentsPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.hubspot.actions.btn_get_hubspot_student');
  }

  exportAdmissionHubspotPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.hubspot.actions.btn_export');
  }

  resetAdmissionHubspotPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.hubspot.actions.btn_reset');
  }

  // Finance - Follow Up
  generateBillingFinanceFollowUp() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.follow_up.actions.btn_generate_billing');
  }
  askingPaymentFinanceFollowUp() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.follow_up.actions.btn_asking_payment');
  }
  sendMailMultipleFinanceFollowUp() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.follow_up.actions.btn_send_mail_multiple');
  }

  sendEmailFinanceFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.follow_up.actions.btn_send_email');
  }
  addPaymentFinanceFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.follow_up.actions.add_payment');
  }
  viewStudentCardFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.follow_up.actions.btn_view_student_card');
  }
  editFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.follow_up.actions.btn_edit_term');
  }
  exportFinanceFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.follow_up.actions.btn_export');
  }

  resetFinanceFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.follow_up.actions.btn_reset');
  }
  // Finance - Follow up organization
  generateBillingInFollowUpOrganization() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.follow_up_organization.actions.btn_generate_billing');
  }
  assignTimelineTemplateMultipleInFollowUpOrganization() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.follow_up_organization.actions.btn_assign_timeline_multiple');
  }
  sendMailMultipleInFollowUpOrganization() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.follow_up_organization.actions.btn_send_mail_multiple');
  }
  exportInFollowUpOrganization() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.follow_up_organization.actions.btn_export');
  }
  resetInFollowUpOrganization() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.follow_up_organization.actions.btn_reset');
  }
  sendMailInFollowUpOrganization() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.follow_up_organization.actions.btn_send_email');
  }
  addPaymentInFollowUpOrganization() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.follow_up_organization.actions.add_payment');
  }
  editTermInFollowUpOrganization() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.follow_up_organization.actions.btn_edit_term');
  }
  viewStudentCardInFollowUpOrganization() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.follow_up_organization.actions.btn_view_student_card');
  }
  assignTimelineInFollowUpOrganization() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.follow_up_organization.actions.btn_assign_timeline');
  }
  // Finance - Timeline Template
  createTimelineTemplate() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.timeline_template.create_timeline_template.show_perm');
  }
  editTimelineTemplate() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.timeline_template.edit_timeline_template.show_perm');
  }
  deleteTimelineTemplate() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.timeline_template.delete_timeline_template.show_perm');
  }
  // Finance - Operation Lines
  operationLinesShowNotExportedTabPermission() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.operation_lines.not_exported.show_perm');
  }
  operationLinesShowExportedTabPermission() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.operation_lines.exported.show_perm');
  }
  // Finance - Operation Lines Not Exported Tab
  operationLinesNotExportedTabActionExportSagePermission() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.operation_lines.not_exported.actions.export_sage');
  }
  operationLinesNotExportedTabActionExportLinesToExportPermission() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.operation_lines.not_exported.actions.export_lines_to_export');
  }
  operationLinesNotExportedTabActionExportLinesExportedPermission() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.operation_lines.not_exported.actions.export_lines_exported');
  }
  operationLinesNotExportedTabActionExportAllLinesPermission() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.operation_lines.not_exported.actions.export_all_lines');
  }
  operationLinesNotExportedTabActionResetPermission() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.operation_lines.not_exported.actions.btn_reset');
  }
  // Finance - Operation Lines Exported Tab
  operationLinesExportedTabActionResetPermission() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.operation_lines.exported.btn_reset');
  }
  // Finance - Unbalance Balance
  unbalancedBalanceActionExportPermission() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.unbalanced_balance.actions.btn_export');
  }
  unbalancedBalanceActionResetPermission() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.unbalanced_balance.actions.btn_reset');
  }
  unbalancedBalanceActionSendSchoolContractAmandementPermission() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.unbalanced_balance.actions.send_school_contract_amendment');
  }

  // Finance - Master Transaction Table
  masterTableTransactionShowPermission() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.master_table_transaction.show_perm');
  }
  
  masterTableTransactionActionExportPermission() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.master_table_transaction.actions.btn_export');
  }
  
  masterTableTransactionActionViewTransactionPermission() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.master_table_transaction.actions.btn_view_transaction');
  }

  masterTableTransactionActionViewDetailPermission() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.master_table_transaction.actions.btn_view_detail');
  }

  masterTableTransactionActionViewStudentCardPermission() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.master_table_transaction.actions.btn_view_student_card');
  }
  
  // Alumni - Follow Up
  exportAlumniFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'alumni.follow_up.actions.btn_export');
  }
  sendSurveyMultipleAlumniFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'alumni.follow_up.actions.btn_send_survey_multiple');
  }
  sendSurveyAlumniFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'alumni.follow_up.actions.btn_send_survey');
  }
  sendEmailAlumniFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'alumni.follow_up.actions.btn_send_email');
  }
  viewAlumniFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'alumni.follow_up.actions.btn_view_alumni_card');
  }
  resetAlumniFollowUpPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'alumni.follow_up.actions.btn_reset');
  }
  // Alumni - Card
  editAlumniCard() {
    const data = this.getEntityPermission();
    return _.get(data, 'alumni.card.edit_perm');
  }

  // Contract - Contract Management
  sendTheFormContractManagementPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'contracts.contract_process.actions.btn_send_the_form');
  }

  templateForImportContractManagementPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'contracts.contract_process.actions.btn_template_for_import');
  }

  importContractManagementPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'contracts.contract_process.actions.btn_import_contract');
  }

  newContractManagementPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'contracts.contract_process.actions.btn_new_contract');
  }

  resetContractManagementPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'contracts.contract_process.actions.btn_reset');
  }
  goToFormContractManagementPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'contracts.contract_process.actions.btn_go_to_form');
  }
  editContractManagementPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'contracts.contract_process.actions.btn_edit_contract');
  }
  sendReminderContractManagementPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'contracts.contract_process.actions.btn_send_reminder');
  }
  sendEmailContractManagementPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'contracts.contract_process.actions.btn_send_email');
  }
  additionalDocumentContractManagementPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'contracts.contract_process.actions.btn_additional_document');
  }
  removeContractManagementPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'contracts.contract_process.actions.btn_remove_contract');
  }

  // Contract - Contract Template
  contractTemplateDetailPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission
      ? this.isManualPermission
      : _.get(data, 'contracts.contract_template.actions.btn_contract_template_detail');
  }

  resetContractTemplatePerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'contracts.contract_template.actions.btn_reset');
  }

  //Tutorial - InApp Tutorials
  resetInAppTutorial() {
    const data = this.getEntityPermission();
    return _.get(data, 'tutorials.inapp_tutorials.actions.btn_reset');
  }
  addInAppTutorial() {
    const data = this.getEntityPermission();
    return _.get(data, 'tutorials.inapp_tutorials.actions.btn_add_tutorial');
  }
  publishInAppTutorial() {
    const data = this.getEntityPermission();
    return _.get(data, 'tutorials.inapp_tutorials.actions.btn_publish_tutorial');
  }
  editInAppTutorial() {
    const data = this.getEntityPermission();
    return _.get(data, 'tutorials.inapp_tutorials.edit_perm');
  }
  deleteInAppTutorial() {
    const data = this.getEntityPermission();
    return _.get(data, 'tutorials.inapp_tutorials.actions.btn_delete_tutorial');
  }
  viewInAppTutorial() {
    const data = this.getEntityPermission();
    return _.get(data, 'tutorials.inapp_tutorials.actions.btn_view_tutorial');
  }
  // inApp Tutorials
  deleteInAppTutorialPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'tutorials.actions.delete_perm');
  }

  editInAppTutorialPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'tutorials.edit_perm');
  }

  addInAppTutorialPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'tutorials.add_perm');
  }

  viewInAppTutorialPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'tutorials.actions.view_perm');
  }

  publishUnpublishInAppTutorialPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'tutorials.actions.edit_perm');
  }

  // exportCsvInAppTutorialPerm() {
  //   const data = this.getEntityPermission();
  //   return this.isManualPermission ? this.isManualPermission : _.get(data, 'inapp_tutorials.actions.btn_export_csv');
  // }

  // resetInAppTutorialPerm() {
  //   const data = this.getEntityPermission();
  //   return this.isManualPermission ? this.isManualPermission : _.get(data, 'inapp_tutorials.actions.btn_reset');
  // }

  // Intake Channel - Admission Channel
  editFlyersAdmissionChannelPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.admission_channel.actions.btn_edit_flyers');
  }

  downloadFlyersAdmissionChannelPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.admission_channel.actions.btn_download_flyers');
  }

  editConditionAdmissionChannelPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.admission_channel.actions.btn_edit_condition');
  }

  downloadConditionAdmissionChannelPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission
      ? this.isManualPermission
      : _.get(data, 'intake_channel.admission_channel.actions.btn_download_condition');
  }

  exportCsvAdmissionChannelPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.admission_channel.actions.btn_export_csv');
  }

  resetAdmissionChannelPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.admission_channel.actions.btn_reset');
  }

  // Setting - import_objective
  editImportObjective() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.import_objective.edit_perm');
  }
  // Setting - import_objective_finance
  editImportObjectiveFinance() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.import_objective_finance.edit_perm');
  }
  // Setting - import_finance_n1
  editImportFinanceN1() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.import_finance_n1.edit_perm');
  }
  // Settings - Notification Management
  editNotificationManagementPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.notification_management.actions.btn_edit_notification');
  }
  editNotificationManagement() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.notification_management.edit_perm');
  }

  resetNotificationManagementPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.notification_management.actions.btn_reset');
  }

  deleteTemplateNotificationManagementPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.notification_management.actions.btn_delete_template');
  }

  editTemplateNotificationManagementPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.notification_management.actions.btn_edit_template');
  }

  addTemplateNotificationManagementPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.notification_management.actions.btn_add_template');
  }

  viewTemplateNotificationManagementPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.notification_management.actions.btn_view_template');
  }

  resetTemplateNotificationManagementPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.notification_management.actions.btn_reset_template');
  }

  // Intake Channel - Full Rate
  editFullRatePerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.full_rate.actions.btn_edit_mode');
  }

  importFullRatePerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.full_rate.actions.btn_import');
  }

  exportFullRatePerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.full_rate.actions.btn_export');
  }

  // Intake Channel - Type of formation
  // deleteTypeOfFormationPerm() {
  //   const data = this.getEntityPermission();
  //   return this.isManualPermission
  //     ? this.isManualPermission
  //     : _.get(data, 'intake_channel.type_of_formation.actions.btn_delete_type_of_formation');
  // }

  // editTypeofFormationPerm() {
  //   const data = this.getEntityPermission();
  //   return this.isManualPermission
  //     ? this.isManualPermission
  //     : _.get(data, 'intake_channel.type_of_formation.actions.btn_edit_type_of_formation');
  // }

  // addTypeOfFormationPerm() {
  //   const data = this.getEntityPermission();
  //   return this.isManualPermission
  //     ? this.isManualPermission
  //     : _.get(data, 'intake_channel.type_of_formation.actions.btn_add_type_of_formation');
  // }

  // exportCsvTypeOfFormationPerm() {
  //   const data = this.getEntityPermission();
  //   return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.type_of_formation.actions.btn_export_csv');
  // }

  // resetTypeOfFormationPerm() {
  //   const data = this.getEntityPermission();
  //   return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.type_of_formation.actions.btn_reset');
  // }

  // Intake Channel - Additional Expenses
  deleteAdditionalExpensesPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission
      ? this.isManualPermission
      : _.get(data, 'intake_channel.additional_expenses.actions.btn_delete_additional_expenses');
  }

  editAdditionalExpensesPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission
      ? this.isManualPermission
      : _.get(data, 'intake_channel.additional_expenses.actions.btn_edit_additional_expenses');
  }

  addAdditionalExpensesPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission
      ? this.isManualPermission
      : _.get(data, 'intake_channel.additional_expenses.actions.btn_add_additional_expenses');
  }

  exportCsvAdditionalExpensesPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.additional_expenses.actions.btn_export_csv');
  }

  resetAdditionalExpensesPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.additional_expenses.actions.btn_reset');
  }
  // Intake Channel - Setting  payment mode
  deletePaymentMode() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.payment_mode.actions.btn_delete_payment_mode');
  }

  editPaymentMode() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.payment_mode.actions.btn_edit_payment_mode');
  }

  addPaymentMode() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.payment_mode.actions.btn_add_payment_mode');
  }

  exportCsvPaymentMode() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.payment_mode.actions.btn_export_csv');
  }

  resetPaymentMode() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.payment_mode.actions.btn_reset');
  }

  // Intake Channel - Payment Mode
  deletePaymentModePerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.payment_mode.actions.btn_delete_payment_mode');
  }

  editPaymentModePerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.payment_mode.actions.btn_edit_payment_mode');
  }

  addPaymentModePerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.payment_mode.actions.btn_add_payment_mode');
  }

  exportCsvPaymentModePerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.payment_mode.actions.btn_export_csv');
  }

  resetPaymentModePerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.payment_mode.actions.btn_reset');
  }

  // setting > Massage Steps Permission
  deleteMassageStepsPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.message_step.actions.btn_delete_message_step');
  }
  editMassageStepsPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.message_step.actions.btn_edit_message_step');
  }
  addMassageStepsPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.message_step.actions.btn_add_message_step');
  }
  viewMassageStepsPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.message_step.actions.btn_view_message_step');
  }
  sendByEmailMassageStepsPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.message_step.actions.btn_send_email');
  }
  duplicateMassageStepsPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.message_step.actions.btn_duplicate_message_step');
  }
  publishUnpublishMassageStepsPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.message_step.actions.btn_publish_message_step');
  }
  exportCsvMassageStepsPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.message_step.actions.btn_export_csv');
  }
  resetMassageStepsPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.message_step.actions.btn_reset');
  }

  // setting > Diapos External
  deleteDiaposExternalPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.external_promotion.actions.btn_delete_diapos_external');
  }
  editDiaposExternalPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.external_promotion.actions.btn_edit_diapos_external');
  }
  addDiaposExternalPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.external_promotion.actions.btn_add_diapos_external');
  }
  viewDiaposExternalPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.external_promotion.actions.btn_view_diapos_external');
  }
  sendEmailDiaposExternalPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.external_promotion.actions.btn_send_email');
  }
  duplicateDiaposExternalPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.external_promotion.actions.btn_duplicate_diapos_external');
  }
  publishUnpublishDiaposExternalPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.external_promotion.actions.btn_publish_diapos_external');
  }
  exportCsvDiaposExternalPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.external_promotion.actions.btn_export_csv');
  }
  resetDiaposExternalPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'setting.external_promotion.actions.btn_reset');
  }
  // Intake Channel - Scholar Season
  addScholarSeason() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.scholar_season.actions.btn_add_scholar_season');
  }
  resetScholarSeason() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.scholar_season.actions.btn_reset');
  }
  publishScholarSeason() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.scholar_season.actions.btn_publish');
  }
  editScholarSeason() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.scholar_season.actions.btn_edit');
  }
  deleteScholarSeason() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.scholar_season.actions.btn_delete');
  }

  // Intake Channel - School Program
  addSchoolProgram() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.program.actions.btn_add_program');
  }
  exportSchoolProgram() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.program.actions.btn_export_csv');
  }
  resetSchoolProgram() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.program.actions.btn_reset');
  }
  deleteSchoolProgram() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.program.actions.btn_delete_program');
  }
  // Intake Channel > School Tab
  addSchoolInIntakeChanelSchool() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.actions.btn_add_school');
  }
  editSchoolInIntakeChanelSchool() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.actions.btn_edit_school');
  }
  showProgramIntakeChanelSchool() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.program.show_perm');
  }
  showDownPaymentIntakeChanelSchool() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.down_payment.show_perm');
  }
  showFullRateIntakeChanelSchool() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.full_rate.show_perm');
  }
  showLegalIntakeChanelSchool() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.legal.show_perm');
  }
  showAdmissionIntakeChanelSchool() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.admission.show_perm');
  }
  showCourseSequenceIntakeChanelSchool() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.course_sequence.show_perm');
  }
  deleteIntakeChannelSchoolTabPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.school.actions.btn_delete_school');
  }
  editIntakeChannelSchoolTabPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission
      ? this.isManualPermission
      : _.get(data, 'intake_channel.notification_management.actions.btn_edit_school');
  }
  addIntakeChannelSchoolTabPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.notification_management.actions.btn_add_school');
  }
  exportCsvIntakeChannelSchoolTabPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.notification_management.actions.btn_export_csv');
  }
  resetIntakeChannelSchoolTabPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.notification_management.actions.btn_reset');
  }

  // Intake Channel > School > Down Payment
  exportCsvIntakeChannelSchoolDownPaymentTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.down_payment.actions.btn_export_csv');
  }
  importIntakeChannelSchoolDownPaymentTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.down_payment.actions.btn_import_down_payment');
  }
  editPermIntakeChannelSchoolDownPaymentTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.down_payment.edit_perm');
  }

  // Intake Channel > School > Full Rate
  exportCsvIntakeChannelSchoolFullRatetPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.full_rate.actions.btn_export_csv');
  }
  importIntakeChannelSchoolFullRatetTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.full_rate.actions.btn_import_full_rate');
  }
  editPermIntakeChannelSchoolFullRatetTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.full_rate.edit_perm');
  }

  // Intake Channel > School > Legal
  resetIntakeChannelSchoolLegalTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.legal.actions.btn_reset');
  }
  exportCsvIntakeChannelSchoolLegalTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.legal.actions.btn_export_csv');
  }
  connectLegalEntityIntakeChannelSchoolLegalTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.legal.actions.btn_connect_legal_entity');
  }
  paidAllowanceRateIntakeChannelSchoolLegalTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.legal.actions.btn_paid_allowance_rate');
  }
  inducedHoursIntakeChannelSchoolLegalTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.legal.actions.btn_induced_hours');
  }

  // Intake Channel > School > Admission
  resetIntakeChannelSchoolAdmissionTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.admission.actions.btn_reset');
  }
  exportCsvIntakeChannelSchoolAdmissionTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.admission.actions.btn_export_csv');
  }
  addConditionMultipleIntakeChannelSchoolAdmissionTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.admission.actions.btn_add_condition_multiple');
  }
  removeRegistrationProfileIntakeChannelSchoolAdmissionTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.admission.actions.btn_remove_registration_profile');
  }
  addRegistrationProfileIntakeChannelSchoolAdmissionTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.admission.actions.btn_add_registration_profile');
  }
  editPermIntakeChannelSchoolAdmissionTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.admission.edit_perm');
  }

  // Intake Channel > School > Courses & Sequences
  editPermIntakeChannelSchoolCoursesSequencesTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.course_sequence.edit_perm');
  }
  resetIntakeChannelSchoolCoursesSequencesTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.course_sequence.actions.btn_reset');
  }
  connectTemplateIntakeChannelSchoolCoursesSequencesTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.course_sequence.actions.btn_connect_template');
  }
  detailsIntakeChannelSchoolCoursesSequencesTabPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.school.course_sequence.actions.btn_details');
  }

  // Intake Channel > Level by campus
  editIntakeChannelLevelByCampusPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.level_by_campus.btn_edit_level');
  }
  exportIntakeChannelLevelByCampusPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.level_by_campus.actions.btn_export_csv');
  }
  resetIntakeChannelLevelByCampusPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.level_by_campus.actions.btn_reset');
  }

  // Intake Channel > sector
  deleteIntakeChannelSectorPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.sector.actions.btn_delete_sector');
  }
  editIntakeChannelSectorPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.sector.actions.btn_edit_sector');
  }
  exportIntakeChannelSectorPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.sector.actions.btn_export_csv');
  }
  addIntakeChannelSectorPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.sector.actions.btn_add_sector');
  }
  // Intake Channel > Speacility
  deleteIntakeChannelSpecialityPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.speciality.actions.btn_delete_speciality');
  }
  editIntakeChannelSpecialityPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.speciality.actions.btn_edit_speciality');
  }
  addIntakeChannelSpecialityPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.speciality.actions.btn_add_speciality');
  }
  exportCsvIntakeChannelSpecialityPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.speciality.actions.btn_export_csv');
  }
  resetIntakeChannelSpecialityPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.speciality.actions.btn_reset');
  }
  // Intake Channel > Down Payment
  editIntakeChannelDownPaymentPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.down_payment.actions.btn_edit_mode');
  }
  importIntakeChannelDownPaymentPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.down_payment.actions.btn_import');
  }
  exportIntakeChannelDownPaymentPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.down_payment.actions.btn_export');
  }

  // Finance History
  reconciliationFinanceHistoryPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.history.actions.btn_reconciliation');
  }
  lettrageFinanceHistoryPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.history.actions.btn_lettrage');
  }
  seeStudentFileFinanceHistoryPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.history.actions.btn_see_student_file');
  }
  createInternalTaskFinanceHistoryPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.history.actions.btn_create_internal_task');
  }
  sendEmailFinanceHistoryPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.history.actions.btn_send_email');
  }
  exportCsvFinanceHistoryPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.history.actions.btn_export_csv');
  }
  filterTodayFinanceHistoryPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.history.actions.btn_filter_today');
  }
  filterYesterdayFinanceHistoryPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.history.actions.btn_filter_yesterday');
  }
  filterLast7DaysFinanceHistoryPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.history.actions.btn_filter_last_7_days');
  }
  filterLast30DaysFinanceHistoryPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.history.actions.btn_filter_last_30_days');
  }
  filterThisMonthFinanceHistoryPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.history.actions.btn_filter_this_month');
  }
  resetFinanceHistoryPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.history.actions.btn_reset');
  }

  // Finance - Transaction
  exportCsvFinanceTransactionPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.transaction_report.actions.btn_export_csv');
  }
  filterTodayFinanceTransactionPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.transaction_report.actions.btn_filter_today');
  }
  filterYesterdayFinanceTransactionPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.transaction_report.actions.btn_filter_yesterday');
  }
  filterLast7DaysFinanceTransactionPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.transaction_report.actions.btn_filter_last_7_days');
  }
  filterLast30DaysFinanceTransactionPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.transaction_report.actions.btn_filter_last_30_days');
  }
  viewDetailsFinanceTransactionPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.transaction_report.actions.btn_view_transaction_detail');
  }
  resetFinanceTransactionPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.transaction_report.actions.btn_reset');
  }

  // Finance > Balance Report
  exportCsvFinanceBalanceReportPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.balance_report.actions.btn_export_csv');
  }
  resetFinanceBalanceReportPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.balance_report.actions.btn_reset');
  }
  filterTodayFinanceBalanceReportPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.balance_report.actions.btn_filter_today');
  }
  filterYesterdayFinanceBalanceReportPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.balance_report.actions.btn_filter_yesterday');
  }
  filterLast7DaysFinanceBalanceReportPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.balance_report.actions.btn_filter_last_7_days');
  }
  filterLast30DaysFinanceBalanceReportPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.balance_report.actions.btn_filter_last_30_days');
  }
  viewBalanceDetailFinanceBalanceReportPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'finance.balance_report.actions.btn_view_transaction_detail');
  }

  // Candidate Student Card
  editPermCandidate() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.edit_perm');
  }

  // Candidate > commentaries
  addCommentCandidateCommentariesPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'candidate.commentaries.actions.btn_add_comment');
  }
  deleteCommentCandidateCommentariesPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'candidate.commentaries.actions.btn_delete_comment');
  }
  editCommentCandidateCommentariesPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'candidate.commentaries.actions.btn_edit_comment');
  }
  replyCommentCandidateCommentariesPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'candidate.commentaries.actions.btn_reply_comment');
  }
  resetCandidateCommentariesPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'candidate.commentaries.actions.btn_reset');
  }
  // Intake Channel - Setting Registration profile
  addRegistrationProfile() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.registration_profile.actions.btn_add_registration_profile');
  }
  exportRegistrationProfile() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.registration_profile.actions.btn_add_export');
  }
  resetRegistrationProfile() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.registration_profile.actions.btn_reset');
  }
  editRegistrationProfile() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.registration_profile.actions.btn_edit');
  }
  deleteRegistrationProfile() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.registration_profile.actions.btn_delete');
  }
  // Intake Channel - Registration Profile
  deleteRegistrationProfilePerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission
      ? this.isManualPermission
      : _.get(data, 'intake_channel.registration_profile.actions.btn_delete_registration_profile');
  }

  editRegistrationProfilePerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission
      ? this.isManualPermission
      : _.get(data, 'intake_channel.registration_profile.actions.btn_edit_registration_profile');
  }

  addRegistrationProfilePerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission
      ? this.isManualPermission
      : _.get(data, 'intake_channel.registration_profile.actions.btn_add_registration_profile');
  }

  exportCsvRegistrationProfilePerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.registration_profile.actions.btn_export_csv');
  }

  resetRegistrationProfilePerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.registration_profile.actions.btn_reset');
  }
  // Intake Channel - Setting Legal Entity
  addSettingLegalEntity() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.legal_entities.actions.btn_add_legal_entity');
  }
  exportSettingLegalEntity() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.legal_entities.actions.btn_export_csv');
  }
  resetSettingLegalEntity() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.legal_entities.actions.btn_reset');
  }
  editSettingLegalEntity() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.legal_entities.actions.btn_edit_legal_entity');
  }
  deleteSettingLegalEntity() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.legal_entities.actions.btn_delete_legal_entity');
  }
  viewSettingLegalEntity() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.legal_entities.actions.btn_view_legal_entity');
  }
  publishSettingLegalEntity() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.legal_entities.actions.btn_publish_or_unpublish_legal_entity');
  }

  // Intake Channel - Legal Entity
  deleteLegalEntityPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.legal_entities.actions.btn_delete_legal_entity');
  }

  publishUnpublisLegalEntityPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission
      ? this.isManualPermission
      : _.get(data, 'intake_channel.legal_entities.actions.btn_publish_or_unpublish_legal_entity');
  }

  viewLegalEntityPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.legal_entities.actions.btn_view_legal_entity');
  }

  addLegalEntityPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.legal_entities.actions.btn_add_legal_entity');
  }

  exportCsvLegalEntityPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.legal_entities.actions.btn_export_csv');
  }

  resetLegalEntityPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.legal_entities.actions.btn_reset');
  }

  // Intake Channel - Accounting
  addPaidLeaveAllowanceAccountingPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission
      ? this.isManualPermission
      : _.get(data, 'intake_channel.accounting_tab.actions.btn_add_paid_leave_allowance');
  }

  addInducedHoursCoefficientAccountingPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission
      ? this.isManualPermission
      : _.get(data, 'intake_channel.accounting_tab.actions.btn_add_induced_hours_coefficient');
  }

  connectLegalEntityAccountingPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission
      ? this.isManualPermission
      : _.get(data, 'intake_channel.accounting_tab.actions.btn_connect_legal_entity');
  }

  addAccountingNumberPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission
      ? this.isManualPermission
      : _.get(data, 'intake_channel.accounting_tab.actions.btn_add_acounting_number');
  }

  addAnalyticalCodeAccountingPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.accounting_tab.actions.btn_add_analytical_code');
  }

  exportCsvAccountingPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.accounting_tab.actions.btn_export_csv');
  }

  resetAccountingPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.accounting_tab.actions.btn_reset');
  }

  // Intake channel v2 - Addtional Cost
  showAddtionalCostPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.additional_expense.show_perm');
  }

  exportAddtionalCostPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.additional_expense.actions.btn_export_additional_expense');
  }

  addNewAddtionalCostPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.additional_expense.actions.btn_add_additional_expense');
  }

  resetAddtionalExpensePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.additional_expense.actions.btn_reset');
  }

  editAddtionalCostPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.additional_expense.actions.btn_edit_additional_expense');
  }

  deleteAddtionalCostPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.additional_expense.actions.btn_delete_additional_expense');
  }

  // ***************** End of ERP_023 User Management & User Type ************************

  // ***************** Start of ERP_Intake Channel Speciality ************************
  addSpecialityPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.speciality.actions.btn_add_speciality');
  }
  deleteSpecialityPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.speciality.actions.btn_delete_speciality');
  }
  editSpecialityPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.speciality.actions.btn_edit_speciality');
  }
  exportSpecialityPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.speciality.actions.btn_export_csv');
  }
  resetSpecialityPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.speciality.actions.btn_reset');
  }
  // ***************** End of ERP_Intake Channel Speciality ************************

  // ***************** Start of ERP_Intake Channel level ************************
  addLevelPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.level.actions.btn_add_level');
  }
  resetLevelPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.level.actions.btn_reset');
  }
  deleteLevelPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.level.actions.btn_delete');
  }
  editLevelPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.level.actions.btn_edit');
  }
  // ***************** End of ERP_Intake Channel level ************************

  // ***************** Start of ERP_Intake Channel Site ************************
  addSitePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.site.actions.btn_add_site');
  }
  resetSitePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.site.actions.btn_reset');
  }
  deleteSitePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.site.actions.btn_delete');
  }
  editSitePerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.site.actions.btn_edit');
  }
  // ***************** End of ERP_Intake Channel Site ************************

  // ***************** Start of ERP_Intake Channel Sector ************************
  addSectorPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.sector.actions.btn_add_sector');
  }
  resetSectorPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.sector.actions.btn_reset');
  }
  deleteSectorPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.sector.actions.btn_delete_sector');
  }
  editSectorPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.sector.actions.btn_edit_sector');
  }
  exportSectorPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.sector.actions.btn_export_csv');
  }
  // ***************** End of ERP_Intake Channel Sector ************************

  // ***************** Start of ERP_Intake Channel Campus ************************
  addSiteCampus() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.campus.actions.btn_add_site_campus');
  }
  pinSiteCampus() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.campus.actions.btn_pin');
  }
  editSiteCampus() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.campus.actions.btn_edit');
  }
  deleteSiteCampus() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.campus.actions.btn_delete');
  }
  saveSiteCampus() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.campus.edit_perm');
  }
  addCampusPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.campus.actions.btn_pin');
  }
  deleteCampusPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.campus.actions.btn_edit');
  }
  editCampusPerm() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'intake_channel.campus.actions.btn_delete');
  }
  // ***************** End of ERP_Intake Channel Campus ************************

  // ***************** Start of ERP_Intake Channel Type of Formation ************************
  addTypeOfFormationPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.type_of_formation.actions.btn_add_type_of_formation');
  }
  deleteTypeOfFormationPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.type_of_formation.actions.btn_delete_type_of_formation');
  }
  editTypeofFormationPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.type_of_formation.actions.btn_edit_type_of_formation');
  }
  exportCsvTypeOfFormationPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.type_of_formation.actions.btn_export_csv');
  }
  resetTypeOfFormationPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'intake_channel.setting.type_of_formation.actions.btn_reset');
  }
  // ***************** End of ERP_Intake Channel Type of Formation ************************

  // ***************** Start of ERP_044 Readmission assignment ************************
  financialSituationInReadmissionAssignment() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.assignment.actions.btn_financial_situation');
  }
  templateImportInReadmissionAssignment() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.assignment.actions.btn_template_import');
  }
  importFileInReadmissionAssignment() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.assignment.actions.btn_import_file');
  }
  assignmentEditJuryDecision() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.assignment.actions.btn_edit_jury_decision');
  }
  assignmentEditProgramDesired() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.assignment.actions.btn_edit_program_desired');
  }
  assignmentAssignProgramMultiple() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.assignment.actions.btn_assign_program_multiple');
  }
  assignmentAssignProgram() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.assignment.actions.btn_assign_program');
  }
  assignmentSendEmail() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.assignment.actions.btn_send_email');
  }
  assignmentExport() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.assignment.actions.btn_export');
  }
  assignmentReset() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.assignment.actions.btn_reset');
  }
  assignmentViewStudentCard() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.assignment.actions.btn_view_student_card');
  }
  // ****************** End of ERP_044 Readmission assignment *************************

  // ****************** Start of ERP_044 Readmission follow up ************************
  followUpAssignRegistrationProfileMultiple() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.follow_up.actions.btn_assign_registration_profile_multiple');
  }
  followUpAdmissionEmailMultiple() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.follow_up.actions.btn_admission_email_multiple');
  }
  followUpSendEmailMultiple() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.follow_up.actions.btn_send_email_multiple');
  }
  followUpSendReminder() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.follow_up.actions.btn_send_reminder');
  }
  followUpEditJuryDecision() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.follow_up.actions.btn_edit_jury_decision');
  }
  followUpTransferToAnotherDevMultiple() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.follow_up.actions.btn_transfer_to_another_dev_multiple');
  }
  followUpAssignRegistrationProfile() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.follow_up.actions.btn_assign_registration_profile');
  }
  followUpAdmissionEmail() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.follow_up.actions.btn_admission_email');
  }
  followUpSendEmail() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.follow_up.actions.btn_send_email');
  }
  followUpExport() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.follow_up.actions.btn_export');
  }
  followUpReset() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.follow_up.actions.btn_reset');
  }
  followUpTransferToAnotherDev() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.follow_up.actions.btn_transfer_to_another_dev');
  }
  followUpTransferToAnotherProgram() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.follow_up.actions.btn_transfer_another_program');
  }
  followUpResendRegistrationEmail() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.follow_up.actions.btn_resend_registration_email');
  }
  followUpViewStudentCard() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.follow_up.actions.btn_view_student_card');
  }
  followUpViewAdmissionFile() {
    const data = this.getEntityPermission();
    return _.get(data, 'readmission.follow_up.actions.btn_view_admission_file');
  }

  allPermisionSearchShowPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'quick_search.show_perm');
  }
  allPermisionSearchUser() {
    const data = this.getEntityPermission();
    return _.get(data, 'quick_search.search_user');
  }
  allPermisionSearchStudent() {
    const data = this.getEntityPermission();
    return _.get(data, 'quick_search.search_student');
  }
  allPermisionSearchMentor() {
    const data = this.getEntityPermission();
    return _.get(data, 'quick_search.search_mentor');
  }
  allPermisionSearchSchool() {
    const data = this.getEntityPermission();
    return _.get(data, 'quick_search.search_school');
  }
  allPermisionSearchTeacher() {
    const data = this.getEntityPermission();
    return _.get(data, 'quick_search.search_teacher');
  }
  // ******************* End of ERP_044 Readmission follow up *************************

  studentsSendEmail() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.follow_up.actions.btn_send_email');
  }

  studentsAssignSequence() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.follow_up.actions.btn_assign_sequence');
  }

  studentsActions() {
    const data = this.getEntityPermission();
    const showSendEmail = this.studentsSendEmail();
    const showAssignSequence = this.studentsAssignSequence();
    const showActions = _.get(data, 'students.follow_up.show_perm') && (showSendEmail || showAssignSequence);
    return showActions;
  }

  studentsExport() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.follow_up.actions.btn_export');
  }
  studentsTrombinoscopeExport() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.trombinoscope.actions.btn_export_pdf');
  }
  // ****************** Start of ERP_062 Students - All Students ************************
  studentsAllStudentsEditPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.all_students.actions.edit_perm');
  }
  studentsAllStudentsExport() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.all_students.actions.btn_export');
  }
  studentsAllStudentsReset() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.all_students.actions.btn_reset');
  }
  studentsAllStudentsSendEmail() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.all_students.actions.btn_send_email');
  }
  studentsAllStudentsAddMultipleTags() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.all_students.actions.btn_add_multiple_tags');
  }
  studentsAllStudentsRemoveTags() {
    const data = this.getEntityPermission();
    return _.get(data, 'students.all_students.actions.btn_remove_multiple_tags');
  }
  studentCardTagShowPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.student_card.student_tag.show_perm');
  }
  studentCardTagEditPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.student_card.student_tag.edit_perm');
  }
  studentCardTagAddTag() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.student_card.student_tag.actions.btn_add_tag');
  }
  studentCardTagActionEditPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'candidate.student_card.student_tag.actions.btn_edit_perm');
  }

  allPermisionSearchTag() {
    const data = this.getEntityPermission();
    return _.get(data, 'quick_search.search_tag');
  }
  // ****************** END of ERP_062 Students - All Students ************************


  getAllUserTypes(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query {
            GetAllUserTypes(show_student_type: include_student) {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  getAllUserPermissionTable(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query {
            GetAllUserPermissionTable {
              menus {
                menu
                sub_menu {
                  name
                  permissions {
                    user_type_id {
                      _id
                    }
                    user_type_name
                    show_perm
                    edit_perm
                    home_page
                  }
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUserPermissionTable']));
  }

  // ***************** Start of ERP_002 Admissions ************************
  /* showAdmission() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'admission.show_perm');
  }*/
  // ***************** End of ERP_002 Admissions ************************

  // Process > Form Builder
  addTemplateProcessFormBuilderPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'process.form_builder.actions.btn_add_template');
  }
  resetProcessFormBuilderPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'process.form_builder.actions.btn_reset');
  }
  deleteTemplateProcessFormBuilderPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'process.form_builder.actions.btn_delete_template');
  }
  editTemplateProcessFormBuilderPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'process.form_builder.actions.btn_edit_template');
  }
  duplicateTemplateProcessFormBuilderPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'process.form_builder.actions.btn_duplicate_template');
  }

  // Hisotry > Notifications
  resetHistoryNotificationPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'history.notifications.actions.btn_reset');
  }
  filterTodayHistoryNotificationPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'history.notifications.actions.btn_filter_today');
  }
  filterYesterdayHistoryNotificationPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'history.notifications.actions.btn_filter_yesterday');
  }
  filterLast7DaysHistoryNotificationPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'history.notifications.actions.btn_filter_last_7_days');
  }
  filterLast30DaysHistoryNotificationPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'history.notifications.actions.btn_filter_last_30_days');
  }
  viewNotificationHistoryNotificationPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'history.notifications.actions.btn_view_notification');
  }

  // ***************** Start of ERP_016 Alumni ************************
  showAlumniSurveyOptionPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'process.alumni_survey.show_perm');
  }
  showAlumniCardAddAlumniPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'alumni.card.actions.btn_add_alumni');
  }
  showAlumniCardResetAlumniPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'alumni.card.actions.btn_reset');
  }
  showAlumniCardAddCommentPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'alumni.card.actions.btn_add_comment');
  }
  showAlumniCardSaveIdentityPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'alumni.card.actions.btn_save_identity');
  }
  showAlumniCardHistoryExprotPerm() {
    const data = this.getEntityPermission();
    return _.get(data, 'alumni.card.actions.btn_history_export');
  }
  // ***************** End of ERP_016 Alumni ************************

  teacherManagementFollowUpGenerateContract() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'teacher_management.teacher_follow_up.actions.btn_generate_contract');
  }
  teacherManagementFollowUpExport() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'teacher_management.teacher_follow_up.actions.btn_export');
  }
  teacherManagementFollowUpView() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'teacher_management.teacher_follow_up.actions.btn_view');
  }
  teacherManagementFollowUpGenerateContractAction() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'teacher_management.teacher_follow_up.actions.btn_generate_contract_action');
  }
  teacherManagementTeachersAddTypeOfIntervention() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'teacher_management.teachers_table.actions.btn_add_type_of_intervention');
  }
  teacherManagementTeachersExport() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'teacher_management.teachers_table.actions.btn_export');
  }
  teacherManagementTeachersEdit() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'teacher_management.teachers_table.actions.btn_edit');
  }
  teacherManagementTeachersDelete() {
    const data = this.getEntityPermission();
    return this.isManualPermission ? this.isManualPermission : _.get(data, 'teacher_management.teachers_table.actions.btn_delete');
  }
}
