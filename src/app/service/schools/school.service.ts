import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Cacheable } from 'ngx-cacheable';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SchoolService {
  private selectedRncpTitleIdSource = new BehaviorSubject<string>('');
  private selectedClassIdSource = new BehaviorSubject<string>('');
  private selectedStudentId = new BehaviorSubject<string>('');

  selectedRncpTitleId$ = this.selectedRncpTitleIdSource.asObservable();
  selectedClassId$ = this.selectedClassIdSource.asObservable();
  selectedStudentId$ = this.selectedStudentId.asObservable();

  // Student Data Manage
  private studentData = new BehaviorSubject<any>(null);
  private studentDataIdentity = new BehaviorSubject<any>(null);
  private studentDataParents = new BehaviorSubject<any>(null);
  private studentDataCompany = new BehaviorSubject<any>(null);
  private studentAddress = new BehaviorSubject<any>(null);

  selectedDataStudent$ = this.studentData.asObservable();
  selectedDataStudentIdentity$ = this.studentDataIdentity.asObservable();
  selectedDataStudentParents$ = this.studentDataParents.asObservable();
  selectedDataStudentCompany$ = this.studentDataCompany.asObservable();
  selectedDataStudentAddress$ = this.studentAddress.asObservable();
  // End Student Data

  private currentStudentTitleIdSource = new BehaviorSubject<string>('');
  private currentStudentClassIdSource = new BehaviorSubject<string>('');
  private currentSearchStudentSource = new BehaviorSubject<string>('');
  private addNewStudent = new BehaviorSubject<Boolean>(false);
  private importNewStudent = new BehaviorSubject<Boolean>(false);
  private importFormFilled = new BehaviorSubject<Boolean>(false);

  currentStudentTitleId$ = this.currentStudentTitleIdSource.asObservable();
  currentStudentClassId$ = this.currentStudentClassIdSource.asObservable();
  currentSearchStudent$ = this.currentSearchStudentSource.asObservable();
  addNewStudent$ = this.addNewStudent.asObservable();
  importStudent$ = this.importNewStudent.asObservable();
  importFormFilled$ = this.importFormFilled.asObservable();

  setSelectedRncpTitleId(titleId: string) {
    this.selectedRncpTitleIdSource.next(titleId);
  }

  getSelectedRncpTitleId() {
    return this.selectedRncpTitleIdSource.value;
  }

  setSelectedClassId(classId: string) {
    this.selectedClassIdSource.next(classId);
  }

  resetSelectedTitleAndClass() {
    this.selectedRncpTitleIdSource.next(null);
    this.selectedClassIdSource.next(null);
  }

  setCurrentStudentTitleId(titleId: string) {
    this.currentStudentTitleIdSource.next(titleId);
  }

  setCurrentStudentClassId(classId: string) {
    if (classId !== this.currentStudentClassIdSource.value) {
      this.currentStudentClassIdSource.next(classId);
    }
  }

  setCurrentStudentId(studentId: string) {
    console.log('this.isAddUser : ', studentId);
    this.selectedStudentId.next(studentId);
  }

  setcurrentSearchStudent(search: string) {
    this.currentSearchStudentSource.next(search);
  }

  // Update Data Student All Tab
  setDataStudent(data: any) {
    this.studentData.next(data);
  }

  setDataStudentIdentity(data: any) {
    this.studentDataIdentity.next(data);
  }

  setDataStudentParents(data: any) {
    this.studentDataParents.next(data);
  }

  setDataStudentCompany(data: any) {
    this.studentDataCompany.next(data);
  }
  setDataStudentAddress(data: any) {
    this.studentAddress.next(data);
  }
  // End Update Data Student

  setAddStudent(data: Boolean) {
    this.addNewStudent.next(data);
  }

  setImportStudent(data: Boolean) {
    this.importNewStudent.next(data);
  }

  setImportFormFilled(data: Boolean) {
    this.importFormFilled.next(data);
  }

  getCurrentSearchStudent() {
    return this.currentSearchStudentSource.getValue();
  }

  getCurrentStudentId() {
    return this.selectedStudentId.getValue();
  }
  getCurrentStudentAddress() {
    return this.studentAddress.getValue();
  }
  constructor(private httpClient: HttpClient, private apollo: Apollo) {}

  getAllSchools(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
      query GetAllSchools($page: PaginationInput, $sort: SchoolSorting) {
        GetAllSchools(
          ${filter}
          pagination: $page
          sorting: $sort
          user_login: true
          ) {
          _id
          short_name
          long_name
          school_address {
            address1
            address2
            postal_code
            city
            region
            country
            department
            is_main_address
          }
          preparation_center_ats {
            rncp_title_id {
              _id
              short_name
            }
          }
          get_specific_users(user_type_id: "5a2e1ecd53b95d22c82f9554"){
            _id
            email
            first_name
            last_name
            civility
          }
          certifier_ats {
            _id
            short_name
          }
          count_document
        }
      }
      `,
        variables: {
          page: pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getAllCampusesFromSchoolDropdown(school_ids) {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllCampuses($filter: CampusFilterInput) {
            GetAllCampuses(filter: $filter) {
              _id
              name
            }
          }
        `,
        variables: {
          filter: {
            school_ids,
          },
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCampuses']));
  }

  getAllCampusesFromSchoolWithLevels(school_id: string) {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllCampuses($filter: CampusFilterInput) {
            GetAllCampuses(filter: $filter) {
              _id
              name
              levels {
                _id
                name
              }
            }
          }
        `,
        variables: {
          filter: {
            school_id,
          },
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCampuses']));
  }

  getAllSchoolsByCR(pagination, sortValue, filter, certifier_school): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
      query GetAllSchools($page: PaginationInput, $sort: SchoolSorting, $certifier_school: ID) {
        GetAllSchools(
          ${filter}
          certifier_school: $certifier_school
          pagination: $page
          sorting: $sort
          ) {
          _id
          short_name
          long_name
          school_address {
            address1
            address2
            postal_code
            city
            region
            country
            department
            is_main_address
          }
          get_specific_users(user_type_id: "5a2e1ecd53b95d22c82f9554"){
            _id
            email
            first_name
            last_name
            civility
          }
          preparation_center_ats {
            rncp_title_id {
              _id
              short_name
            }
          }
          certifier_ats {
            _id
            short_name
          }
          count_document
        }
      }
      `,
        variables: {
          page: pagination,
          sort: sortValue ? sortValue : {},
          certifier_school: certifier_school,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getAllSchoolsByCRToFilter(certifier_school): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSchools($certifier_school: ID) {
            GetAllSchools(certifier_school: $certifier_school) {
              _id
              short_name
              school_address {
                city
                is_main_address
              }
              preparation_center_ats {
                rncp_title_id {
                  _id
                  short_name
                }
              }
              certifier_ats {
                _id
                short_name
              }
              count_document
            }
          }
        `,
        variables: {
          certifier_school: certifier_school,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getAllSchoolsByUserOwn(school_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSchools($school_ids: [ID]) {
            GetAllSchools(school_ids: $school_ids) {
              _id
              short_name
              school_address {
                city
                is_main_address
              }
              preparation_center_ats {
                rncp_title_id {
                  _id
                  short_name
                }
              }
              certifier_ats {
                _id
                short_name
              }
              count_document
            }
          }
        `,
        variables: {
          school_ids: school_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getAllSchoolsByTitleUserOwn(rncp_title_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSchools($rncp_title_ids: [ID]) {
            GetAllSchools(rncp_title_ids: $rncp_title_ids) {
              _id
              short_name
              school_address {
                city
                is_main_address
              }
              preparation_center_ats {
                rncp_title_id {
                  _id
                  short_name
                }
              }
              certifier_ats {
                _id
                short_name
              }
              count_document
            }
          }
        `,
        variables: {
          rncp_title_ids: rncp_title_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getAllSchoolsChiefGroupOfSchool(pagination, sortValue, filter, schoolList): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
      query GetAllSchoolsChiefGroup($page: PaginationInput, $sort: SchoolSorting, $school_ids: [ID]) {
        GetAllSchools(
          ${filter}
          pagination: $page
          sorting: $sort
          school_ids: $school_ids
          ) {
          _id
          short_name
          long_name
          school_address {
            address1
            address2
            postal_code
            city
            region
            country
            department
            is_main_address
          }
          preparation_center_ats {
            rncp_title_id {
              _id
              short_name
            }
          }
          get_specific_users(user_type_id: "5a2e1ecd53b95d22c82f9554"){
            _id
            email
            first_name
            last_name
            civility
          }
          certifier_ats {
            _id
            short_name
          }
          count_document
        }
      }
      `,
        variables: {
          page: pagination,
          sort: sortValue ? sortValue : {},
          school_ids: schoolList,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getAllSchoolsCorretorProblematic(pagination, sortValue, filter, correctorId, rncp_title_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
      query GetAllSchools($page: PaginationInput, $sort: SchoolSorting, $rncp_title_ids: [ID]) {
        GetAllSchools(
          ${filter}
          pagination: $page
          sorting: $sort
          user_login_type: "${correctorId}"
          rncp_title_ids: $rncp_title_ids
          ) {
          _id
          short_name
          long_name
          school_address {
            address1
            address2
            postal_code
            city
            region
            country
            department
            is_main_address
          }
          preparation_center_ats {
            rncp_title_id {
              _id
              short_name
            }
          }
          get_specific_users(user_type_id: "5a2e1ecd53b95d22c82f9554"){
            _id
            email
            first_name
            last_name
            civility
          }
          certifier_ats {
            _id
            short_name
          }
          count_document
        }
      }
      `,
        variables: {
          page: pagination,
          sort: sortValue ? sortValue : {},
          rncp_title_ids: rncp_title_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getAllSchoolDynamicDropdown(schoolName: string) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
      query {
        GetAllSchools(sorting:{short_name:asc}, school_name: "${schoolName}") {
          _id
          short_name
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getSchoolShortNames(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetSchoolShortNames{
            GetAllSchools(sorting: { short_name: asc }) {
              _id
              short_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getSchoolCascade(title): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
      query GetSchoolCascade{
        GetAllSchools(sorting:{short_name:asc}, rncp_title_name: "${title}") {
          _id
          short_name
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getAllSchoolIdAndShortName(): Observable<{ _id: string; short_name: string }[]> {
    return this.apollo
      .query<{ _id: string; short_name: string }[]>({
        query: gql`
          query GetAllSchoolIdAndShortName{
            GetAllSchools {
              _id
              short_name
            }
          }
        `,
      })
      .pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getschoolAndCity(): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetschoolAndCity{
            GetAllSchools {
              _id
              short_name
              school_address {
                city
                is_main_address
              }
              preparation_center_ats {
                rncp_title_id {
                  _id
                  short_name
                  classes {
                    _id
                    name
                  }
                }
              }
              certifier_ats {
                _id
                short_name
                classes {
                  _id
                  name
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getSchoolsBySchoolType(schoolType: string): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
      query {
        GetAllSchools(school_type: ${schoolType}) {
          _id
          short_name
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getSchoolsOfUser(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetSchoolsOfUser{
            GetAllSchools(user_login: true, sorting: { short_name: asc }) {
              _id
              short_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getSchoolsBySchoolTypeAndUser(schoolType: string): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
      query GetSchoolsBySchoolTypeAndUser{
        GetAllSchools(school_type: ${schoolType}, user_login:true, sorting: { short_name: asc}) {
          _id
          short_name
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getClassesByTitle(rncpId: string): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query GetAllClasses{
          GetAllClasses(rncp_id: "${rncpId}", sorting: { name: asc}) {
            _id
            name
          }
        }
      `,
      })
      .pipe(map((resp) => resp.data['GetAllClasses']));
  }

  getAllCompany(search, schoolid): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query GetAllCompany{
          GetAllCompanies(search: "${search}", school_id: "${schoolid}") {
            _id
            company_name
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCompanies']));
  }

  getOneDetailCompany(companyId): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query GetOneDetailCompany{
          GetOneCompany(_id: "${companyId}") {
            _id
            company_name
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneCompany']));
  }

  getMentorStudent(userType, company, schoolId): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query{
          GetAllUsers(entity: company, user_type: "${userType}", company: "${company}", company_schools: "${schoolId}"){
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

  getMentorInternship(userType, company): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query GetAllUsers{
          GetAllUsers(entity: company, user_type: "${userType}", company: "${company}"){
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

  getUserTypeMentor(): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetUserTypeMentor{
            GetAllUserTypes(search: "mentor") {
              _id
              name
              entity
            }
          }
        `,
      })
      .pipe(map((resp) => resp.data['GetAllUserTypes']));
  }

  getPublishedFoldersAndDocsOfSelectedTitle(titleId: string, classId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query {
        GetOneTitle(_id: "${titleId}" only_folder_with_published_document:true document_published_in_class_id:"${classId}") {
          academic_kit {
            categories {
              _id
              folder_name
              is_default_folder
              sub_folders_id {
                _id
                folder_name
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

  getSubfolders(folderId: string, classId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query GetSubfolders{
        GetOneAcadKit(_id: "${folderId}", document_published_in_class_id:"${classId}", only_sub_folder_with_published_document:true) {
          documents {
            _id
            document_name
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
          }
          sub_folders_id {
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

  getSchoolIdAndShortName(schoolId: string): Observable<{ _id: string; short_name: string }> {
    return this.apollo
      .query({
        query: gql`
      query GetSchoolIdAndShortName{
        GetOneSchool(_id: "${schoolId}") {
          _id
          short_name
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneSchool']));
  }

  getSchoolSpecialization(schoolId: string): Observable<any> {
    return this.apollo
      .watchQuery<any>({
        query: gql`
      query GetSchoolSpecialization{
        GetOneSchool(_id: "${schoolId}") {
          _id
          preparation_center_ats {
            rncp_title_id {
              _id
            }
            selected_specializations {
              _id
              name
            }
          }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneSchool']));
  }

  createSchool(payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation createSchool($school_input: SchoolInput) {
            CreateSchool(school_input: $school_input) {
              _id
              short_name
              long_name
            }
          }
        `,
        variables: {
          school_input: payload,
        },
      })
      .pipe(map((resp) => resp.data['CreateSchool']));
  }

  createStudent(payload, lang): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateStudent($student_input: StudentInput, $lang: String) {
            CreateStudent(student_input: $student_input, lang: $lang) {
              _id
              first_name
              last_name
            }
          }
        `,
        variables: {
          student_input: payload,
          lang: lang,
        },
      })
      .pipe(map((resp) => resp.data['CreateStudent']));
  }

  importStudent(payload, file: File, lang): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ImportStudent($import_student_input: ImportStudent!, $file: Upload!, $lang: String) {
            ImportStudent(import_student_input: $import_student_input, file: $file, lang: $lang) {
              studentsAdded {
                name
                status
                message
              }
              studentsNotAdded {
                name
                status
                message
              }
            }
          }
        `,
        variables: {
          import_student_input: payload,
          file: file,
          lang: lang,
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['ImportStudent']));
  }

  updateStudent(id, payload, lang): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateStudent($_id: ID!, $student_input: StudentInput, $lang: String) {
            UpdateStudent(_id: $_id, student_input: $student_input, lang: $lang) {
              _id
              first_name
              last_name
              rncp_title {
                _id
              }
              current_class {
                _id
              }
            }
          }
        `,
        variables: {
          student_input: payload,
          _id: id,
          lang: lang,
        },
      })
      .pipe(map((resp) => resp.data['UpdateStudent']));
  }

  updateSchool(id, payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation updateSchool($id: ID!, $school_input: SchoolUpdateInput) {
            UpdateSchool(_id: $id, school_input: $school_input) {
              short_name
              long_name
            }
          }
        `,
        variables: {
          id: id,
          school_input: payload,
        },
      })
      .pipe(map((resp) => resp.data['UpdateSchool']));
  }

  createTitle(payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation createTitle($title_input: RncpTitleInput) {
            CreateTitle(title_input: $title_input) {
              short_name
              long_name
            }
          }
        `,
        variables: {
          title_input: payload,
        },
      })
      .pipe(map((resp) => resp.data['CreateTitle']));
  }

  updateTitle(id, payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation updateTitle($id: ID!, $title_input: RncpTitleUpdateInput) {
            UpdateTitle(_id: $id, title_input: $title_input) {
              short_name
              long_name
            }
          }
        `,
        variables: {
          id: id,
          title_input: payload,
        },
      })
      .pipe(map((resp) => resp.data['UpdateTitle']));
  }

  getOneTitle(id) {
    return this.apollo
      .watchQuery<any>({
        query: gql`
      query GetOneTitle{
        GetOneTitle(_id: "${id}") {
          _id
          short_name
          journal_text
          journal_date

          long_name
          rncp_code
          rncp_level
          operator_dir_responsible{
            _id
            first_name
          }
          specializations{
            name
            is_specialization_assigned
          }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneTitle']));
  }

  getSchool(id: string) {
    return this.apollo
      .query({
        query: gql`
      query GetOneSchool{
        GetOneSchool(_id: "${id}") {
          _id
          logo
          long_name
          short_name
          school_address {
            address1
            postal_code
            country
            city
            department
            region
            is_main_address
          }
          retake_center {
            _id
            long_name
          }
          school_ref_id
          group_of_school_id {
            _id
            group_name
          }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneSchool']));
  }

  getSchoolPreparationCenterAndCertifier(id: string) {
    return this.apollo
      .query({
        query: gql`
      query GetSchoolPreparationCenterAndCertifier{
        GetOneSchool(_id: "${id}") {
          preparation_center_ats {
            rncp_title_id {
              _id
              short_name
              long_name
            }
            selected_specializations {
              _id
              name
            }
          }
          certifier_ats {
            _id
            short_name
            long_name
            specializations {
              _id
              name
            }
          }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneSchool']));
  }

  getSchoolsByTitle(rncpTitleId: string): Observable<{ preparation_centers: any[] }> {
    return this.apollo
      .query({
        query: gql`
      query GetSchoolsByTitle{
        GetOneTitle(_id: "${rncpTitleId}") {
          preparation_centers {
            _id
            short_name
          }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneTitle']));
  }

  getAcadofSchool(schoolId: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
      query GetAcadofSchool{
        GetAllUsers(school: "${schoolId}", user_type:"5a2e1ecd53b95d22c82f9554") {
          _id
          first_name
          last_name
          civility
          email
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  sendRegistrationEmail(titleId, classId, schoolId, lang): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
      mutation SendRegistrationEmail{
        SendStudentRegistrationEmail(rncp_title_id: "${titleId}", class_id: "${classId}", school_id: "${schoolId}", lang: "${lang}")
      }
      `,
      })
      .pipe(map((resp) => resp));
  }

  getGroupMemberDropdownSchool(): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetGroupMemberDropdownSchool{
            GetSchoolDropdownList(school_not_in_group: true) {
              _id
              short_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetSchoolDropdownList']));
  }

  createGroupOfSchool(payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation createGroupOfSchool($payload: GroupOfSchoolInput) {
            CreateGroupOfSchool(group_of_school_input: $payload) {
              _id
            }
          }
        `,
        variables: {
          payload: payload,
        },
      })
      .pipe(map((resp) => resp));
  }

  editGroupOfSchool(id, payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateGroupOfSchool($_id: ID!, $payload: GroupOfSchoolInput) {
            UpdateGroupOfSchool(_id: $_id, group_of_school_input: $payload) {
              _id
            }
          }
        `,
        variables: {
          _id: id,
          payload: payload,
        },
      })
      .pipe(map((resp) => resp));
  }

  deleteGroupOfSchool(id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteGroupOfSchool($_id: ID!) {
            DeleteGroupOfSchool(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id: id,
        },
      })
      .pipe(map((resp) => resp));
  }

  getAllGroupOfSchools(filter, sorting, pagination): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query getAllGroupOfSchoolTable($filter: SchoolGroupFilter, $sorting: SchoolGroupSorting, $pagination: PaginationInput) {
            GetAllGroupOfSchools(filter: $filter, sorting: $sorting, pagination: $pagination) {
              _id
              status
              group_name
              headquarter {
                _id
                short_name
              }
              school_members {
                _id
                short_name
              }
              rncp_titles {
                _id
                short_name
              }
              count_document
            }
          }
        `,
        variables: {
          filter: filter,
          sorting: sorting,
          pagination: pagination,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllGroupOfSchools']));
  }

  getAllGroupOfSchoolsDropdown(): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query getAllGroupOfSchoolDropdown {
            GetAllGroupOfSchools {
              _id
              group_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllGroupOfSchools']));
  }

  getAllGroupDropdown(): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetGroupOfSchoolDropdownListTable {
            GetGroupOfSchoolDropdownList {
              _id
              group_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetGroupOfSchoolDropdownList']));
  }

  getAllSchoolMemberDropdown(type: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
      query GetAllSchoolMemberDropdown{
        GetSchoolDropdownList(school_in_group: true, school_group_type: ${type}) {
          _id
          short_name
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetSchoolDropdownList']));
  }

  getTitleinGroupofSchoolDropdown(): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetTitleinGroupofSchoolDropdown{
            GetTitleDropdownList(school_group_title: true) {
              _id
              short_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetTitleDropdownList']));
  }

  getCountries() {
    return [
      'Albania',
      'Armenia',
      'Austria',
      'Belarus',
      'Belgium',
      'Bolivia',
      'Bosnia and Herzegovina',
      'Croatia',
      'Cyprus',
      'Czech Republic',
      'Denmark',
      'Democratic republic of Congo',
      'Estonia',
      'Ethiopia',
      'Finland',
      'France',
      'Georgia',
      'Germany',
      'Greece',
      'Greenland',
      'Hungary',
      'Iceland',
      'Indonesia',
      'Ireland',
      'Isle of Man',
      'Israel',
      'Italy',
      'Latvia',
      'Lesotho',
      'Liberia',
      'Liechtenstein',
      'Lithuania',
      'Luxembourg',
      'Maldives',
      'Netherlands',
      'Netherlands',
      'Norway',
      'Poland',
      'Portugal',
      'Romania',
      'Republic of Congo',
      'Senegal',
      'Serbia and Montenegro',
      'Slovakia',
      'Slovenia',
      'Spain',
      'Sweden',
      'Switzerland',
      'United Kingdom',
      'Venezuela',
    ];
  }

  // ----------------------------------------------------------
  // ===================== DUMMY DATA =========================
  // ----------------------------------------------------------

  @Cacheable()
  getSchools(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/school.json');
  }

  removeConnectedTitleFromSchool(_id: string, schoolId: string, type: string) {
    return this.apollo
      .mutate({
        mutation: gql`
      mutation {
        RemoveConnectedTitleFromSchool(
          title_id: "${_id}"
          school_id: "${schoolId}"
          connected_as: ${type}
        )
      }`,
        errorPolicy: 'all',
      })
      .pipe(map((resp) => resp));
  }

  sendEvalProN1(student_id: string, test_id: string) {
    return this.apollo
      .mutate({
        mutation: gql`
      mutation SendEvalProN1($lang: String) {
        SendEvalProN1(
          student_id: "${student_id}"
          test_id: "${test_id}"
          lang: $lang
        ) {
          _id
          name
        }
      }`,
        variables: {
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
        errorPolicy: 'all',
      })
      .pipe(map((resp) => resp));
  }

  sendEvalProN3(student_id: string, test_id: string) {
    return this.apollo
      .mutate({
        mutation: gql`
      mutation SendEvalProN3($lang: String) {
        SendEvalProN3(
          student_id: "${student_id}"
          test_id: "${test_id}"
          lang: $lang
        ) {
          _id
          name
        }
      }`,
        variables: {
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
        errorPolicy: 'all',
      })
      .pipe(map((resp) => resp));
  }

  getCountry(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/country.json');
  }

  checkPublishedAutoProEvalTest(titleId, classId): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query CheckPublishedAutoProEvalTest($rncp_title_id: ID, $class_id: ID) {
            CheckPublishedAutoProEvalTest(rncp_title_id: $rncp_title_id, class_id: $class_id) {
              published {
                test_type
                test_id {
                  _id
                  name
                }
              }
              unpublished
            }
          }
        `,
        variables: {
          rncp_title_id: titleId,
          class_id: classId,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['CheckPublishedAutoProEvalTest']));
  }

  getAllUserNote(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllUsers {
            GetAllUsers {
              _id
              first_name
              last_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }
}
