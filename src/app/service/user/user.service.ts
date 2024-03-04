import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Cacheable } from 'ngx-cacheable';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { UserDialogData, UserDialogEntityData, RegisterUserResp, UserProfileData } from 'app/users/user.model';
import { NgxPermissionsService } from 'ngx-permissions';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // to renew username in navigation when we login as different user (incognito button)
  reloadCurrentUserSource = new BehaviorSubject<boolean>(false);
  reloadPhotoUserSource = new BehaviorSubject<boolean>(false);
  reloadCurrentUser$ = this.reloadCurrentUserSource.asObservable();
  reloadPhotoUser$ = this.reloadPhotoUserSource.asObservable();

  reloadCurrentUser(status: boolean) {
    this.reloadCurrentUserSource.next(status);
  }

  reloadPhotoUser(status: boolean) {
    this.reloadPhotoUserSource.next(status);
  }

  constructor(private httpClient: HttpClient, private apollo: Apollo, private permissions: NgxPermissionsService) {}

  getEntitiesName(): string[] {
    if (this.permissions.getPermission('PC School Director')) {
      return ['academic'];
    }
    return ['operator', 'academic', 'company', 'group_of_schools'];
  }

  getEntitiesNameToUserMenu(): string[] {
    return ['operator', 'academic', 'group_of_schools', 'company'];
  }

  getEntitiesNameForAcadir(): string[] {
    return ['academic'];
  }

  getSchoolType(): string[] {
    if (this.permissions.getPermission('PC School Director')) {
      return ['preparation_center'];
    }
    return ['certifier', 'preparation_center'];
  }

  getSchoolTypeForAcadir(): string[] {
    return ['preparation_center'];
  }

  getSchoolTypeForCertifier(): string[] {
    return ['certifier'];
  }

  getUserTypesByEntity(entityName: string): Observable<{ _id: string; name: string }[]> {
    return this.apollo
      .watchQuery<{ _id: string; name: string }[]>({
        query: gql`
        query GetUserTypesByEntity{
          GetAllUserTypes(entity: "${entityName}") {
            _id
            name
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  getUserTypesByEntitywithStudent(entityName: string): Observable<{ _id: string; name: string }[]> {
    return this.apollo
      .watchQuery<{ _id: string; name: string }[]>({
        query: gql`
        query GetUserTypesByEntitywithStudent{
          GetAllUserTypes(entity: "${entityName}", show_student_type: include_student) {
            _id
            name
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  getUserTypesByEntityEdh(): Observable<{ _id: string; name: string }[]> {
    return this.apollo
      .watchQuery<{ _id: string; name: string }[]>({
        query: gql`
          query GetAllUserTypes {
            GetAllUserTypes {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  getUserTypesForTutorial(): Observable<{ _id: string; name: string }[]> {
    return this.apollo
      .watchQuery<{ _id: string; name: string }[]>({
        query: gql`
          query GetUserTypesForTutorial {
            GetAllUserTypes(show_student_type: include_student) {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  getUserTypesGroupMail(): Observable<{ _id: string; name: string }[]> {
    return this.apollo
      .watchQuery<{ _id: string; name: string }[]>({
        query: gql`
          query GetUserTypesGroupMail {
            GetAllUserTypes(search: "") {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  getUserTypesAddTasks(): Observable<{ _id: string; name: string }[]> {
    return this.apollo
      .watchQuery<{ _id: string; name: string }[]>({
        query: gql`
          query GetUserTypesAddTasks {
            GetAllUserTypes(show_student_type: include_student) {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  getAllUserOperator(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllUserOperator {
            GetAllUsers(entity: operator) {
              _id
              last_name
              first_name
              civility
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getUserTypesByEntityAndSchoolType(entityName: string, schoolType: string): Observable<{ _id: string; name: string }[]> {
    return this.apollo
      .watchQuery<{ _id: string; name: string }[]>({
        query: gql`
        query {
          GetAllUserTypes(entity: "${entityName}", role:"${schoolType}") {
            _id
            name
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  getAllUserType(): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllUserTypes {
            GetAllUserTypes {
              _id
              name
              entity
            }
          }
        `,
      })
      .pipe(
        map((response) => {
          if (response.data) {
            return response.data['GetAllUserTypes'];
          }
        }),
      );
  }

  getAllUserTypeIncludeStudent(show_student_type): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllUserTypeIncludeStudent{
            GetAllUserTypes(show_student_type: ${show_student_type}) {
              _id
              name
              entity
            }
          }
        `,
      })
      .pipe(
        map((response) => {
          if (response.data) {
            return response.data['GetAllUserTypes'];
          }
        }),
      );
  }

  getAllUserTypeNames(): Observable<{ name: string }[]> {
    return this.apollo
      .query({
        query: gql`
          query {
            GetAllUserTypes(search: "") {
              _id
              name_with_entity
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  getAllUserTypeDropdown(): Observable<{ name: string }[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllUserTypes {
            GetAllUserTypes(search: "") {
              _id
              name_with_entity
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  getAllUserTypePCStudentDropdown(entityName, role): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllUserTypePCStudentDropdown{
            GetAllUserTypes(entity: "${entityName}", role: "${role}", show_student_type: include_student) {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  getAllTypeUserMenu(search): Observable<{ name: string }[]> {
    return this.apollo
      .query({
        query: gql`
          query {
            GetAllUserTypes(search: "${search}") {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  getAllUserTypeExcludeComp(): Observable<{ name: string }[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllUserTypes {
            GetAllUserTypes(exclude_company: true, search: "") {
              _id
              name_with_entity
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  getAllUserTypeForUser(schoolType): Observable<{ name: string }[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllUserTypes{
            GetAllUserTypes(exclude_company: true, search: "", role:"${schoolType}") {
              _id
              name_with_entity
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  getAllUserTypeNonOp(schoolType): Observable<{ name: string }[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllUserTypes{
            GetAllUserTypes(search: "", role:"${schoolType}") {
              _id
              name_with_entity
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  getAllUserTypeNonOpEntity(schoolType): Observable<{ name: string }[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllUserTypeNonOpEntity{
            GetAllUserTypes(role:"${schoolType}", show_student_type: include_student) {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  getAllUserTypeStaff(): Observable<{ name: string }[]> {
    return this.apollo
      .query({
        query: gql`
          query {
            GetAllUserTypes(exclude_company: true, search: "") {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  registerUser(payload: any, loggin_user_id?, user_type_id?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation registerUser($lang: String!, $userInput: UserInput, $loggin_user_id: ID, $user_type_id: ID) {
            RegisterUser(lang: $lang, user_input: $userInput, loggin_user_id: $loggin_user_id, user_type_id: $user_type_id) {
              _id
              civility
              first_name
              last_name
              email
            }
          }
        `,
        variables: {
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
          userInput: payload,
          loggin_user_id: loggin_user_id ? loggin_user_id : null,
          user_type_id: user_type_id ? user_type_id : null,
        },
      })
      .pipe(map((resp) => resp.data['RegisterUser']));
  }

  registerUserInternship(payload: any, loggin_user_id?, user_type_id?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation registerUser($lang: String!, $userInput: UserInput,$user_type_id: ID) {
            RegisterUser(lang: $lang, user_input: $userInput, loggin_user_id: ${loggin_user_id}, user_type_id: $user_type_id) {
              _id
              civility
              first_name
              last_name
              email
            }
          }
        `,
        variables: {
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
          userInput: payload,
          loggin_user_id: loggin_user_id ? loggin_user_id : null,
          user_type_id: user_type_id ? user_type_id : null,
        },
      })
      .pipe(map((resp) => resp.data['RegisterUser']));
  }

  updateUser(id: string, payload: any, user_type_id?): Observable<{ email: string }> {
    return this.apollo
      .mutate<{ email: string }>({
        mutation: gql`
          mutation UpdateUser($id: ID!, $lang: String!, $inputUser: UserInput!, $user_type_id: ID) {
            UpdateUser(_id: $id, lang: $lang, user_input: $inputUser, user_type_id: $user_type_id) {
              email
            }
          }
        `,
        variables: {
          id: id,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
          inputUser: payload,
          user_type_id: user_type_id ? user_type_id : null,
        },
      })
      .pipe(
        map((resp: any) => {
          if (resp.errors) {
            throw new Error(resp.errors.message);
          } else {
            return resp.data['UpdateUser'];
          }
        }),
      );
  }

  MakeUserAsCompanyMember(user_id: string, payload: any): Observable<{ email: string }> {
    return this.apollo
      .mutate<{ email: string }>({
        mutation: gql`
          mutation MakeUserAsCompanyMember($user_id: ID!, $entities: [EntityInput!]) {
            MakeUserAsCompanyMember(user_id: $user_id, entities: $entities) {
              _id
            }
          }
        `,
        variables: {
          user_id: user_id,
          entities: payload,
        },
      })
      .pipe(
        map((resp: any) => {
          if (resp.errors) {
            throw new Error(resp.errors.message);
          } else {
            return resp.data['MakeUserAsCompanyMember'];
          }
        }),
      );
  }

  registerUserExisting(payload: any, loggin_user_id?, user_type_id?): Observable<RegisterUserResp> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation registerUser($lang: String!, $userInput: UserInput,$user_type_id: ID) {
            RegisterUser(lang: $lang, user_input: $userInput, delete_user_and_create: true, loggin_user_id: "${loggin_user_id}", user_type_id: $user_type_id) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,
        variables: {
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
          userInput: payload,
          user_type_id: user_type_id ? user_type_id : null,
        },
      })
      .pipe(map((resp) => resp.data['RegisterUser']));
  }

  updateUserExisting(id: string, payload: any, user_type_id?): Observable<any> {
    return this.apollo
      .mutate<{ email: string }>({
        mutation: gql`
          mutation UpdateUserExisting($id: ID!, $lang: String!, $inputUser: UserInput!, $user_type_id: ID) {
            UpdateUser(_id: $id, lang: $lang, user_input: $inputUser, reactivate_deleted_user: true, user_type_id: $user_type_id) {
              _id
              email
            }
          }
        `,
        variables: {
          id: id,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
          inputUser: payload,
          user_type_id: user_type_id ? user_type_id : null,
        },
      })
      .pipe(
        map((resp: any) => {
          if (resp.errors) {
            throw new Error(resp.errors.message);
          } else {
            return resp.data['UpdateUser'];
          }
        }),
      );
  }

  inactiveEmail(lang: string, id: string): Observable<{ email: string }> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation incorrectEmail($lang: String, $id: ID) {
            IncorrectEmail(lang: $lang, user_id: $id) {
              email
            }
          }
        `,
        variables: { lang: lang, id: id },
      })
      .pipe(map((resp) => resp.data['IncorrectEmail']));
  }

  deleteUser(userId: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation deleteUser($id: ID!) {
            DeleteUser(_id: $id) {
              email
            }
          }
        `,
        variables: { id: userId },
        errorPolicy: 'all',
      })
      .pipe(map((resp) => resp));
  }

  verifyEmail(email: string, is_validate_email?) {
    return this.apollo
      .query({
        query: gql`
        query GetOneUser($is_validate_email: Boolean){
          GetOneUser(email: "${email}",is_validate_email:$is_validate_email) {
            _id
            incorrect_email
          }
        }
      `,
        variables: {
          is_validate_email,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneUser']));
  }

  getOneUserDataForIdentityForm(userId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetOneUserDataForIdentityForm{
          GetOneUser(_id: "${userId}") {
            _id
            civility
            first_name
            last_name
            email
            position
            office_phone
            portable_phone
            profile_picture
            phone_number_indicative
            entities {
              type {
                _id
                name
              }
            }
            user_addresses {
              address
              postal_code
              country
              city
              department
              region
              is_main_address
            }
            curriculum_vitae {
              name
              file_path
              s3_path
            }
            signature {
              name
              s3_path
            }
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneUser']));
  }

  getUserDialogData(userId: string): Observable<UserDialogData> {
    return this.apollo
      .watchQuery<UserDialogData>({
        query: gql`
        query GetUserDialogData{
          GetOneUser(_id: "${userId}") {
            _id
            civility
            first_name
            last_name
            email
            position
            office_phone
            direct_line
            portable_phone
            phone_number_indicative
            curriculum_vitae {
              name
              file_path
              s3_path
            }
            entities {
              entity_name
              school_type
              group_of_school {
                _id
                group_name
              }
              school {
                _id
                short_name
              }
              assigned_rncp_title {
                _id
                short_name
              }
              class {
                _id
              }
              type {
                _id
              }
              companies {
                _id
                company_name
              }
            }
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneUser']));
  }

  getUserById(id: string): Observable<UserDialogData> {
    return this.apollo
      .watchQuery<UserDialogData>({
        query: gql`
        query GetUserById{
          GetOneUser(_id: "${id}") {
            _id
            civility
            first_name
            last_name
            email
            position
            office_phone
            direct_line
            portable_phone
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneUser']));
  }

  getUserEntitiesForTable(userId: string): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query GetUserEntitiesForTable{
          GetOneUser(_id: "${userId}") {
            _id
            email
            entities {
              entity_name
              school {
                _id
                short_name
              }
              campus {
                _id
                name
              }
              level {
                _id
                name
              }
              type {
                _id
                  name
              }
              programs{
                campus{
                  _id
                  name
                }
                school{
                  _id
                  short_name
                }
                level{
                  _id
                  name
                }
              }
            }
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneUser']));
  }

  getUserEntities(email: string): Observable<UserDialogEntityData[]> {
    return this.apollo
      .watchQuery<UserDialogEntityData[]>({
        query: gql`
        query GetUserEntities{
          GetOneUser(email: "${email}") {
            email
            entities {
              entity_name
              school_type
              group_of_schools {
                _id
              }
              school {
                _id
              }
              assigned_rncp_title {
                _id
              }
              class {
                _id
              }
              type {
                _id
                  name
              }
            }
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneUser']));
  }

  getUserProfileData(email: string): Observable<UserProfileData> {
    return this.apollo
      .query<UserProfileData>({
        query: gql`
        query GetUserProfileData{
          GetOneUser(email: "${email}") {
            _id
            student_id {
              _id
            }
            civility
            first_name
            last_name
            email
            position
            office_phone
            direct_line
            portable_phone
            profile_picture
            entities {
              entity_name
              school_type
              group_of_schools {
                _id
                short_name
              }
              school {
                _id
                short_name
              }
              assigned_rncp_title {
                _id
                short_name
              }
              class {
                _id
                name
              }
              type {
                _id
                name
              }
            }
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneUser']));
  }

  getOneUserForMicrosoft(_id: string): Observable<UserProfileData> {
    return this.apollo
      .query<UserProfileData>({
        query: gql`
        query GetOneUserForMicrosoft{
          GetOneUser(_id: "${_id}") {
            _id
            student_id {
              _id
            }
            civility
            first_name
            last_name
            email
            position
            office_phone
            direct_line
            portable_phone
            profile_picture
            entities {
              entity_name
              school_type
              group_of_schools {
                _id
                short_name
              }
              school {
                _id
                short_name
              }
              assigned_rncp_title {
                _id
                short_name
              }
              class {
                _id
                name
              }
              type {
                _id
                name
                usertype_permission_id {
                  _id
                  user_type_name
                  status
                  news {
                    show_perm
                    all_news{
                      show_perm
                      edit_perm
                      action{
                        btn_reset
                      }
                    }
                    manage_news{
                      show_perm
                      edit_perm
                      action{
                        btn_reset
                      }
                    }
                  }
                  quick_search {
                    show_perm
                    search_user
                    search_student
                    search_mentor
                    search_school
                    search_teacher
                    search_tag
                  }
                  companies {
                    show_perm
                    edit_perm
                    add_company
                    delete_perm
                    organization {
                      show_perm
                      add_organization {
                        show_perm
                      }
                      edit_organization {
                        show_perm
                      }
                      delete_organization {
                        show_perm
                      }
                      organization_details {
                        show_perm
                      }
                      contact {
                        show_perm
                        add_contact {
                          show_perm
                        }
                        edit_contact {
                          show_perm
                        }
                        delete_contact {
                          show_perm
                        }
                      }
                    }
                    company_details {
                      company_detail {
                        show_perm
                        revision_perm
                        edit_perm
                      }
                      company_staff {
                        show_perm
                        edit_perm
                        add_perm
                        actions {
                          edit_perm
                          send_email
                          delete_perm
                        }
                      }
                      connected_school {
                        show_perm
                        edit_perm
                        connect_school
                        actions {
                          connect_mentor_to_School
                          delete_perm
                        }
                      }
                    }
                    company_entity {
                      show_perm
                      edit_perm
                      edit_company {
                        show_perm
                        edit_perm
                      }
                      add_company {
                        show_perm
                        edit_perm
                      }
                      note {
                        add_note
                        edit_perm
                      }
                      history_company {
                        show_perm
                        edit_perm
                      }
                      note_company {
                        show_perm
                        edit_perm
                      }
                      member_company {
                        show_perm
                        edit_perm
                      }
                      branch_company {
                        show_perm
                        edit_perm
                      }
                      internship_company {
                        show_perm
                        edit_perm
                      }
                      connect_school {
                        show_perm
                        edit_perm
                      }
                    }
                    company_branch {
                      show_perm
                      edit_perm
                      edit_company {
                        show_perm
                        edit_perm
                      }
                      add_company {
                        show_perm
                        edit_perm
                      }
                      note {
                        add_note
                      }
                      history_company {
                        show_perm
                        edit_perm
                      }
                      note_company {
                        show_perm
                        edit_perm
                      }
                      member_company {
                        show_perm
                        edit_perm
                      }
                      branch_company {
                        show_perm
                        edit_perm
                      }
                      internship_company {
                        show_perm
                        edit_perm
                      }
                      connect_school {
                        show_perm
                        edit_perm
                      }
                      company_staff {
                        show_perm
                        edit_perm
                        add_perm
                        actions {
                          edit_perm
                          send_email
                          delete_perm
                        }
                      }
                    }
                    mentors {
                      show_perm
                    }
                  }
                  tasks {
                    show_perm
                    add_task
                    internal_task
                    add_test_task
                    actions {
                      delete_task
                      edit_perm
                    }
                  }
                  mailbox {
                    show_perm
                    edit_perm
                    inbox
                    sent
                    important
                    draft
                    trash
                    actions {
                      download_email
                      urgent_message
                      mail_to_group
                      compose
                      important
                      delete
                    }
                  }
                  users {
                    show_perm
                    edit_perm
                    add_perm
                    export
                    transfer_responsibility
                    actions {
                      incognito
                      error_email
                      delete_perm
                      edit_perm
                      send_email
                      reminder_reg_user
                      btn_transfer_another_dev
                      btn_transfer_another_program
                      btn_view_student_card
                      btn_view_admission_file
                      btn_resend_registration_email
                      btn_reset
                    }
                  }
                  tutorials {
                    show_perm
                    edit_perm
                    tutorial_table
                    add_perm
                    actions {
                      view_perm
                      edit_perm
                      delete_perm
                      send
                    }
                    inapp_tutorials {
                      show_perm
                      edit_perm
                      actions{
                        btn_add_tutorial
                        btn_reset
                        btn_delete_tutorial
                        btn_view_tutorial
                        btn_publish_tutorial
                      }
                    }
                  }
                  candidate {
                    commentaries {
                      actions{
                        btn_add_comment
                      }
                    }
                    student_card {
                      student_tag {
                        show_perm
                        edit_perm
                        actions {
                          btn_add_tag
                          btn_edit_perm
                        }
                      }
                    }
                    follow_up_contract {
                      edit_perm
                      show_perm
                      actions{
                        btn_add_contract
                        btn_send_email
                        btn_send_reminder
                        btn_view_student_card
                        btn_view_admission_contract
                      }
                    }
                    candidate_tab {
                      show_perm
                      edit_perm
                      connect_as
                    }
                    candidate_history {
                      show_perm
                      edit_perm
                    }
                    admission_member {
                      show_perm
                      edit_perm
                    }
                    mentor {
                      show_perm
                      edit_perm
                    }
                    my_note {
                      show_perm
                      edit_perm
                    }
                    oscar_campus {
                      show_perm
                      edit_perm
                      oscar_import_button {
                        show_perm
                        edit_perm
                      }
                      hubspot_import_button {
                        show_perm
                        edit_perm
                      }
                      actions {
                        btn_import
                        btn_assign_program
                        btn_get_oscar_student
                        btn_export
                        btn_reset
                      }
                    }
                    hubspot {
                      show_perm
                      edit_perm
                      oscar_import_button {
                        show_perm
                        edit_perm
                      }
                      hubspot_import_button {
                        show_perm
                      }
                      actions {
                        btn_assign_program
                        btn_get_hubspot_student
                        btn_export
                        btn_reset
                      }
                    }
                    follow_up_continuous {
                        show_perm
                        actions{
                          btn_crm_ok
                          btn_assign_registration_profile_multiple
                          btn_1st_call_done_multiple
                          btn_1st_email_of_annoucment_multiple
                          btn_transfer_to_another_dev_multiple
                          btn_send_email_multiple
                          btn_reset
                          btn_export_csv
                          btn_assign_registration_profile
                          btn_1st_email_of_annoucment
                          btn_1st_call_done
                          btn_send_email
                          btn_transfer_to_another_dev
                          btn_view_student_card
                          btn_view_admission_file
                          btn_resend_registration_email
                          btn_transfer_another_program
                        }
                      }
                    show_perm
                    edit_perm
                    actions {
                      report_inscription {
                        show_perm
                      }
                      btn_assign_registration_profile_multiple
                      btn_1st_call_done_multiple
                      btn_1st_email_of_annoucment_multiple
                      btn_transfer_to_another_dev
                      btn_crm_ok
                      btn_assign_registration_profile
                      btn_1st_call_done
                      btn_1st_email_of_annoucment
                      btn_transfer_to_another_dev_multiple
                      btn_send_email_multiple
                      btn_export_csv
                      btn_reset
                      btn_send_email
                      btn_transfer_another_program
                      btn_view_student_card
                      btn_view_admission_file
                      btn_resend_registration_email
                    }
                    edit_perm
                    candidate_dashboard {
                      show_perm
                      edit_perm
                    }
                  }
                  intake_channel {
                    intake_channel {
                      show_perm
                      edit_perm
                    }
                    scholar_season {
                      show_perm
                      edit_perm
                      actions{
                        btn_add_scholar_season
                        btn_reset
                        btn_publish
                        btn_edit
                        btn_delete
                      }
                    }
                    school {
                      show_perm
                      edit_perm
                      actions {
                        btn_delete_school
                        btn_edit_school
                        btn_add_school
                        btn_export_csv
                        btn_reset
                      }
                      program {
                        show_perm
                        edit_perm
                        actions{
                          btn_reset
                          btn_export_csv
                          btn_add_program
                          btn_delete_program
                        }
                      }
                      down_payment {
                        show_perm
                        edit_perm
                        actions {
                          btn_export_csv
                          btn_import_down_payment
                        }
                      }
                      full_rate {
                        show_perm
                        edit_perm
                        actions {
                          btn_export_csv
                          btn_import_full_rate
                        }
                      }
                      legal{
                        show_perm
                        edit_perm
                        actions {
                          btn_reset
                          btn_export_csv
                          btn_connect_legal_entity
                          btn_paid_allowance_rate
                          btn_induced_hours
                        }
                      }
                      admission{
                        show_perm
                        edit_perm
                        actions {
                          btn_reset
                          btn_export_csv
                          btn_add_condition_multiple
                          btn_remove_registration_profile
                          btn_add_registration_profile
                        }
                      }
                      course_sequence{
                        show_perm
                        edit_perm
                        actions {
                          btn_reset
                          btn_connect_template
                          btn_details
                        }
                      }
                    }
                    level {
                      show_perm
                      edit_perm
                      actions {
                        btn_edit
                        btn_delete
                        btn_add_level
                        btn_reset
                      }
                    }
                    sector {
                      show_perm
                      edit_perm
                      actions {
                        btn_edit_sector
                        btn_delete_sector
                        btn_add_sector
                        btn_export_csv
                        btn_reset
                      }
                    }
                    site {
                      show_perm
                      edit_perm
                      actions {
                        btn_edit
                        btn_delete
                        btn_add_site
                        btn_reset
                      }
                    }
                    campus {
                      show_perm
                      edit_perm
                      actions {
                        btn_pin
                        btn_edit
                        btn_delete
                        btn_add_site_campus
                      }
                    }
                    full_rate {
                      show_perm
                      edit_perm
                      actions {
                        btn_edit_mode
                        btn_import
                        btn_export
                      }
                    }
                    speciality {
                      show_perm
                      edit_perm
                      actions {
                        btn_delete_speciality
                        btn_edit_speciality
                        btn_add_speciality
                        btn_export_csv
                        btn_reset
                      }
                    }
                    payment_terms {
                      show_perm
                      edit_perm
                    }
                    pricing_profile {
                      show_perm
                      edit_perm
                    }
                    show_perm
                    edit_perm
                    setting {
                      show_perm
                      edit_perm
                      additional_expense {
                        show_perm
                        edit_perm
                        actions {
                          btn_add_additional_expense
                          btn_export_additional_expense
                          btn_edit_additional_expense
                          btn_delete_additional_expense
                          btn_reset
                        }
                      }
                      type_of_formation{
                        actions{
                          btn_reset
                          btn_export_csv
                          btn_add_type_of_formation
                          btn_edit_type_of_formation
                          btn_delete_type_of_formation
                        }
                      }
                      payment_mode {
                        actions{
                          btn_reset
                          btn_export_csv
                          btn_add_payment_mode
                          btn_edit_payment_mode
                          btn_delete_payment_mode
                        }
                      }
                      registration_profile {
                        actions{
                          btn_reset
                          btn_add_registration_profile
                          btn_edit
                          btn_delete
                          btn_add_export
                        }
                      }
                      legal_entities{
                        actions{
                          btn_reset
                          btn_export_csv
                          btn_add_legal_entity
                          btn_edit_legal_entity
                          btn_delete_legal_entity
                          btn_view_legal_entity
                          btn_publish_or_unpublish_legal_entity
                        }
                      }
                    }
                  }
                  setting {
                    user_permission {
                      show_perm
                    }
                    import_objective {
                      show_perm
                      edit_perm
                    }
                    import_objective_finance {
                      show_perm
                      edit_perm
                    }
                    import_finance_n1 {
                      show_perm
                      edit_perm
                    }
                    external_promotion {
                      show_perm
                      edit_perm
                      actions {
                        btn_delete_diapos_external
                        btn_edit_diapos_external
                        btn_add_diapos_external
                        btn_view_diapos_external
                        btn_send_email
                        btn_duplicate_diapos_external
                        btn_publish_diapos_external
                        btn_export_csv
                        btn_reset
                      }
                    }
                    message_step {
                      show_perm
                      edit_perm
                      actions {
                        btn_delete_message_step
                        btn_edit_message_step
                        btn_add_message_step
                        btn_view_message_step
                        btn_send_email
                        btn_duplicate_message_step
                        btn_publish_message_step
                        btn_export_csv
                        btn_reset
                      }
                    }
                    cels_segmentation {
                      show_perm
                      edit_perm
                    }
                    cels_action {
                      show_perm
                      edit_perm
                    }
                    notification_management {
                      show_perm
                      edit_perm
                      actions {
                        btn_edit_notification
                        btn_reset
                        btn_delete_template
                        btn_edit_template
                        btn_add_template
                        btn_view_template
                        btn_reset_template
                      }
                    }
                    show_perm
                    edit_perm
                  }
                  history {
                    notifications {
                      show_perm
                      actions {
                        btn_reset
                        btn_filter_today
                        btn_filter_yesterday
                        btn_filter_last_7_days
                        btn_filter_last_30_days
                        btn_view_notification
                      }
                    }
                    show_perm
                  }
                  finance {
                    unbalanced_balance {
                      show_perm
                      edit_perm
                      actions {
                        btn_export
                        btn_reset
                        send_school_contract_amendment
                      }
                    }
                    operation_lines {
                      show_perm
                      edit_perm
                      not_exported {
                        show_perm
                        edit_perm
                        actions {
                          export_sage
                          export_lines_to_export
                          export_lines_exported
                          export_all_lines
                          btn_reset
                        }
                      }
                      exported {
                        show_perm
                        edit_perm
                        btn_reset
                      }
                    }
                    timeline_template{
                      show_perm
                      create_timeline_template{
                        show_perm
                      }
                      edit_timeline_template{
                        show_perm
                      }
                      delete_timeline_template{
                        show_perm
                      }
                    }
                    general {
                      show_perm
                      edit_perm
                    }
                    cash_in {
                      show_perm
                      edit_perm
                    }
                    payment {
                      show_perm
                      edit_perm
                    }
                    follow_up {
                      show_perm
                      edit_perm
                      actions {
                        btn_generate_billing
                        btn_send_mail_multiple
                        add_payment
                        btn_view_student_card
                        btn_edit_term
                        btn_send_email
                        btn_export
                        btn_reset
                        btn_asking_payment
                      }
                    }
                    member {
                      show_perm
                      edit_perm
                    }
                    history {
                      show_perm
                      edit_perm
                      actions {
                        btn_reconciliation
                        btn_lettrage
                        btn_see_student_file
                        btn_create_internal_task
                        btn_send_email
                        btn_export_csv
                        btn_reset
                        btn_filter_today
                        btn_filter_yesterday
                        btn_filter_last_7_days
                        btn_filter_last_30_days
                        btn_filter_this_month
                      }
                    }
                    reconciliation_letterage {
                      show_perm
                      edit_perm
                    }
                    cheque {
                      show_perm
                      edit_perm
                    }
                    transaction_report {
                      show_perm
                      edit_perm
                      actions {
                        btn_export_csv
                        btn_reset
                        btn_filter_today
                        btn_filter_yesterday
                        btn_filter_last_7_days
                        btn_filter_last_30_days
                        btn_view_transaction_detail
                      }
                    }
                    balance_report {
                      show_perm
                      edit_perm
                      actions {
                        btn_export_csv
                        btn_reset
                        btn_filter_today
                        btn_filter_yesterday
                        btn_filter_last_7_days
                        btn_filter_last_30_days
                        btn_view_transaction_detail
                      }
                    }
                    follow_up_organization {
                      show_perm
                      edit_perm
                      actions{
                        btn_generate_billing
                        btn_send_mail_multiple
                        btn_assign_timeline_multiple
                        btn_export
                        btn_reset
                        btn_send_email
                        add_payment
                        btn_view_student_card
                        btn_edit_term
                        btn_assign_timeline
                      }
                    }
                    master_table_transaction {
                      show_perm
                      actions {
                        btn_export
                        btn_view_transaction
                        btn_view_detail
                        btn_view_student_card
                      }
                    }
                    show_perm
                    edit_perm
                  }
                  alumni {
                    follow_up {
                      show_perm
                      edit_perm
                      actions {
                        btn_export
                        btn_send_survey
                        btn_reset
                        btn_send_survey_multiple
                        btn_send_email
                        btn_view_alumni_card
                      }
                    }
                    member {
                      show_perm
                      edit_perm
                    }
                    card {
                      show_perm
                      edit_perm
                      actions {
                        btn_add_alumni
                        btn_reset
                        btn_add_comment
                        btn_save_identity
                        btn_history_export
                      }
                    }
                    trombinoscope {
                      show_perm
                      edit_perm
                    }
                    show_perm
                    edit_perm
                  }
                  internship {
                    internship_posting {
                      show_perm
                      edit_perm
                    }
                    internship_profile {
                      show_perm
                      edit_perm
                    }
                    candidature {
                      show_perm
                      edit_perm
                    }
                    agreement {
                      show_perm
                      edit_perm
                    }
                    show_perm
                    follow_up {
                      show_perm
                      edit_perm
                    }
                    setting {
                      show_perm
                    }
                    user {
                      show_perm
                    }
                    edit_perm
                  }
                  contracts {
                    show_perm
                    edit_perm
                    contract_process {
                      show_perm
                      edit_perm
                      actions {
                        btn_send_the_form
                        btn_template_for_import
                        btn_import_contract
                        btn_new_contract
                        btn_reset
                        btn_go_to_form
                        btn_edit_contract
                        btn_send_reminder
                        btn_send_email
                        btn_additional_document
                        btn_remove_contract
                      }
                    }
                  }
                  process {
                    show_perm
                    edit_perm
                    document {
                      show_perm
                      edit_perm
                      actions {
                        btn_add_template
                        btn_reset
                        btn_edit
                        btn_delete_template
                        btn_duplicate_template
                      }
                    }
                    form_builder {
                      show_perm
                      edit_perm
                      actions {
                        btn_add_template
                        btn_reset
                        btn_delete_template
                        btn_edit_template
                        btn_duplicate_template
                      }
                    }
                    alumni_survey {
                      show_perm
                      edit_perm
                    }
                  }
                  courses_sequences {
                    show_perm
                    edit_perm
                    btn_export {
                      show_perm
                    }
                    btn_reset {
                      show_perm
                    }
                    btn_add_subject {
                      show_perm
                    }
                    template{
                        create_perm
                        edit_perm
                        show_perm
                        export_perm
                        actions{
                          btn_reset
                          btn_delete
                          btn_duplicate
                        }
                      }
                      sequence{
                        create_perm
                        edit_perm
                        show_perm
                        export_perm
                        actions{
                          btn_reset
                          btn_delete
                          btn_duplicate
                        }
                      }
                      module{
                        create_perm
                        edit_perm
                        show_perm
                        export_perm
                        actions{
                          btn_reset
                          btn_delete
                          btn_template_import
                          btn_import_module
                        }
                      }
                      subject{
                        create_perm
                        edit_perm
                        show_perm
                        export_perm
                        actions{
                          btn_template_import
                          btn_import_subject
                          btn_reset
                          btn_delete
                        }
                      }
                  }
                  readmission {
                    show_perm
                    assignment {
                      show_perm
                      actions {
                        btn_edit_jury_decision
                        btn_edit_program_desired
                        btn_assign_program
                        btn_send_email
                        btn_export
                        btn_financial_situation
                        btn_template_import
                        btn_import_file
                        btn_assign_program_multiple
                        btn_reset
                        btn_assign_program
                        btn_view_student_card
                      }
                    }
                    follow_up {
                      show_perm
                      actions {
                        btn_assign_registration_profile
                        btn_admission_email
                        btn_send_email
                        btn_export
                        btn_assign_registration_profile_multiple
                        btn_admission_email_multiple
                        btn_send_email_multiple
                        btn_reset
                        btn_transfer_to_another_dev
                        btn_transfer_another_program
                        btn_view_student_card
                        btn_view_admission_file
                        btn_resend_registration_email
                        btn_edit_jury_decision
                        btn_send_reminder
                        btn_transfer_to_another_dev_multiple
                      }
                    }
                  }
                  students {
                    show_perm
                    edit_perm
                    export {
                      show_perm
                    }
                    follow_up {
                      show_perm
                      edit_perm
                      actions {
                        btn_reset
                        btn_send_email
                        btn_assign_sequence
                        btn_export
                      }
                    }
                    trombinoscope {
                      show_perm
                      edit_perm
                      actions {
                        btn_reset
                        btn_filter
                        btn_export_pdf
                      }
                    }
                    all_students {
                      show_perm
                      edit_perm
                      actions {
                        btn_export
                        btn_reset
                        btn_send_email
                        btn_add_multiple_tags
                        btn_remove_multiple_tags
                      }
                    }
                  }
                  form_follow_up {
                    show_perm
                    general_form_follow_up {
                      show_perm
                      edit_perm
                    }
                    admission_document_form_follow_up {
                      show_perm
                      edit_perm
                    }
                  }
                  teacher_management {
                    show_perm
                    teacher_follow_up {
                      show_perm
                      actions {
                        btn_generate_contract
                        btn_export
                        btn_view
                        btn_generate_contract_action
                      }
                    }
                    contract_process {
                      show_perm
                      actions {
                        btn_add_type_of_intervention
                        btn_export
                        btn_edit
                        btn_delete
                      }
                    }
                    teachers_table {
                      show_perm
                      actions {
                         btn_add_type_of_intervention
                         btn_export
                         btn_edit
                         btn_delete
                      }
                    }
                  }
                }
              }
            }
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneUser']));
  }

  getUserBySchoolId(school, classId?): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetUserBySchoolId{
            GetAllUsers(school: "${school}", ${classId ? `class_id: "${classId}"` : ``}) {
              _id
              first_name
              last_name
              civility
              email
              full_name
              entities {
                entity_name
                type {
                  name
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getAllUserAcadirFromSchool(schools, title, classId, user_type): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllUsers($title: [ID!], $schools: [ID], $user_type: [ID!]) {
            GetAllUsers(title: $title, schools: $schools, ${classId ? `class_id: "${classId}"` : ``}, user_type: $user_type) {
              _id
              first_name
              last_name
              civility
              email
              full_name
              entities {
                entity_name
                school {
                  _id
                  short_name
                }
                type {
                  name
                }
              }
            }
          }
        `,
        variables: {
          title: title ? title : '',
          schools: schools ? schools : '',
          user_type: user_type ? user_type : '',
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getUserAcademicByTitleId(title, classId?): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllUsers($title: [ID!]) {
            GetAllUsers(title: $title, entity: academic, show_student: include_student, ${classId ? `class_id: "${classId}"` : ``}) {
              _id
              first_name
              last_name
              civility
              email
              full_name
              entities {
                entity_name
                type {
                  name
                }
              }
            }
          }
        `,
        variables: {
          title: title ? title : '',
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getUserEdh(school, campuses?, levels?): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllUsers($school: ID, $campuses: [ID], $levels: [ID]) {
            GetAllUsers(school: $school, campuses: $campuses, levels: $levels) {
              _id
              first_name
              last_name
              civility
              email
              full_name
              entities {
                entity_name
                campus {
                  _id
                }
                level {
                  _id
                }
                type {
                  name
                }
              }
            }
          }
        `,
        variables: {
          school,
          campuses,
          levels,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getUserByTitleIdSchool(title, schools): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllUsers($title: [ID!], $schools: [ID]) {
            GetAllUsers(title: $title, schools: $schools, entity: academic, show_student: include_student) {
              _id
              first_name
              last_name
              civility
              email
              full_name
              entities {
                entity_name
                type {
                  name
                }
              }
            }
          }
        `,
        variables: {
          title: title ? title : '',
          schools: schools ? schools : '',
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getUserType(title, user_type): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllUsers($title: [ID!], $user_type: [ID!]) {
            GetAllUsers(title: $title, user_type: $user_type) {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,
        variables: {
          title: title ? title : '',
          user_type: user_type ? user_type : '',
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  updateUserEntities(_id: string, user_input: any, user_type_id: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateUserEntities($_id: ID!, $user_input: UserEntityInput!, $user_type_id: ID) {
            UpdateUserEntities(_id: $_id, user_input: $user_input, user_type_id: $user_type_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          user_input,
          user_type_id,
        },
      })
      .pipe(map((resp) => resp.data['UpdateUserEntities']));
  }

  getUserTypeStudent(title, user_type): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllUsers($title: [ID!], $user_type: [ID!]) {
            GetAllUsers(title: $title, user_type: $user_type, show_student: student_only) {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,
        variables: {
          title: title ? title : '',
          user_type: user_type ? user_type : '',
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getAllCandidates(filter): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllCandidates($filter: CandidateFilterInput) {
            GetAllCandidates(filter: $filter) {
              _id
              first_name
              last_name
              civility
              email
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  // *************** Query for Quick Search
  getStudentQuickSearch(filter): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllCandidates($filter: CandidateFilterInput) {
            GetAllCandidates(filter: $filter) {
              _id
              first_name
              last_name
              civility
              school {
                _id
                short_name
              }
            }
          }
        `,
        variables: {
          filter: filter,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getSchoolQuickSearch(filter = null, userTypeId, sorting = null): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllCandidateSchool($filter: CandidateSchoolFilterInput, $sorting: CandidateSchoolSortingInput) {
            GetAllCandidateSchool(filter: $filter, sorting: $sorting, user_type_id: "${userTypeId}") {
              _id
              short_name
            }
          }
        `,
        variables: {
          filter: filter,
          sorting: sorting,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }
  getAllStudentsQuickSearch(filter = null): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllStudents($filter: FilterStudent) {
            GetAllStudents(filter: $filter) {
              _id
              first_name
              last_name
              civility
              school {
                _id
                short_name
              }
              candidate_id {
                _id
              }
            }
          }
        `,
        variables: {
          filter: filter,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }
  getAllCandidateQuickSearch(filter = null, user_type_ids, sorting = null): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllCandidates($filter: CandidateFilterInput, $user_type_ids: [ID], $sorting: CandidateSortInput) {
            GetAllCandidates(filter: $filter, user_type_ids: $user_type_ids, sorting: $sorting) {
              _id
              first_name
              last_name
              civility
              program_status
              candidate_admission_status
              candidate_unique_number
              is_program_assigned
              school {
                _id
                short_name
              }
              user_id {
                _id
              }
              student_id {
                _id
                student_status
              }
            }
          }
        `,
        variables: {
          filter: filter,
          user_type_ids,
          sorting,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getTagQuickSearch(filter, user_type_ids, sorting = null): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllCandidates($filter: CandidateFilterInput, $user_type_ids: [ID], $sorting: CandidateSortInput) {
            GetAllCandidates(filter: $filter, user_type_ids: $user_type_ids, sorting: $sorting) {
              _id
              first_name
              last_name
              civility
              school {
                _id
                short_name
              }
              user_id {
                _id
              }
              student_id {
                _id
                student_status
              }
              tag_ids {
                _id
                name
              }
            }
          }
        `,
        variables: {
          filter: filter,
          user_type_ids,
          sorting,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  // find error in field entities > type > role
  getUserQuickSearch(full_name, schools = null, sorting = null, user_type): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllUsers($full_name: String, $schools: [ID!], $sorting: UserSorting, $user_type: [ID!]) {
            GetAllUsers(full_name: $full_name, schools: $schools, sorting: $sorting, user_type: $user_type) {
              _id
              first_name
              last_name
              civility
              entities {
                school {
                  _id
                  short_name
                }
                companies {
                  _id
                  company_name
                  school_ids {
                    _id
                    short_name
                  }
                }
                assigned_rncp_title {
                  _id
                  short_name
                }
                type {
                  _id
                  name
                }
                entity_name
              }
            }
          }
        `,
        variables: {
          full_name: full_name,
          schools: schools,
          sorting: sorting,
          user_type: user_type,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getMentorQuickSearch(last_name, user_type, sorting = null): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllUsers($last_name: String, $user_type: [ID!], $sorting: UserSorting) {
            GetAllUsers(last_name: $last_name, user_type: $user_type, sorting: $sorting) {
              _id
              first_name
              last_name
              civility
              entities {
                school {
                  _id
                  short_name
                }
                companies {
                  _id
                  company_name
                  school_ids {
                    _id
                    short_name
                  }
                }
                assigned_rncp_title {
                  _id
                  short_name
                }
                type {
                  _id
                  name
                }
                entity_name
              }
            }
          }
        `,
        variables: {
          last_name: last_name,
          user_type: user_type,
          sorting: sorting,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getAllUserTypeWithStudent(): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllUserTypes($show_student_type: EnumShowStudent) {
            GetAllUserTypes(show_student_type: $show_student_type) {
              _id
              name
              entity
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          show_student_type: 'include_student',
        },
      })
      .pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  getAllUserWithStudent(): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllUserTypes {
            GetAllUserTypes(exclude_company: true, search: "", show_student_type: include_student) {
              _id
              name
              name_with_entity
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  getUserBasedonSchoolandCampuses(school, campuses): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllUsers($school: ID, $campuses: [ID]) {
            GetAllUsers(school: $school, campuses: $campuses) {
              _id
              first_name
              civility
              last_name
              entities {
                assigned_rncp_title {
                  _id
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          school,
          campuses,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }
  getUserTypeStudentPrograms(user_type, programs): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllUsers($user_type: [ID!], $programs: [String]) {
            GetAllUsers(user_type: $user_type, show_student: student_only, programs: $programs) {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,
        variables: {
          user_type: user_type ? user_type : '',
          programs,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }
  getUserTypePrograms(programs, user_type): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllUsers($programs: [String], $user_type: [ID!]) {
            GetAllUsers(programs: $programs, user_type: $user_type) {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,
        variables: {
          user_type: user_type ? user_type : '',
          programs,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }
  getUserByProgram(programs): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllUsers($programs: [String]) {
            GetAllUsers(programs: $programs, show_student: include_student) {
              _id
              first_name
              last_name
              civility
              email
              full_name
              entities {
                entity_name
                type {
                  name
                }
              }
            }
          }
        `,
        variables: {
          programs,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }
  quickSearchTeacher(filter, sorting = null): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllTeachers($filter: TeacherFilterInput, $sorting: TeacherSortingInput) {
            GetAllTeachers(filter: $filter, sorting: $sorting) {
              _id
              civility
              first_name
              last_name
              entities {
                school_type
                school {
                  _id
                  short_name
                }
                entity_name
                type {
                  _id
                  name
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
          sorting,
        },
      })
      .pipe(map((resp) => resp.data['GetAllTeachers']));
  }
  getQuickSearchEmail(quick_search_email, schools, user_type, pagination): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllUsers(
            $quick_search_email: String
            $schools: [ID]
            $user_type: [ID!]
            $show_student: EnumShowStudent
            $is_quick_search: Boolean
            $pagination: PaginationInput
          ) {
            GetAllUsers(
              quick_search_email: $quick_search_email
              schools: $schools
              user_type: $user_type
              show_student: $show_student
              is_quick_search: $is_quick_search
              pagination: $pagination
            ) {
              _id
              first_name
              last_name
              civility
              count_document
              entities {
                school_type
                school {
                  _id
                  short_name
                }
                assigned_rncp_title {
                  _id
                  short_name
                }
                type {
                  _id
                  name
                }
                entity_name
              }
              candidate_id {
                _id
                school {
                  _id
                  short_name
                }
              }
            }
          }
        `,
        variables: {
          quick_search_email,
          schools,
          user_type,
          show_student: 'include_student',
          is_quick_search: true,
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getAllCountryCodes(pagination, filter, sorting, conditonalGraphl?): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllCountryCodes(
            $pagination: PaginationInput
            $filter: CountryCodeFilterInput
            $sorting: CountryCodeSortingInput
            $columnCountry: Boolean!
            $columnNationality: Boolean!
            $columnVisaPermit: Boolean!
            $lang: String
          ) {
            GetAllCountryCodes(pagination: $pagination, filter: $filter, sorting: $sorting, lang: $lang) {
              _id
              country @include(if: $columnCountry)
              country_code
              currency
              currency_code
              require_visa_permit @include(if: $columnVisaPermit)
              nationality @include(if: $columnNationality)
              count_document
              country_fr
              nationality_fr
            }
          }
        `,
        variables: {
          pagination,
          filter,
          sorting,
          columnCountry: conditonalGraphl?.country || conditonalGraphl?.country === false ? conditonalGraphl.country : true,
          columnNationality: conditonalGraphl?.nationality || conditonalGraphl?.nationality === false ? conditonalGraphl.nationality : true,
          columnVisaPermit: conditonalGraphl?.visaPermit || conditonalGraphl?.visaPermit === false ? conditonalGraphl.visaPermit : true,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCountryCodes']));
  }

  getAllCountryCodesForDropdown(): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllCountryCodes {
            GetAllCountryCodes {
              _id
              country
              country_code
              currency
              currency_code
              require_visa_permit
              nationality
              count_document
              country_fr
              nationality_fr
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCountryCodes']));
  }

  getAllCountriesDropdown(): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllVisaPermits {
            GetAllVisaPermits {
              _id
              nationality_id {
                _id
                nationality_en
                nationality_fr
              }
              country_id {
                _id
                country
                country_fr
              }
              require_visa_permit
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllVisaPermits']));
  }
  getAllCountries(pagination, filter, sorting, conditonalGraphl): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllVisaPermits(
            $pagination: PaginationInput
            $filter: VisaPermitFilterInput
            $sorting: VisaPermitSortingInput
            $columnCountry: Boolean!
            $columnNationality: Boolean!
            $columnVisaPermit: Boolean!
            $lang: String
          ) {
            GetAllVisaPermits(pagination: $pagination, filter: $filter, sorting: $sorting, lang: $lang) {
              _id
              nationality_id @include(if: $columnNationality) {
                _id
                nationality_en
                nationality_fr
              }
              country_id @include(if: $columnCountry) {
                _id
                country
                country_fr
              }
              require_visa_permit @include(if: $columnVisaPermit)
              count_document
            }
          }
        `,
        variables: {
          pagination,
          filter,
          sorting,
          columnCountry: conditonalGraphl?.country,
          columnNationality: conditonalGraphl?.nationality,
          columnVisaPermit: conditonalGraphl?.visaPermit,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllVisaPermits']));
  }

  updateVisaPermit(id, input): Observable<any>{
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateVisaPermit($id: ID!, $input: VisaPermitInput) {
            UpdateVisaPermit(id: $id, input: $input) {
              _id
              require_visa_permit
            }
          }
        `,
        variables: {
          id,
          input
        },
      })
      .pipe(map((resp) => resp.data['UpdateVisaPermit']));
  }

  // ----------------------------------------------------------
  // ===================== MOCK DATA =========================
  // ----------------------------------------------------------

  @Cacheable()
  getUsers(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/users.json');
  }
}
