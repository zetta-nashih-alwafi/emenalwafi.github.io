import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cacheable } from 'ngx-cacheable';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class MailboxService {
  constructor(private httpClient: HttpClient, private apollo: Apollo) {}

  getAllMailbox(pagination, sorting?: any, type?: any, new_mail?: boolean): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllMails($pagination: PaginationInput, $sorting: MailSorting, $type: EnumMailType, $new_mail: Boolean) {
            GetAllMails(pagination: $pagination, sorting: $sorting, type: $type, new_mail: $new_mail) {
              sender_property {
                sender {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
                is_read
                module
                mail_type
              }
              recipient_properties {
                recipients {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
                rank
                module
                is_read
                mail_type
              }
              subject
              is_sent
              message
              tags
              attachments
              status
              is_urgent_mail
              file_attachments {
                file_name
                path
              }
              is_group_parent
              is_group_child
              group_detail {
                rncp_titles {
                  _id
                  short_name
                }
                user_types {
                  _id
                  name
                }
              }
              user_type_selection
              count_document
            }
          }
        `,
        variables: {
          pagination,
          sorting,
          type,
          new_mail,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllMails']));
  }

  getMailNotif(pagination, type?: any, new_mail?: boolean): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllMails($pagination: PaginationInput, $type: EnumMailType, $new_mail: Boolean) {
            GetAllMails(pagination: $pagination, type: $type, new_mail: $new_mail) {
              _id
              created_at
              date
              sender_property {
                sender {
                  _id
                  first_name
                  last_name
                  email
                  civility
                }
                is_read
              }
              recipient_properties {
                recipients {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
                rank
                is_read
              }
              subject
              is_sent
              message
              tags
              attachments
              status
              is_urgent_mail
              file_attachments {
                file_name
                path
              }
              is_group_parent
              is_group_child
              group_detail {
                rncp_titles {
                  _id
                  short_name
                }
                user_types {
                  _id
                  name
                }
              }
              user_type_selection
              count_document
              count_not_read
            }
          }
        `,
        variables: {
          pagination,
          type,
          new_mail,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllMails']));
  }

  getMainMail(
    pagination,
    sorting?: any,
    type?: any,
    new_mail?: boolean,
    filter?: any,
    recipient_rank?: any,
    user_id?: any,
  ): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllMails($pagination: PaginationInput, $sorting: MailSorting, $type: EnumMailType, $new_mail: Boolean, $user_id:ID) {
            GetAllMails(
              pagination: $pagination,
              sorting: $sorting,
              type: $type,
              new_mail: $new_mail,
              ${filter},
              ${recipient_rank ? `recipient_rank : ${recipient_rank}` : ''}
              user_id: $user_id
            ) {
              _id
              created_at
                date
              sender_property {
                sender {
                  _id
                  first_name
                  last_name
                  email
                  civility
                }
                is_read
              }
              recipient_properties {
                recipients {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
                mail_type
                rank
                is_read
                recipients_email
              }
              subject
              is_sent
              message
              tags
              attachments
              status
              is_urgent_mail
              file_attachments {
                file_name
                path
              }
              is_group_parent
              is_group_child
              group_detail {
                rncp_titles {
                  _id
                  short_name
                }
                user_types {
                  _id
                  name
                }
              }
              user_type_selection
              count_document
              count_not_read
            }
          }
        `,
        variables: {
          pagination,
          sorting,
          type,
          new_mail,
          user_id: user_id ? user_id : '',
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllMails']));
  }

  getNonMainMail(pagination, sorting?: any, type?: any, filter?: any, user_id?: any): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllMails($pagination: PaginationInput, $sorting: MailSorting, $type: EnumMailType, $user_id: ID) {
            GetAllMails(pagination: $pagination, sorting: $sorting, type: $type, ${filter}, user_id: $user_id) {
              _id
              created_at
                date
              sender_property {
                sender {
                  _id
                  first_name
                  last_name
                  email
                  civility
                }
                is_read
              }
              recipient_properties {
                recipients {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
                recipients_email 
                rank
                is_read
              }
              subject
              is_sent
              message
              tags
              attachments
              status
              is_urgent_mail
              file_attachments {
                file_name
                path
              }
              is_group_parent
              is_group_child
              group_detail {
                rncp_titles {
                  _id
                  short_name
                }
                user_types {
                  _id
                  name
                }
              }
              user_type_selection
              count_document
              count_not_read
            }
          }
        `,
        variables: {
          pagination,
          sorting,
          type,
          user_id: user_id ? user_id : '',
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllMails']));
  }

  getUrgentMail(): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllMails {
            GetAllMails(is_urgent_mail: true, type: inbox) {
              _id
              created_at
              date
              sender_property {
                sender {
                  _id
                  first_name
                  last_name
                  email
                  civility
                }
                is_read
                module
                mail_type
              }
              recipient_properties {
                recipients {
                  _id
                  first_name
                  last_name
                  civility
                  email
                }
                rank
                module
                is_read
                mail_type
              }
              subject
              is_sent
              message
              tags
              attachments
              status
              is_urgent_mail
              file_attachments {
                file_name
                path
              }
              is_group_parent
              is_group_child
              group_detail {
                rncp_titles {
                  _id
                  short_name
                }
                user_types {
                  _id
                  name
                }
              }
              user_type_selection
              count_document
              count_not_read
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllMails']));
  }

  updateSingleMail(_id, payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateMail($_id: ID!, $mail_input: MailInput) {
            UpdateMail(_id: $_id, mail_input: $mail_input) {
              sender_property {
                is_read
                mail_type
              }
              recipient_properties {
                is_read
                mail_type
              }
            }
          }
        `,
        variables: {
          _id: _id,
          mail_input: payload,
        },
      })
      .pipe(map((resp) => resp.data['UpdateMail']));
  }

  sendMail(_id, payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendMail($_id: ID, $mail_input: MailInput) {
            SendMail(_id: $_id, mail_input: $mail_input)
          }
        `,
        variables: {
          _id: _id,
          mail_input: payload,
        },
      })
      .pipe(map((resp) => resp.data['SendMail']));
  }

  updateMultipleMail(_ids, payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateMultipleMail($_ids: [ID!]!, $mail_input: MailInput) {
            UpdateMultipleMail(_ids: $_ids, mail_input: $mail_input) {
              sender_property {
                mail_type
              }
              _id
              recipient_properties {
                recipients {
                  _id
                }
                is_read
                rank
                mail_type
              }
            }
          }
        `,
        variables: {
          _ids: _ids,
          mail_input: payload,
        },
      })
      .pipe(map((resp) => resp.data['UpdateMultipleMail']));
  }

  updateMultipleMailRecipient(_ids, payload, user_id?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateMultipleMail($_ids: [ID!]!, $recipient_properties: SetMailTypeInput, $user_id: ID) {
            UpdateMultipleMail(_ids: $_ids, recipient_properties: $recipient_properties, user_id:$user_id) {
              sender_property {
                mail_type
              }
              recipient_properties {
                mail_type
              }
            }
          }
        `,
        variables: {
          _ids: _ids,
          recipient_properties: payload,
          user_id
        },
      })
      .pipe(map((resp) => resp.data['UpdateMultipleMail']));
  }
  updateMultipleMailSender(_ids, sender_property, user_id?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateMultipleMail($_ids: [ID!]!, $sender_property: SetMailTypeInput, $user_id: ID) {
            UpdateMultipleMail(_ids: $_ids, sender_property: $sender_property, user_id:$user_id) {
              _id
              sender_property {
                is_read
                mail_type
              }
              recipient_properties {
                is_read
                mail_type
              }
            }
          }
        `,
        variables: {
          _ids: _ids,
          sender_property: sender_property,
          user_id
        },
      })
      .pipe(map((resp) => resp.data['UpdateMultipleMail']));
  }

  deleteMail(_ids): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteMail($_ids: [ID]) {
            DeleteMail(_ids: $_ids) {
              _id
            }
          }
        `,
        variables: {
          _ids: _ids,
        },
      })
      .pipe(map((resp) => resp.data['DeleteMail']));
  }

  deleteMultipleMail(_ids): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteMail($_ids: [ID]) {
            DeleteMail(_ids: $_ids) {
              _id
            }
          }
        `,
        variables: {
          _ids: _ids,
        },
      })
      .pipe(map((resp) => resp.data['DeleteMail']));
  }

  createMail(payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateMail($mail_input: MailInput) {
            CreateMail(mail_input: $mail_input)
          }
        `,
        variables: {
          mail_input: payload,
        },
      })
      .pipe(map((resp) => resp.data['CreateMail']));
  }

  CreateMailForMultipleRecipientsInvoice(payload, invoiceOn?, is_with_invoice?): Observable<any> {
    if (invoiceOn) {
      return this.apollo
        .mutate({
          mutation: gql`
            mutation CreateMailForMultipleRecipients($mail_input: MailInput, $is_with_invoice: Boolean) {
              CreateMailForMultipleRecipients(mail_input: $mail_input, is_with_invoice: $is_with_invoice)
            }
          `,
          variables: {
            mail_input: payload,
            is_with_invoice: is_with_invoice ? is_with_invoice : false,
          },
        })
        .pipe(map((resp) => resp.data['CreateMailForMultipleRecipients']));
    } else {
      return this.apollo
        .mutate({
          mutation: gql`
            mutation CreateMailForMultipleRecipients($mail_input: MailInput) {
              CreateMailForMultipleRecipients(mail_input: $mail_input)
            }
          `,
          variables: {
            mail_input: payload,
          },
        })
        .pipe(map((resp) => resp.data['CreateMailForMultipleRecipients']));
    }
  }

  CreateMailForMultipleRecipients(payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateMailForMultipleRecipients($mail_input: MailInput) {
            CreateMailForMultipleRecipients(mail_input: $mail_input)
          }
        `,
        variables: {
          mail_input: payload,
        },
      })
      .pipe(map((resp) => resp.data['CreateMailForMultipleRecipients']));
  }

  getRecipientData(last_name: any): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllUsers($last_name: String) {
            GetAllUsers(last_name: $last_name, show_student: include_student) {
              email
              first_name
              last_name
              civility
              position
            }
          }
        `,
        variables: {
          last_name,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getRecipientDataUsingName(last_name_or_email: any): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllUsers($last_name_or_email: String) {
            GetAllUsers(last_name_or_email: $last_name_or_email, show_student: include_student) {
              email
              first_name
              last_name
              civility
              position
            }
          }
        `,
        variables: {
          last_name_or_email,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getRecipientDataUsingNameForGroup(full_name: any, title): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllUsers($full_name: String, $title: [ID!]) {
            GetAllUsers(full_name: $full_name, title: $title) {
              email
              first_name
              last_name
              civility
              position
            }
          }
        `,
        variables: {
          full_name,
          title: title,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getRecipientDataUsingNameAndTypeForGroup(full_name: any, title, user_type): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllUsers($full_name: String, $title: [ID!], $user_type: [ID!]) {
            GetAllUsers(full_name: $full_name, title: $title, user_type: $user_type) {
              email
              first_name
              last_name
              civility
              position
            }
          }
        `,
        variables: {
          full_name,
          title: title,
          user_type: user_type,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getRecipientDataEmail(email: any): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetOneUser($email: String) {
            GetOneUser(email: $email) {
              email
              first_name
              last_name
              civility
              position
            }
          }
        `,
        variables: {
          email,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneUser']));
  }

  getUserBySchool(): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetUserBySchool{
            GetAllSchools(user_login: true) {
              _id
              short_name
              users {
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
              preparation_center_ats {
                rncp_title_id {
                  _id
                  short_name
                  long_name
                }
              }
              certifier_ats {
                short_name
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getStudent(school): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetStudent{
            GetAllStudents(school: "${school}") {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getUserAcadDirBySchool(school): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query {
            GetAllUsers(school: "${school}", user_type_name: "Academic Director") {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getUserAcadAdminBySchool(school): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query {
            GetAllUsers(school: "${school}", user_type_name: "Academic Admin") {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  geUserListBySchoolAndUsertype(schools, user_type): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetUserListBySchoolAndUsertype($schools: [ID], $user_type: [ID!]) {
            GetAllUsers(schools: $schools, user_type: $user_type) {
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
          schools,
          user_type,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  geUserListBySchoolAndTitleAndUsertype(schools, title, user_type): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetUserListBySchoolAndUsertype($schools: [ID], $title: [ID!], $user_type: [ID!]) {
            GetAllUsers(schools: $schools, title: $title, user_type: $user_type) {
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
          schools,
          title,
          user_type,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  geUserListBySchoolAndTitle(schools, title): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetUserListBySchoolAndUsertype($schools: [ID], $title: [ID!]) {
            GetAllUsers(schools: $schools, title: $title) {
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
          schools,
          title,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  geUserStudentListBySchoolAndTitleAndUsertype(schools, title, user_type, show_student): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetUserListBySchoolAndUsertype($schools: [ID], $title: [ID!], $user_type: [ID!], $show_student: EnumShowStudent) {
            GetAllUsers(schools: $schools, title: $title, user_type: $user_type, show_student: $show_student) {
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
          schools,
          title,
          user_type,
          show_student,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getUserCerDirBySchool(school): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query {
            GetAllUsers(school: "${school}", user_type_name: "CR School Director") {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getUserCerAdminBySchool(school): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query {
            GetAllUsers(school: "${school}", user_type_name: "Certifier Admin") {
              _id
              first_name
              last_name
              civility
              email
              full_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getUserBySchoolId(school): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetUserBySchoolId{
            GetAllUsers(school: "${school}") {
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
  getOneTitle(titleId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetOneTitle{
          GetOneTitle(_id: "${titleId}") {
            _id
            short_name
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneTitle']));
  }
  // Get single user type
  getOneUserTypes(ID: String): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query GetOneUserType{
        GetOneUserType(_id:"${ID}"){
          _id
          name
          entity
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneUserType']));
  }

  // getCountUnreadInboxMail(): Observable<any[]> {
  //   return this.apollo
  //     .query<any[]>({
  //       query: gql`
  //       query {
  //         GetAllMails(pagination: $pagination, sorting: $sorting, type: 'inbox') {
  //             _id
  //           }
  //         }
  //       `,
  //       fetchPolicy: 'network-only',
  //     })
  //     .pipe(map((resp) => resp.data['GetAllMails']));
  // }

  mailCategories = [
    {
      key: 'inbox',
      name: 'MailBox.INBOX',
      state: 'mailbox/inbox',
      icon: 'fa-inbox',
    },
    {
      key: 'CC',
      name: 'MailBox.CC',
      state: 'mailbox/cc',
      icon: 'fa-inbox',
    },
    {
      key: 'sent',
      name: 'MailBox.SENT',
      state: 'mailbox/sentBox',
      icon: 'fa-paper-plane',
    },
    {
      key: 'important',
      name: 'MailBox.IMPORTANT',
      state: 'mailbox/important',
      icon: 'fa-hand-paper-o',
    },
    {
      key: 'draft',
      name: 'MailBox.DRAFT',
      state: 'mailbox/draft',
      icon: 'fa-archive',
    },
    {
      key: 'trash',
      name: 'MailBox.TRASH',
      state: 'mailbox/trash',
      icon: 'fa-trash',
    },
  ];

  getMailCategories() {
    return this.mailCategories;
  }
}
