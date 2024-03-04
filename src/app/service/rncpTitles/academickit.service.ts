import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import gql from 'graphql-tag';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

declare var _: any;
@Injectable({
  providedIn: 'root',
})
export class AcademicKitService {
  folder03 = '03. BOITE A OUTILS'; // name for root folder 03
  folder06 = '06. EPREUVES DE LA CERTIFICATION'; // name for root folder 06
  folder07 = '07. ARCHIVES'; // name for root folder 07

  // destinationFolderId is used for saving id where we want to move folder into. it used in move folder dialog component
  private destinationFolderIdSource = new BehaviorSubject<{ _id: string; folder_name: string }>(null);
  public destinationFolderId$ = this.destinationFolderIdSource.asObservable();

  // moveFolderBreadcrumb is used for saving breadcrumb navigation path. it used in move folder dialog component
  private moveFolderBreadcrumbSource = new BehaviorSubject<any[]>(null);
  public moveFolderBreadcrumb$ = this.moveFolderBreadcrumbSource.asObservable();

  // to trigger refresh on academic kit
  refreshAcadKitSource = new BehaviorSubject<boolean>(false);
  isAcadKitRefreshed$ = this.refreshAcadKitSource.asObservable();

  setDestinationFolder(folder: { _id: string; folder_name: string }) {
    this.destinationFolderIdSource.next(folder);
  }

  setMoveFolderBreadcrumb(path: any[]) {
    this.moveFolderBreadcrumbSource.next(path);
  }

  refreshAcadKit(status: boolean) {
    this.refreshAcadKitSource.next(status);
  }

  isRootFolder03(folder: any) {
    const folderName = folder.folder_name;
    return folder.is_default_folder && folderName.includes(this.folder03);
  }

  isRootFolder06(folder: any) {
    const folderName = folder.folder_name;
    return folder.is_default_folder && folderName.includes(this.folder06);
  }

  isRootFolder07(folder: any) {
    const folderName = folder.folder_name;
    return folder.is_default_folder && folderName.includes(this.folder07);
  }

  constructor(private apollo: Apollo, private translate: TranslateService) {}

  getCreateDocumentTypes(): { value: string; name: string }[] {
    return [
      { value: 'guideline', name: 'Guideline' },
      { value: 'test', name: 'test' },
      { value: 'scoring-rules', name: 'Scoring Rule' },
      { value: 'other', name: 'other' },
      { value: 'image/png', name: 'Image/png' },
      { value: 'image/jpeg', name: 'Image/jpeg' },
      { value: 'application/pdf', name: 'Application/pdf' },
      { value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', name: 'Application/Document' },
      { value: 'documentExpected', name: 'Document Expected' },
      { value: 'studentnotification', name: 'Student Notification' },
      { value: 'certiDegreeCertificate', name: 'CertiDegree Certificate' },
    ];
  }

  getDocumentTypes(): { value: string; name: string }[] {
    return [
      { value: 'Guidelines', name: 'Guidelines' },
      { value: 'guideline', name: 'Guideline' },
      { value: 'Test', name: 'Test' },
      { value: 'test', name: 'test' },
      { value: 'Scoring Rules', name: 'Scoring Rules' },
      { value: 'scoring-rules', name: 'Scoring Rule' },
      { value: 'Other', name: 'Other' },
      { value: 'OTHER', name: 'OTHER' },
      { value: 'other', name: 'other' },
      { value: 'Notification to Student', name: 'Notification to Student' },
      { value: 'documentExpected', name: 'Document Expected' },
      { value: 'image/png', name: 'Image/png' },
      { value: 'image/jpeg', name: 'Image/jpeg' },
      { value: 'application/pdf', name: 'Application/pdf' },
      { value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', name: 'Application/Document' },
      { value: 'studentnotification', name: 'Student Notification' },
      { value: 'certiDegreeCertificate', name: 'CertiDegree Certificate' },
      { value: 'certification_rule', name: 'Certification Rule' },
      { value: 'student_upload_grand_oral_cv', name: 'Student Upload Grand Oral CV' },
      { value: 'student_upload_grand_oral_presentation', name: 'Student Upload Grand Oral Presentation' },
    ];
  }

  getFileTypes(): { value: string; name: string }[] {
    return [
      { value: 'docper', name: 'Document/Presentation' },
      { value: 'image', name: 'Image' },
      { value: 'video', name: 'Video' },
    ];
  }

  createEvent(data: any): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation CreateEvent($data: AcadEventInput) {
          CreateEvent(event_input: $data) {
            _id
            name
            from_date
            to_date
            schools {
              _id
            }
          }
        }
      `,
      variables: {
        data,
      },
    });
  }

  updateEvent(eventId: string, payload: any): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation CreateEvent($eventId: ID!, $payload: AcadEventInput) {
          UpdateEvent(_id: $eventId, event_input: $payload) {
            _id
          }
        }
      `,
      variables: {
        eventId,
        payload,
      },
    });
  }

  getAllEvent(from_date?: string, to_date?: string, school?: string, className?: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query {
            GetAllEvents(filter:{from_date:"${from_date}", to_date:"${to_date}", school_name:"${school}", class_name:"${className}"}) {
              _id
              name
              from_date
              to_date
              schools {
                _id
                short_name
              }
              user_types {
                _id
                name
              }
              is_all_school
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllEvents'];
        }),
      );
  }

  getAllEventWithParam(pagination, filter, sorting, titleId) {
    return this.apollo
      .query({
        query: gql`
          query GetAllEvents($pagination: PaginationInput, $filter: AcadEventFilter, $sorting: AcadEventSorting, $rncp_title_id: ID) {
            GetAllEvents(pagination: $pagination, filter: $filter, sorting: $sorting, rncp_title_id: $rncp_title_id) {
              _id
              name
              from_date
              to_date
              schools {
                _id
                short_name
              }
              class_id {
                _id
                name
              }
              user_types {
                _id
                name
              }
              is_all_school
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination: pagination,
          filter: filter,
          sorting: sorting,
          rncp_title_id: titleId,
        },
      })
      .pipe(map((resp) => resp.data['GetAllEvents']));
  }

  getAllEventWithParamBySchool(pagination, filter, sorting, titleId) {
    return this.apollo
      .query({
        query: gql`
          query GetAllEvents($pagination: PaginationInput, $filter: AcadEventFilter, $sorting: AcadEventSorting, $rncp_title_id: ID) {
            GetAllEvents(pagination: $pagination, filter: $filter, sorting: $sorting, rncp_title_id: $rncp_title_id) {
              _id
              name
              from_date
              to_date
              schools {
                _id
                short_name
              }
              class_id {
                _id
                name
              }
              user_types {
                _id
                name
              }
              is_all_school
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination: pagination,
          filter: filter,
          sorting: sorting,
          rncp_title_id: titleId,
        },
      })
      .pipe(map((resp) => resp.data['GetAllEvents']));
  }

  checkEvent(titleId, pagination = { limit: 1, page: 0 }) {
    return this.apollo
      .query({
        query: gql`
          query GetAllEvents($rncp_title_id: ID, $pagination: PaginationInput) {
            GetAllEvents(rncp_title_id: $rncp_title_id, pagination: $pagination) {
              _id
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          rncp_title_id: titleId,
          pagination,
        },
      })
      .pipe(map((resp) => resp.data['GetAllEvents']));
  }

  getAllEventDropdown(filter, titleId) {
    return this.apollo
      .query({
        query: gql`
          query GetAllEvents($filter: AcadEventFilter, $rncp_title_id: ID) {
            GetAllEvents(filter: $filter, rncp_title_id: $rncp_title_id) {
              _id
              name
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter: filter,
          rncp_title_id: titleId,
        },
      })
      .pipe(map((resp) => resp.data['GetAllEvents']));
  }

  deleteEvent(ID: String): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
      mutation DeleteEvent{
        DeleteEvent(_id:"${ID}"){
          _id
        }
      }
      `,
    });
  }

  getClassDropDownList(rncpId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query GetClassDropdownList{
        GetClassDropdownList(rncp_id : "${rncpId}"){
          _id
          name
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetClassDropdownList'];
        }),
      );
  }

  getClassDropDownListAlphaOrder(rncpId: string, sorting): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query getClassDropDownList($rncp_id: String, $sorting: ClassSortingInput) {
            getClassDropDownList(rncp_id: $rncp_id, sorting: $sorting) {
              _id
              name
            }
          }
        `,
        variables: {
          rncp_id: rncpId,
          sorting: sorting,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['getClassDropDownList'];
        }),
      );
  }

  getAllUserTypes(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllUserTypes{
            GetAllUserTypes {
              _id
              name
              # role
            }
          }
        `,
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllUserTypes'];
        }),
      );
  }

  getAllUserTypesIncludeStudent(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllUserTypesIncludeStudent{
            GetAllUserTypes(show_student_type: include_student) {
              _id
              name
            }
          }
        `,
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllUserTypes'];
        }),
      );
  }

  getSchoolDropDownList(rncpId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetSchoolDropdownList{
            GetSchoolDropdownList(rncp_title_id : "${rncpId}") {
              _id
              short_name
            }
          }
        `,
      })
      .pipe(
        map((resp) => {
          return resp.data['GetSchoolDropdownList'];
        }),
      );
  }

  getSchoolDropDownListAlphaOrder(rncpId: string, sorting): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetSchoolDropdownList($rncp_title_id: String, $sorting: ClassSortingInput) {
            GetSchoolDropdownList(rncp_title_id: $rncp_title_id, sorting: $sorting) {
              _id
              short_name
            }
          }
        `,
        variables: {
          rncp_title_id: rncpId,
          sorting: sorting,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetSchoolDropdownList'];
        }),
      );
  }

  getOneTestIdentity(ID: String): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query{
        GetOneTest(_id:"${ID}"){
          _id
          name
          max_score
          type
          coefficient
          date
          correction_type
          organiser
          date_type
          status
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneTest'];
        }),
      );
  }

  getOneTestUploadedDocument(ID: String): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query{
        GetOneTest(_id:"${ID}"){
          documents{
            name
            file_name
            created_at
            publication_date{
              type
              before
              day
              publication_date{
                year
                month
                date
                hour
                minute
                time_zone
              }
            }
          }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneTest'];
        }),
      );
  }

  getOneTestExpectedDocument(ID: String): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query{
        GetOneTest(_id:"${ID}"){
          expected_documents{
            document_name
            deadline_date{
              deadline
              type
              before
              day
            }
          }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneTest'];
        }),
      );
  }

  setupBasicAcademicKit(titleId: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
      mutation CreateBasicAcademicKit{
        CreateBasicAcademicKit(rncp_title_id: "${titleId}"){
          _id
        }
      }
      `,
      })
      .pipe(map((resp) => resp.data['CreateBasicAcademicKit']));
  }

  getAcademicKitOfSelectedTitle(titleId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query {
        GetOneTitle(_id: "${titleId}") {
          academic_kit {
            categories {
              _id
              folder_name
              is_default_folder
              sub_folders_id {
                _id
                folder_name
                school {
                  _id
                }
              }
              documents {
                _id
                document_name
                publication_date_for_schools {
                  date {
                    date
                    time
                  }
                  school {
                    _id
                  }
                }
                type_of_document
                s3_file_name
                published_for_student
                parent_class_id {
                  _id
                  name
                }
                parent_test {
                  expected_documents {
                    _id
                    document_name
                  }
                  date_type
                  date {
                    date_utc
                    time_utc
                  }
                  schools {
                    school_id {
                      _id
                    }
                    test_date {
                      date_utc
                      time_utc
                    }
                  }
                }
                uploaded_for_student {
                  first_name
                  last_name
                }
                uploaded_for_other_user {
                  first_name
                  last_name
                }
                document_expected_id {
                  _id
                  document_name
                }
                publication_date {
                  type
                  before
                  day
                  publication_date {
                    date
                    time
                  }
                  relative_time
                }
                published_for_user_types_id {
                  _id
                  name
                }
                parent_folder {
                  folder_name
                }
              }
              tests {
                _id
                name
                type
                group_test
                correction_type
                is_published
                documents {
                  _id
                  document_name
                  type_of_document
                  s3_file_name
                  published_for_student
                  publication_date_for_schools {
                    date {
                      date
                      time
                    }
                    school {
                      _id
                    }
                  }
                  document_generation_type
                  parent_class_id {
                    _id
                    name
                  }
                  uploaded_for_student {
                    first_name
                    last_name
                  }
                  uploaded_for_other_user {
                    first_name
                    last_name
                  }
                  uploaded_for_group {
                    _id
                    name
                  }
                  published_for_user_types_id {
                    _id
                    name
                  }
                  publication_date {
                    type
                    before
                    day
                    publication_date {
                      date
                      time
                    }
                    relative_time
                  }
                  parent_test {
                    expected_documents {
                      _id
                      document_name
                    }
                    date_type
                    date {
                      date_utc
                      time_utc
                    }
                    schools {
                      school_id {
                        _id
                      }
                      test_date {
                        date_utc
                        time_utc
                      }
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
      .pipe(map((resp) => resp.data['GetOneTitle']));
  }

  getAllAcademicKit(titleId: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
      query {
        GetAllAcadKits(rncp_title: "${titleId}") {
          _id
          title
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllAcadKits']));
  }

  getAcademicKitSubfolders(acadKitId: string, userTypeId, check_visible?): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query GetAcademicKitSubfolders($check_visible: Boolean) {
        GetOneAcadKit(_id: "${acadKitId}", check_visible: $check_visible) {
          is_visible
          documents {
            _id
            status
            document_name
            type_of_document
            s3_file_name
            publication_date_for_schools {
              date {
                date
                time
              }
              school {
                _id
              }
            }
            published_for_student
            parent_class_id {
              _id
              name
            }
            parent_test {
              _id
              expected_documents {
                _id
                document_name
                is_for_all_student
                is_for_all_group
              }
              date_type
              date {
                date_utc
                time_utc
              }
              schools {
                school_id {
                  _id
                }
                test_date {
                  date_utc
                  time_utc
                }
              }
            }
            uploaded_for_student {
              _id
              first_name
              last_name
            }
            uploaded_for_other_user {
              first_name
              last_name
            }
            uploaded_for_group {
              _id
              name
            }
            document_expected_id {
              _id
              document_name
            }
            publication_date {
              type
              before
              day
              publication_date {
                date
                time
              }
              relative_time
            }
            published_for_user_types_id {
              _id
              name
            }
            document_generation_type
            parent_folder {
              folder_name
            }
          }
          grand_oral_pdfs {
            _id
            document_name
            type_of_document
            document_generation_type
            parent_folder {
              _id
              folder_name
            }
            s3_file_name
            uploaded_for_student {
              _id
              first_name
              last_name
            }
            jury_organization_id {
              _id
            }
          }
          grand_oral_result_pdfs(logged_in_user_type_id: "${userTypeId}") {
            _id
            document_name
            type_of_document
            document_generation_type
            parent_folder {
              _id
              folder_name
            }
            s3_file_name
            uploaded_for_student {
              _id
              first_name
              last_name
            }
            jury_organization_id {
              _id
            }
          }
          sub_folders_id {
            _id
            folder_name
            is_grand_oral_folder
            cv_docs {
              _id
              document_name
              type_of_document
              document_generation_type
              parent_folder {
                _id
                folder_name
              }
              s3_file_name
              uploaded_for_student {
                _id
                first_name
                last_name
              }
            }
            presentation_docs {
              _id
              document_name
              type_of_document
              document_generation_type
              parent_folder {
                _id
                folder_name
              }
              s3_file_name
              uploaded_for_student {
                _id
                first_name
                last_name
              }
            }
            jury_id {
              _id
            }
          }
          school {
            _id
          }
          class {
            _id
          }
          parent_rncp_title {
            _id
          }
          tests {
            _id
            name
            type
            group_test
            correction_type
            is_published
            evaluation_id {
              result_visibility
            }
            documents {
              _id
              status
              document_name
              type_of_document
              s3_file_name
              published_for_student
              publication_date_for_schools {
                date {
                  date
                  time
                }
                school {
                  _id
                }
              }
              document_generation_type
              parent_class_id {
                _id
                name
              }
              uploaded_for_student {
                first_name
                last_name
              }
              uploaded_for_other_user {
                first_name
                last_name
              }
              uploaded_for_group {
                _id
                name
              }
              published_for_user_types_id {
                _id
                name
              }
              publication_date {
                type
                before
                day
                publication_date {
                  date
                  time
                }
                relative_time
              }
              parent_test {
                expected_documents {
                  _id
                  document_name
                }
                date_type
                date {
                  date_utc
                  time_utc
                }
                schools {
                  school_id {
                    _id
                  }
                  test_date {
                    date_utc
                    time_utc
                  }
                }
              }
            }
          }
          jury_id {
              _id
            }
        }
      }
      `,
        fetchPolicy: 'network-only',
        variables: {
          check_visible: check_visible ? true : false,
        },
      })
      .pipe(map((resp) => resp.data['GetOneAcadKit']));
  }

  getAcademicKitSubfoldersMoveDialog(acadKitId: string, check_visible?): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query GetAcademicKitSubfoldersMoveDialog($check_visible: Boolean) {
        GetOneAcadKit(_id: "${acadKitId}", check_visible: $check_visible) {
          is_visible
          documents {
            _id
            status
            document_name
            type_of_document
            s3_file_name
            publication_date_for_schools {
              date {
                date
                time
              }
              school {
                _id
              }
            }
            published_for_student
            parent_class_id {
              _id
              name
            }
            parent_test {
              _id
              expected_documents {
                _id
                document_name
                is_for_all_student
                is_for_all_group
              }
              date_type
              date {
                date_utc
                time_utc
              }
              schools {
                school_id {
                  _id
                }
                test_date {
                  date_utc
                  time_utc
                }
              }
            }
            uploaded_for_student {
              _id
              first_name
              last_name
            }
            uploaded_for_other_user {
              first_name
              last_name
            }
            uploaded_for_group {
              _id
              name
            }
            document_expected_id {
              _id
              document_name
            }
            publication_date {
              type
              before
              day
              publication_date {
                date
                time
              }
              relative_time
            }
            published_for_user_types_id {
              _id
              name
            }
            document_generation_type
            parent_folder {
              folder_name
            }
          }
          grand_oral_pdfs {
            _id
            document_name
            type_of_document
            document_generation_type
            parent_folder {
              _id
              folder_name
            }
            s3_file_name
            uploaded_for_student {
              _id
              first_name
              last_name
            }
            jury_organization_id {
              _id
            }
          }
          sub_folders_id {
            _id
            folder_name
            is_grand_oral_folder
            cv_docs {
              _id
              document_name
              type_of_document
              document_generation_type
              parent_folder {
                _id
                folder_name
              }
              s3_file_name
              uploaded_for_student {
                _id
                first_name
                last_name
              }
            }
            presentation_docs {
              _id
              document_name
              type_of_document
              document_generation_type
              parent_folder {
                _id
                folder_name
              }
              s3_file_name
              uploaded_for_student {
                _id
                first_name
                last_name
              }
            }
            jury_id {
              _id
            }
          }
          school {
            _id
          }
          class {
            _id
          }
          parent_rncp_title {
            _id
          }
          tests {
            _id
            name
            type
            group_test
            correction_type
            is_published
            evaluation_id {
              result_visibility
            }
            documents {
              _id
              status
              document_name
              type_of_document
              s3_file_name
              published_for_student
              publication_date_for_schools {
                date {
                  date
                  time
                }
                school {
                  _id
                }
              }
              document_generation_type
              parent_class_id {
                _id
                name
              }
              uploaded_for_student {
                first_name
                last_name
              }
              uploaded_for_other_user {
                first_name
                last_name
              }
              uploaded_for_group {
                _id
                name
              }
              published_for_user_types_id {
                _id
                name
              }
              publication_date {
                type
                before
                day
                publication_date {
                  date
                  time
                }
                relative_time
              }
              parent_test {
                expected_documents {
                  _id
                  document_name
                }
                date_type
                date {
                  date_utc
                  time_utc
                }
                schools {
                  school_id {
                    _id
                  }
                  test_date {
                    date_utc
                    time_utc
                  }
                }
              }
            }
          }
          jury_id {
              _id
            }
        }
      }
      `,
        fetchPolicy: 'network-only',
        variables: {
          check_visible: check_visible ? true : false,
        },
      })
      .pipe(map((resp) => resp.data['GetOneAcadKit']));
  }

  getAcademicKitParentFolder(acadKitId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query GetAcademicKitParentFolder{
        GetOneAcadKit(_id: "${acadKitId}") {
          parent_folder_id {
            _id
            folder_name
          }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneAcadKit']));
  }

  getAcademicKitDetail(acadKitId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query GetAcademicKitDetail{
        GetOneAcadKit(_id: "${acadKitId}") {
          _id
          folder_name
          folder_description
          is_default_folder
          sub_folders_id {
            _id
            folder_name
          }
          documents {
            _id
            document_name
            type_of_document
            s3_file_name
            published_for_student
            document_generation_type
            publication_date_for_schools {
              date {
                date
                time
              }
              school {
                _id
              }
            }
            parent_class_id {
              _id
              name
            }
          }
          tests {
            _id
            name
          }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneAcadKit']));
  }

  addAcademicKitFolder(data: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateAcadKit($acadKitInput: AcadKitInput) {
            CreateAcadKit(kit_input: $acadKitInput) {
              _id
              folder_name
            }
          }
        `,
        variables: { acadKitInput: data },
      })
      .pipe(map((resp) => resp.data['CreateAcadKit']));
  }

  updateAcademicKitFolder(folderId: string, data: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateAcadKit($acadKitId: ID!, $acadKitInput: AcadKitInput) {
            UpdateAcadKit(_id: $acadKitId, kit_input: $acadKitInput) {
              _id
              folder_name
            }
          }
        `,
        variables: {
          acadKitId: folderId,
          acadKitInput: data,
        },
      })
      .pipe(map((resp) => resp.data['UpdateAcadKit']));
  }

  deleteAcademicKitFolder(folderId: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
      mutation DeleteAcademicKitFolder{
        DeleteAcadKit(_id: "${folderId}") {
          _id
        }
      }
      `,
      })
      .pipe(map((resp) => resp.data['DeleteAcadKit']));
  }

  duplicateAcademicKit(selectedTitle: string, targetTitle: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
      mutation DuplicateAcademicKit{
        DuplicateAcadKit(rncp_title: "${selectedTitle}", rncp_title_destination: "${targetTitle}") {
          _id
        }
      }
      `,
      })
      .pipe(map((resp) => resp.data['DuplicateAcadKit']));
  }

  createAcadDoc(data: any): Observable<{ _id: string; document_name: string }> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateAcadDoc($data: AcadDocumentInput) {
            CreateAcadDoc(doc_input: $data) {
              _id
              document_name
            }
          }
        `,
        variables: {
          data: data,
        },
      })
      .pipe(map((resp) => resp.data['CreateAcadDoc']));
  }

  AddDocumentToAcadKitZeroSix(schoolId: string, testId: string, documentId: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
      mutation AddDocumentToAcadKitZeroSix{
        AddDocumentToAcadKitZeroSix(
          school_id: "${schoolId}"
          test_id: "${testId}"
          documents_id: "${documentId}"
        ) {
          _id
          folder_name
        }
      }
      `,
      })
      .pipe(map((resp) => resp.data['AddDocumentToAcadKitZeroSix']));
  }

  createAcadDocJustify(data: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateAcadDoc($data: AcadDocumentInput) {
            CreateAcadDoc(doc_input: $data) {
              _id
              document_name
              s3_file_name
            }
          }
        `,
        variables: {
          data: data,
        },
      })
      .pipe(map((resp) => resp.data['CreateAcadDoc']));
  }

  addDocToAcadKit06(schoolId, testId, documentId): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation addDocToAcadKit06($school_id: ID!, $test_id: ID!, $documents_id: [ID]) {
            AddDocumentToAcadKitZeroSix(school_id: $school_id, test_id: $test_id, documents_id: $documents_id) {
              _id
              folder_name
            }
          }
        `,
        variables: {
          school_id: schoolId,
          test_id: testId,
          documents_id: documentId,
        },
      })
      .pipe(map((resp) => resp.data['AddDocumentToAcadKitZeroSix']));
  }

  deleteAcadDoc(id: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
      mutation DeleteAcadDoc{
        DeleteAcadDoc(_id: "${id}") {
          _id
        }
      }`,
      })
      .pipe(map((resp) => resp.data));
  }

  updateAcadDoc(_id: any, data: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
      mutation UpdateAcadDoc($data: AcadDocumentInput){
        UpdateAcadDoc(_id: "${_id}" doc_input: $data) {
          _id
          parent_folder {
            folder_name
          }
        }
      }`,
        variables: { data: data },
      })
      .pipe(map((resp) => resp.data));
  }

  updateTest(testId: string, payload: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateTest($id: ID!, $input: TestInput) {
            UpdateTest(_id: $id, test_input: $input) {
              _id
              parent_category {
                folder_name
              }
            }
          }
        `,
        variables: {
          id: testId,
          input: payload,
        },
      })
      .pipe(map((resp) => resp.data['UpdateTest']));
  }

  getTaskIdForAcadKit(filter: any, userLoginType?: string) {
    return this.apollo
      .query({
        query: gql`
          query GetAllTasks($filter: TaskFilterInput) {
            GetAllTasks(filter: $filter, ${userLoginType ? `user_login_type: "${userLoginType}"` : ``}) {
              _id
              test{
                _id
              }
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllTasks'];
        }),
      );
  }

  getOneDoc(docId: string) {
    return this.apollo
      .query({
        query: gql`
          query GetOneDoc{
            GetOneDoc(_id: "${docId}") {
              _id
              document_name
              s3_file_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneDoc'];
        }),
      );
  }

  getExpectedDocumentDetails(docId: string) {
    return this.apollo
      .query({
        query: gql`
          query GetExpectedDocumentDetails{
            GetOneDoc(_id: "${docId}") {
              _id
              document_name
              type_of_document
              document_title
              document_industry
              s3_file_name
              task_id{
                _id
                description
                due_date{
                  date
                  time
                }
                for_each_student
                student_id{
                  _id
                  first_name
                  last_name
                  civility
                }
                rncp{
                  _id
                  short_name
                }
                test{
                  _id
                  name
                }
                user_selection {
                  user_type_id{
                    _id
                    name
                  }
                  user_id {
                    student_id{
                      _id
                      first_name
                      last_name
                      civility
                    }
                  }
                }
              }
              document_expected_id{
                _id
                document_name
                file_type
                deadline_date{
                  type
                  before
                  day
                  deadline{
                    date
                    time
                  }
                }
              }
              parent_test {
                _id
                name
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneDoc'];
        }),
      );
  }

  AddDocumentToAcadKitZeroSixManualTask(schoolId: string, documentId: string[], titleId: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AddDocumentZeroSixManual($school_id: ID!, $documents_id: [ID], $rncp_title: ID) {
            AddDocumentToAcadKitZeroSix(school_id: $school_id, documents_id: $documents_id, rncp_title: $rncp_title) {
              _id
            }
          }
        `,
        variables: {
          school_id: schoolId,
          documents_id: documentId,
          rncp_title: titleId,
        },
      })
      .pipe(map((resp) => resp.data['AddDocumentToAcadKitZeroSix']));
  }

  getNumberofStudentandGroup(schoolId: string, class_id: string, test_id: string) {
    return this.apollo
      .query({
        query: gql`
        query GetNumberofStudentandGroup{
          GetNumberOfStudents(school_id: "${schoolId}", class_id: "${class_id}", test_id: "${test_id}") {
            number_of_group
            number_of_student
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetNumberOfStudents']));
  }

  getPresentationCvCount(jury_id, rncp_id, school_id) {
    return this.apollo
      .query({
        query: gql`
          query GetPresentationCvCount($jury_id: ID, $rncp_id: ID, $school_id: ID) {
            GetPresentationCvCount(jury_id: $jury_id, rncp_id: $rncp_id, school_id: $school_id) {
              cv {
                student_count
                to_show
              }
              presentation {
                student_count
                to_show
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          jury_id,
          rncp_id,
          school_id,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetPresentationCvCount'];
        }),
      );
  }

  validateOrRejectCvAndPresentation(doc_id, validation_status) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ValidateOrRejectCvAndPresentation($doc_id: ID!, $validation_status: EnumTestCorrectionValidationStatus!, $lang: String) {
            ValidateOrRejectCvAndPresentation(doc_id: $doc_id, validation_status: $validation_status, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          doc_id,
          validation_status,
          lang: this.translate.currentLang,
        },
      })
      .pipe(map((resp) => resp.data['ValidateOrRejectCvAndPresentation']));
  }

  getGrandOralPDF(jury_id, student_id, user_type_id) {
    return this.apollo
      .query({
        query: gql`
          query GetGrandOralPDF($jury_id: ID, $student_id: ID, $user_type_id: ID) {
            GetGrandOralPDF(jury_id: $jury_id, student_id: $student_id, user_type_id: $user_type_id)
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          jury_id,
          student_id,
          user_type_id,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetGrandOralPDF'];
        }),
      );
  }

  getGrandOralPDFCount(jury_id, rncp_id, school_id) {
    return this.apollo
      .query({
        query: gql`
          query GetGrandOralPDFCount($jury_id: ID, $rncp_id: ID, $school_id: ID) {
            GetGrandOralPDFCount(jury_id: $jury_id, rncp_id: $rncp_id, school_id: $school_id) {
              grand_oral_pdf {
                student_count
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          jury_id,
          rncp_id,
          school_id,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetGrandOralPDFCount'];
        }),
      );
  }
}
