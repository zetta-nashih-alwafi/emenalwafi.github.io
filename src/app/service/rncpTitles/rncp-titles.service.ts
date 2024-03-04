import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Cacheable } from 'ngx-cacheable';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RNCPTitlesService {
  private selectedTitleSource = new BehaviorSubject<any>(null);
  private scrollEvent = new BehaviorSubject<any>(null);
  private courseSequenceData = new BehaviorSubject<any>(null);
  private courseData = new BehaviorSubject<any>(null);
  private sequenceEditData = new BehaviorSubject<any>(null);
  private titleIntake = new BehaviorSubject<any>(null);
  private courseSequenceEditMode = new BehaviorSubject<boolean>(false);
  private courseEditMode = new BehaviorSubject<boolean>(false);
  private _childrenFormValidationStatus = true;

  getScrollEvent$ = this.scrollEvent.asObservable();
  getCourseSequenceData$ = this.courseSequenceData.asObservable();
  getCourseData$ = this.courseData.asObservable();
  getCourseSequenceEditMode$ = this.courseSequenceEditMode.asObservable();
  getCourseEditMode$ = this.courseEditMode.asObservable();
  getSequenceEditData$ = this.sequenceEditData.asObservable();
  getTitleIntake$ = this.titleIntake.asObservable();

  setEventScroll(data: any) {
    this.scrollEvent.next(data);
  }

  setCourseSequenceData(data: any) {
    this.courseSequenceData.next(data);
  }

  setSequenceData(data: any) {
    this.sequenceEditData.next(data);
  }

  setCourseData(data: any) {
    this.courseData.next(data);
  }

  setCourseSequenceEditMode(data: boolean) {
    this.courseSequenceEditMode.next(data);
  }

  setCourseEditMode(data: boolean) {
    this.courseEditMode.next(data);
  }

  setSelectedTitle(title: any) {
    this.selectedTitleSource.next(title);
  }

  setTitleIntake(title: any) {
    this.titleIntake.next(title);
  }

  getSelectedTitle() {
    return this.selectedTitleSource.value;
  }

  constructor(private httpClient: HttpClient, private apollo: Apollo, private translate: TranslateService) {}

  private scoreData = new BehaviorSubject<any>(null);

  selectedDataStudent$ = this.scoreData.asObservable();

  public get childrenFormValidationStatus() {
    return this._childrenFormValidationStatus;
  }

  public set childrenFormValidationStatus(state: boolean) {
    this._childrenFormValidationStatus = state;
  }

  setDataScore(data: any) {
    this.scoreData.next(data);
  }

  downloadFile(params) {
    const url = environment.apiUrl.replace('/graphql', '');
    return this.httpClient.post(`${url}/download/statusUpdateCsv`, params, { responseType: 'text' }).pipe(map((res: any) => res));
  }

  downloadGrandOralResult(payload) {
    const url = environment.apiUrl.replace('/graphql', '');
    return this.httpClient.post(`${url}/download/grandOralPdfFinalTranscript`, payload, { responseType: 'json' }).pipe(map((res) => res));
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

  getEnumTaskType() {
    return [
      {
        name: 'Assign Corrector',
        value: 'Assign Corrector',
      },
      {
        name: 'Marks Entry',
        value: 'Marks Entry',
      },
      {
        name: 'Validate Test',
        value: 'Validate Test',
      },
      {
        name: 'Document Expected',
        value: 'document_expected',
      },
      {
        name: 'Create Groups',
        value: 'Create Groups',
      },
      {
        name: 'Assign Student',
        value: 'assign_student_for_jury',
      },
      {
        name: 'Upload Grand Oral CV',
        value: 'student_upload_grand_oral_cv',
      },
      {
        name: 'Upload Grand Oral Presentation',
        value: 'student_upload_grand_oral_presentation',
      },
      { name: 'Manual Task', value: 'add_task' },
    ];
  }

  getEnumTaskTypeEdh() {
    return [
      {
        name: 'Complete contract/convention form',
        value: 'Complete contract/convention form',
      },
      {
        name: 'Step validation required',
        value: 'Step validation required',
      },
      {
        name: 'Validate Financement',
        value: 'Validate Financement',
      },
      {
        name: 'Validate Contract Process Step',
        value: 'validate_contract_process',
      },
      {
        name: 'Validate FC Contract Process Step',
        value: 'validate_fc_contract_process',
      },
      {
        name: 'Validate Student Admission Process',
        value: 'validate_student_admission_process',
      },
      {
        name: 'Validate One Time Form',
        value: 'validate_one_time_form',
      }
    ];
  }

  getTitleDropdown(shouldHaveClass: boolean) {
    return this.apollo
      .query<any[]>({
        query: gql`
        query {
          GetAllTitles(should_have_class: ${shouldHaveClass}) {
            _id
            short_name
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTitles']));
  }

  getTitleSearchDropdown(search: string) {
    return this.apollo
      .query<any[]>({
        query: gql`
        query {
          GetTitleDropdownList(should_have_class: ${true}, search: "${search}") {
            _id
            short_name
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetTitleDropdownList']));
  }

  getScholarSeasons() {
    return this.apollo
      .query({
        query: gql`
          query {
            GetAllScholarSeasons {
              _id
              scholar_season
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllScholarSeasons']));
  }

  getTitleConditionSearchDropdown(evaType: string, subType: string) {
    return this.apollo
      .query<any[]>({
        query: gql`
        query {
          GetTitleDropdownList(
            should_have_class_with_condition: ${true},
            type_evaluation: ${evaType},
            sub_type_evaluation: ${subType}
            ) {
            _id
            short_name
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetTitleDropdownList']));
  }

  getTitleConditionSearchNotScore(evaType: string) {
    return this.apollo
      .query<any[]>({
        query: gql`
        query {
          GetTitleDropdownList(
            should_have_class_with_condition: ${true},
            type_evaluation: ${evaType}
            ) {
            _id
            short_name
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetTitleDropdownList']));
  }

  getClassDropdown(id: string, search: string) {
    return this.apollo
      .query<any[]>({
        query: gql`
        query {
          GetClassDropdownList(rncp_id: "${id}", search: "${search}") {
            _id
            name
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetClassDropdownList']));
  }

  getClassConditionDropdown(id: string, search: string, evaType: string) {
    return this.apollo
      .query<any[]>({
        query: gql`
        query {
          GetClassDropdownList(should_have_condition: ${true}, rncp_id: "${id}", search: "${search}", type_evaluation: ${evaType}) {
            _id
            name
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetClassDropdownList']));
  }

  getClassConditionDropdownWithScore(id: string, search: string, evaType: string, subType: string) {
    return this.apollo
      .query<any[]>({
        query: gql`
        query {
          GetClassDropdownList(
            should_have_condition: ${true},
            rncp_id: "${id}",
            search: "${search}",
            type_evaluation: ${evaType},
            sub_type_evaluation : ${subType}) {
            _id
            name
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetClassDropdownList']));
  }

  getOneTitleById(id: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query {
          GetOneTitle(_id: "${id}") {
            _id
            rncp_logo
            is_certifier_also_pc
            short_name
            long_name
            rncp_code
            rncp_level
            rncp_level_europe
            is_published
            journal_text
            journal_date
            certifier {
              _id
              short_name
              long_name
              logo
              school_address {
                region
                postal_code
                department
                city
                country
                address1
                address2
                is_main_address
              }
            }
            specializations {
              _id
              name
              is_specialization_assigned
            }
            operator_dir_responsible {
              _id
              first_name
              last_name
              civility
            }
            academic_kit {
              is_created
            }
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneTitle']));
  }

  getSchoolList(titleId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query {
          GetOneTitle(_id: "${titleId}") {
            _id
            preparation_centers {
              _id
              short_name
            }
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneTitle']['preparation_centers']));
  }

  getAllZipCode(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query {
            GetAllZipCodes {
              city
              province
              country
            }
          }
        `,
      })
      .pipe(map((resp) => resp.data['GetAllZipCodes']));
  }

  getFilteredZipCode(zip_code: string, country: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query GetAllZipCodes{
        GetAllZipCodes(zip_code: "${zip_code}", country: "${country}") {
          city
          province
          academy
          region_code
          department
        }
      }
      `,
      })
      .pipe(map((resp) => resp.data['GetAllZipCodes']));
  }

  getRncpTitlesDetails(): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query {
            GetAllTitles {
              _id
              short_name
              long_name
              rncp_level
              rncp_level_europe
              is_published
              certifier {
                _id
                short_name
                logo
              }
              operator_dir_responsible {
                _id
                first_name
                last_name
              }
              academic_kit {
                is_created
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTitles']));
  }

  getRncpTitlesForUrgent(search): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query {
            GetTitleDropdownList(search: "${search}") {
              _id
              short_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetTitleDropdownList']));
  }

  getRncpTitlesForTutorial(): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query {
            GetAllTitles {
              _id
              short_name
              long_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTitles']));
  }

  getRncpTitlesForTutorialAcad(rncp_title_ids): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query ($rncp_title_ids: [ID]) {
            GetAllTitles(rncp_title_ids: $rncp_title_ids) {
              _id
              short_name
              long_name
            }
          }
        `,
        variables: {
          rncp_title_ids: rncp_title_ids,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTitles']));
  }

  getRncpTitlesByUser(isPublished: boolean, filterByUsedLogin = 'all'): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query ($is_published: Boolean, $filter_by_user_login: EnumFilterByUserLogin) {
            GetAllTitles(is_published: $is_published, filter_by_user_login: $filter_by_user_login) {
              _id
              short_name
              long_name
              rncp_level
              rncp_level_europe
              is_published
              certifier {
                _id
                short_name
              }
              operator_dir_responsible {
                _id
                first_name
                last_name
              }
              academic_kit {
                is_created
              }
            }
          }
        `,
        variables: {
          is_published: isPublished,
          filter_by_user_login: filterByUsedLogin,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTitles']));
  }

  getRncpTitlesByUserForAcademic(isPublished: boolean, titleId: string[]): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query ($is_published: Boolean, $rncp_title_ids: [ID]) {
            GetAllTitles(is_published: $is_published, rncp_title_ids: $rncp_title_ids) {
              _id
              short_name
              long_name
              rncp_level
              rncp_level_europe
              is_published
              certifier {
                _id
                short_name
                logo
              }
              operator_dir_responsible {
                _id
                first_name
                last_name
              }
              academic_kit {
                is_created
              }
            }
          }
        `,
        variables: {
          is_published: isPublished,
          rncp_title_ids: titleId,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTitles']));
  }

  getRncpTitlesForAcademic(titleId: string[]): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query ($rncp_title_ids: [ID]) {
            GetAllTitles(rncp_title_ids: $rncp_title_ids) {
              _id
              short_name
              long_name
              rncp_level
              rncp_level_europe
              is_published
              certifier {
                _id
                short_name
              }
              operator_dir_responsible {
                _id
                first_name
                last_name
              }
              academic_kit {
                is_created
              }
            }
          }
        `,
        variables: {
          rncp_title_ids: titleId,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTitles']));
  }

  getRncpTitlesBySchool(isPublished: boolean, schoolId): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query ($is_published: Boolean, $school_id: [String]) {
            GetAllTitles(is_published: $is_published, school_id: $school_id) {
              _id
              short_name
              long_name
              rncp_level
              rncp_level_europe
              is_published
              certifier {
                _id
                short_name
                logo
              }
              operator_dir_responsible {
                _id
                first_name
                last_name
              }
              academic_kit {
                is_created
              }
            }
          }
        `,
        variables: {
          is_published: isPublished,
          school_id: schoolId,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTitles']));
  }

  getRncpTitlesBySchoolTypeAndId(schoolType: string, schoolId: string): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query getAllTitleDropdownUserDialog {
          GetAllTitles(school_type: "${schoolType}", school_id: "${schoolId}") {
            _id
            short_name
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTitles']));
  }

  getRncpTitlesBySchoolId(schoolId: string): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query GetTitleDropdown {
          GetAllTitles(school_id: "${schoolId}", school_type: "preparation_center") {
            _id
            short_name
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTitles']));
  }

  getRncpTitlesDropdownForCorrectorProblematic(schoolId: string, usertypeId: string): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query GetTitleDropdownProblematic {
          GetAllTitles(school_id: "${schoolId}", user_login_type: "${usertypeId}") {
            _id
            short_name
          }
        }
      `,
      })
      .pipe(map((resp) => resp.data['GetAllTitles']));
  }

  getClassDropdownForCorrectorProblematic(rncpId: string, usertypeId: string): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query GetClassDropdownProblematic {
          GetAllClasses(rncp_id: "${rncpId}", user_login_type: "${usertypeId}") {
            _id
            name
            status
          }
        }
      `,
      })
      .pipe(map((resp) => resp.data['GetAllClasses']));
  }

  getRncpTitlesCompany(): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query {
            GetAllTitles(school_type: "preparation_center") {
              _id
              short_name
            }
          }
        `,
      })
      .pipe(map((resp) => resp.data['GetAllTitles']));
  }

  getTitleByAcadir(schoolId: string): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query{
          GetAllTitles(filter_by_user_login: acadir, school_id: "${schoolId}"){
            _id
            short_name
          }
        }
      `,
      })
      .pipe(map((resp) => resp.data['GetAllTitles']));
  }

  getClasses(): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query {
            GetAllClasses {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllClasses']));
  }

  getClassesByTitle(rncpId: string): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query GetAllClasses{
          GetAllClasses(rncp_id: "${rncpId}") {
            _id
            name
            type_evaluation
            already_have_jury_decision
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllClasses']));
  }

  getClassOfTitle(rncpId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query {
          GetOneTitle(_id: "${rncpId}") {
            classes {
              _id
              name
              status
            }
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneTitle']['classes']));
  }

  getSpecializations(rncpId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query {
          GetOneTitle(_id: "${rncpId}") {
            specializations {
              _id
              name
            }
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneTitle']['specializations']));
  }

  getSelectedRncpTitle() {
    return {
      long_name: 'Responsable Administratif Bilingue - Office Manager',
      rncp_level: '6',
      short_name: 'S-RAB 2020',
      _id: '5b69d1c481935943d24d25e8',
      is_published: true,
    };
  }

  createNewTitle(payload: any): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation createTitle($title_input: RncpTitleInput) {
          CreateTitle(title_input: $title_input) {
            _id
          }
        }
      `,
      variables: {
        title_input: payload,
      },
      errorPolicy: 'all',
    });
  }

  createTask(payload: any, schoolId): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateTask($task_input: AcadTaskInput, $lang: String!, $user_login_school_id: ID) {
            CreateTask(task_input: $task_input, lang: $lang, user_login_school_id: $user_login_school_id) {
              _id
            }
          }
        `,
        variables: {
          user_login_school_id: schoolId,
          task_input: payload,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
        errorPolicy: 'all',
      })
      .pipe(map((resp) => resp));
  }

  updateTask(payload: any, taskId): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateTask($task_input: AcadTaskInput, $_id: ID!) {
            UpdateTask(task_input: $task_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id: taskId,
          task_input: payload,
        },
        errorPolicy: 'all',
      })
      .pipe(map((resp) => resp));
  }

  createTaskNonSchool(payload: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateTask($task_input: AcadTaskInput, $lang: String!) {
            CreateTask(task_input: $task_input, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          task_input: payload,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
        errorPolicy: 'all',
      })
      .pipe(map((resp) => resp));
  }

  getFilteredCertifierSchool(search: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query {
          GetSchoolDropdownList(search: "${search}", school_type:"certifier") {
            _id
            short_name
            long_name
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetSchoolDropdownList']));
  }

  getAllCertifierSchool(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllCertifierSchool {
            GetSchoolDropdownList(school_type: "certifier") {
              _id
              long_name
              short_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetSchoolDropdownList']));
  }

  getFilteredAllSchool(search: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query {
          GetSchoolDropdownList(search: "${search}") {
            _id
            short_name
            long_name
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetSchoolDropdownList']));
  }

  getOneCertifierSchool(schoolId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query {
          GetOneSchool(_id:"${schoolId}") {
            _id
            short_name
            long_name
            logo
            school_address {
              address1
              address2
              postal_code
              country
              city
              region
              department
              is_main_address
            }
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneSchool']));
  }

  getSchoolName(schoolId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query {
          GetOneSchool(_id:"${schoolId}") {
            _id
            short_name
            long_name
            logo
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneSchool']));
  }

  getCertifierSchool(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query {
            GetAllSchools(school_type: "certifier") {
              _id
              short_name
              long_name
              logo
              school_address {
                address1
                address2
                postal_code
                city
                country
                region
                department
              }
            }
          }
        `,
      })
      .pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getAllSchoolDropdown(rncp_title_ids): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllSchools($rncp_title_ids: [ID]) {
            GetAllSchools(rncp_title_ids: $rncp_title_ids) {
              _id
              short_name
              long_name
              logo
              school_address {
                address1
                address2
                postal_code
                city
                country
                region
                department
              }
            }
          }
        `,
        variables: {
          rncp_title_ids: rncp_title_ids ? rncp_title_ids : '',
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllSchools']));
  }

  // getPendingTask(): Observable<any> {
  // }

  // ----------------------------------------------------------
  // ===================== DUMMY DATA =========================
  // ----------------------------------------------------------

  @Cacheable()
  getRncpTitles(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/rncp-titles.json');
  }

  @Cacheable()
  getShortRncpTitles(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/short-rncp-titles.json');
  }

  @Cacheable()
  getPendingTask(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/pendingtask.json');
  }

  @Cacheable()
  getCalendar(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/calendar.json');
  }

  @Cacheable()
  getAcademicKit(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/academickit.json');
  }

  @Cacheable()
  getAcadClass(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/acadClass.json');
  }

  @Cacheable()
  getAcadDocuments(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/acadDocuments.json');
  }

  // ----------------------------------------------------------
  // ===================== END OF DUMMY DATA ==================
  // ----------------------------------------------------------

  getTitleName(titleId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneTitle($titleId: ID!) {
            GetOneTitle(_id: $titleId) {
              short_name
              long_name
            }
          }
        `,
        variables: {
          titleId,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneTitle'];
        }),
      );
  }

  // Pending Task CRUD
  getAllPendingTasks(titleId: string, pagination, sorting, filter, userTypeId) {
    return this.apollo
      .query({
        query: gql`
          query GetPendingTasks(
            $titleId: ID
            $pagination: PaginationInput
            $sorting: PendingTaskSorting
            $filter: PendingTaskFilter
            $userTypeId: ID
          ) {
            GetPendingTasks(rncp_id: $titleId, pagination: $pagination, sorting: $sorting, filter: $filter, user_login_type: $userTypeId) {
              _id
              test_group_id {
                _id
                name
              }
              jury_id {
                _id
                name
                type
              }
              due_date {
                date
                time
              }
              created_date {
                date
                time
              }
              school {
                _id
                short_name
              }
              rncp {
                _id
                short_name
              }
              class_id {
                _id
                name
              }
              created_by {
                _id
                civility
                first_name
                last_name
              }
              user_selection {
                user_id {
                  _id
                  civility
                  first_name
                  last_name
                  student_id {
                    _id
                  }
                }
                user_type_id {
                  _id
                  name
                }
              }
              description
              type
              test {
                _id
                date_type
                name
                group_test
                correction_type
                subject_id {
                  subject_name
                }
                evaluation_id {
                  _id
                  evaluation
                }
                parent_category {
                  _id
                  folder_name
                }
              }
              priority
              count_document
              expected_document_id
              task_status
              for_each_student
              for_each_group
              expected_document {
                file_type
              }
              student_id {
                _id
                first_name
                last_name
                civility
              }
              action_taken
              document_expecteds {
                name
              }
            }
          }
        `,
        variables: {
          titleId,
          sorting,
          pagination,
          filter,
          userTypeId,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetPendingTasks'];
        }),
      );
  }

  getAllPendingTasksBySchool(titleId: string, pagination, sorting, filter, schoolId, userTypeId) {
    return this.apollo
      .query({
        query: gql`
          query GetPendingTasks(
            $titleId: ID
            $pagination: PaginationInput
            $sorting: PendingTaskSorting
            $filter: PendingTaskFilter
            $school_id: ID
            $userTypeId: ID
          ) {
            GetPendingTasks(
              rncp_id: $titleId
              pagination: $pagination
              sorting: $sorting
              filter: $filter
              school_id: $school_id
              user_login_type: $userTypeId
            ) {
              _id
              test_group_id {
                _id
                name
              }
              created_date {
                date
                time
              }
              due_date {
                date
                time
              }
              school {
                _id
                short_name
              }
              rncp {
                _id
                short_name
              }
              class_id {
                _id
                name
              }
              created_by {
                _id
                civility
                first_name
                last_name
              }
              user_selection {
                user_id {
                  _id
                  civility
                  first_name
                  last_name
                  student_id {
                    _id
                  }
                }
                user_type_id {
                  _id
                  name
                }
              }
              description
              type
              test {
                _id
                date_type
                name
                group_test
                correction_type
                subject_id {
                  subject_name
                }
                evaluation_id {
                  _id
                  evaluation
                }
                parent_category {
                  _id
                  folder_name
                }
              }
              priority
              count_document
              expected_document_id
              task_status
              for_each_student
              for_each_group
              expected_document {
                file_type
              }
              student_id {
                _id
                first_name
                last_name
                civility
              }
              action_taken
              document_expecteds {
                name
              }
            }
          }
        `,
        variables: {
          titleId,
          sorting,
          pagination,
          filter,
          school_id: schoolId,
          userTypeId,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetPendingTasks'];
        }),
      );
  }

  checkPendingTask(rncp_id, school_id, pagination = { limit: 1, page: 0 }) {
    return this.apollo
      .query({
        query: gql`
          query GetPendingTasks($school_id: ID, $rncp_id: ID, $pagination: PaginationInput) {
            GetPendingTasks(school_id: $school_id, rncp_id: $rncp_id, pagination: $pagination) {
              _id
            }
          }
        `,
        variables: {
          rncp_id,
          pagination,
          school_id,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetPendingTasks'];
        }),
      );
  }

  // End of Pending Task CRUD

  // Get all rncpTitle only short name and long name
  getRncpTitleListData(should_have_condition_of_award?: boolean): Observable<any[]> {
    const shouldHaveCondition: boolean = should_have_condition_of_award ? should_have_condition_of_award : false;
    return this.apollo
      .query({
        query: gql`
        query {
          GetAllTitles(should_have_condition_of_award: ${shouldHaveCondition}) {
            _id
            short_name
            long_name
            classes {
              _id
              name
            }
          }
        }
      `,
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllTitles'];
        }),
      );
  }

  // Get all rncpTitle only short name and long name
  getAllRncpTitleListData(should_have_condition_of_award, rncp_title_ids): Observable<any[]> {
    const shouldHaveCondition: boolean = should_have_condition_of_award ? should_have_condition_of_award : false;
    return this.apollo
      .query({
        query: gql`
        query($rncp_title_ids: [ID]) {
          GetAllTitles(should_have_condition_of_award: ${shouldHaveCondition}, rncp_title_ids: $rncp_title_ids) {
            _id
            short_name
            long_name
          }
        }
      `,
        variables: {
          rncp_title_ids: rncp_title_ids,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllTitles'];
        }),
      );
  }

  getRncpTitleListSearch(school_id): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
        query {
          GetAllTitles(school_id: "${school_id}") {
            _id
            short_name
            long_name
          }
        }
      `,
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllTitles'];
        }),
      );
  }

  getUserTypeListSearch(school_id): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
        query GetDropdownUserType($exclude_company: Boolean){
          GetAllUserTypes(school: "${school_id}", exclude_company: $exclude_company) {
            _id
            name
            entity
          }
        }
      `,
        variables: {
          exclude_company: true,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllUserTypes'];
        }),
      );
  }

  // Get all class by rncp title
  getClassByRncpTitle(rncpId: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
        query {
          GetAllClasses(rncp_id: "${rncpId}") {
            _id
            name
            description
            type_evaluation
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp['data']['GetAllClasses'];
        }),
      );
  }

  deleteClass(id: string): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
      mutation {
        DeleteClass(_id : "${id}") {
          _id
        }
      }
      `,
      errorPolicy: 'all',
    });
  }

  updateRncpTitle(id: string, titleData: any): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation UpdateTitle($id: ID!, $titleData: RncpTitleUpdateInput) {
          UpdateTitle(_id: $id, title_input: $titleData) {
            _id
            is_published
          }
        }
      `,
      variables: {
        id,
        titleData,
      },
      errorPolicy: 'all',
    });
    // .pipe(map(resp => resp.data['UpdateTitle']));
  }

  // Get single rncp title
  getRncpTitleById(rncpId: string) {
    return this.apollo
      .query({
        query: gql`
        query GetOneTitle{
          GetOneTitle(_id: "${rncpId}") {
            short_name
            long_name
            _id
          }
        }
      `,
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneTitle'];
        }),
      );
  }

  // Get single user type
  getOneUserTypes(ID: String): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query{
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

  // Get single class
  getClassById(classId: string) {
    return this.apollo
      .query({
        query: gql`
        query {
          GetOneClass(_id: "${classId}") {
            _id
            name
            description
            type_evaluation
            allow_job_description
            allow_problematic
            allow_mentor_evaluation
            allow_employability_survey
            is_mentor_selected_in_job_description
            is_job_desc_active
            is_problematic_active
            is_employability_survey_active
            problematic_send_to_certifier_time
            job_desc_activation_date {
              date
              time
            }
            questionnaire_template_id {
              _id
            }
            problematic_questionnaire_template_id {
              _id
            }
            problematic_activation_date {
              date
              time
            }
            identity_verification {
              allow_auto_send_identity_verification
              identity_verification_activation_date {
                date_utc
                time_utc
              }
            }
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneClass'];
        }),
      );
  }

  // Get single class
  getClassByIdOnCompany(classId: string) {
    return this.apollo
      .query({
        query: gql`
        query {
          GetOneClass(_id: "${classId}") {
            _id
            name
            description
            type_evaluation
            allow_job_description
            allow_problematic
            allow_mentor_evaluation
            allow_employability_survey
            is_mentor_selected_in_job_description
            is_job_desc_active
            is_problematic_active
            is_employability_survey_active
            problematic_send_to_certifier_time
            job_desc_activation_date {
              date
              time
            }
            questionnaire_template_id {
              _id
            }
            problematic_questionnaire_template_id {
              _id
            }
            problematic_activation_date {
              date
              time
            }
            identity_verification {
              allow_auto_send_identity_verification
              identity_verification_activation_date {
                date_utc
                time_utc
              }
            }
            test_auto_pro_published(class_id: "${classId}")
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneClass'];
        }),
      );
  }

  // Get single class
  getClassForValidation(classId: string) {
    return this.apollo
      .query({
        query: gql`
        query {
          GetOneClass(_id: "${classId}") {
            _id
            name
            pass_fail_conditions {
              _id
              condition_name
              condition_type
              condition_parameters {
                correlation
                validation_type
                validation_parameter {
                  parameter_type
                  percentage_value
                  block_id {
                    _id
                    block_of_competence_condition
                  }
                  subject_id {
                    _id
                    subject_name
                  }
                  evaluation_id {
                    _id
                    evaluation
                  }
                  sign
                }
                pass_mark
              }
            }
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneClass'];
        }),
      );
  }

  getClassESById(classId: string) {
    return this.apollo
      .query({
        query: gql`
        query {
          GetOneClass(_id: "${classId}") {
            _id
            parent_rncp_title{
              _id
            }
            employability_surveys{
              _id
              employability_survey_sent
              questionnaire_template_id{
                _id
              }
              send_date
              send_time
              expiration_date
              expiration_time
              send_only_to_pass_student
              send_only_to_not_mention_continue_study
              send_only_to_pass_latest_retake_student
              with_rejection_flow
              is_required_for_certificate
              validator
            }
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneClass'];
        }),
      );
  }

  // Get single class
  getClassScoreConversionById(classId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query {
          GetOneClass(_id: "${classId}") {
            _id
            name
            description
            type_evaluation
            allow_job_description
            allow_problematic
            allow_mentor_evaluation
            score_conversions_competency {
              _id
              sign
              score
              phrase
              letter
            }
            score_conversions_soft_skill {
              _id
              sign
              score
              phrase
              letter
            }
            max_score_competency
            max_score_soft_skill
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneClass'];
        }),
      );
  }

  // Get single class
  getQuestionaireJobDesc(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query {
            GetAllQuestionnaireTemplate(filter: { questionnaire_type: job_description }) {
              _id
              questionnaire_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllQuestionnaireTemplate'];
        }),
      );
  }

  getQuestionaireProblematic(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query {
            GetAllQuestionnaireTemplate(filter: { questionnaire_type: problematic }) {
              _id
              questionnaire_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllQuestionnaireTemplate'];
        }),
      );
  }

  getQuestionaireES(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query {
            GetAllQuestionnaireTemplate(filter: { questionnaire_type: employability_survey, published_status: publish }) {
              _id
              questionnaire_name
              is_continue_study
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllQuestionnaireTemplate'];
        }),
      );
  }

  /* Create new class*/
  createNewClass(any) {
    return this.apollo.mutate({
      mutation: gql`
        mutation CreateClass($any: any) {
          CreateClass(class_input: $any) {
            _id
            description
            name
          }
        }
      `,
      variables: {
        any,
      },
      errorPolicy: 'all',
    });
  }
  createNewClassDuplicate(any, duplicateClass) {
    return this.apollo.mutate({
      mutation: gql`
        mutation CreateClass($any: any, $duplicateClass: Duplicateany) {
          CreateClass(class_input: $any, duplicate_class: $duplicateClass) {
            _id
            description
            name
          }
        }
      `,
      variables: {
        any,
        duplicateClass,
      },
      errorPolicy: 'all',
    });
  }

  updateClassParameter(classId: string, any: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateClassParameter($classId: ID!, $any: any) {
            UpdateClass(_id: $classId, class_input: $any) {
              name
              max_score_soft_skill
              max_score_competency
              score_conversions_competency {
                sign
                score
                phrase
                letter
              }
              score_conversions_soft_skill {
                sign
                score
                phrase
                letter
              }
            }
          }
        `,
        variables: { classId, any },
        errorPolicy: 'all',
      })
      .pipe(map((resp) => resp));
  }

  updateClass(classId: string, any: any): Observable<{ name: string }> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateClass($classId: ID!, $any: any) {
            UpdateClass(_id: $classId, class_input: $any) {
              name
            }
          }
        `,
        variables: { classId, any },
      })
      .pipe(map((resp) => resp.data['UpdateClass']));
  }

  updateScore(classId: string, any: any): Observable<{ name: string }> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateClassOnEvalExpertise($classId: ID!, $any: any) {
            UpdateClass(_id: $classId, class_input: $any) {
              max_score_competency
              score_conversions_competency {
                sign
                score
                phrase
                letter
              }
              max_score_soft_skill
              score_conversions_soft_skill {
                sign
                score
                phrase
                letter
              }
            }
          }
        `,
        variables: { classId, any },
      })
      .pipe(map((resp) => resp.data['UpdateClass']));
  }

  getAllFinalTranscriptParameters(): Observable<any> {
    return this.apollo.query({
      query: gql`
        query {
          GetAllFinalTranscriptParameter {
            final_n2_deadline
            final_n3_deadline
            final_n3_special_text
            final_n7_jury_decision
            final_n7_extra_retake
          }
        }
      `,
    });
  }

  getOneFinalTranscriptParameter(rncp_id: string, class_id: string): Observable<any> {
    return this.apollo.query({
      query: gql`
      query {
        GetOneFinalTranscriptParameter(rncp_id : "${rncp_id}", class_id : "${class_id}") {
          _id
          final_n2_deadline
          final_n3_deadline
          final_n3_special_text
          final_n7_jury_decision
          final_n7_extra_retake
        }
      }
      `,
      fetchPolicy: 'network-only',
    });
  }

  createFinalTranscriptParameter(data: any): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
      mutation {
        CreateFinalTranscriptParameter(final_transcript_parameter_input : {
          rncp_id : "${data.rncp_id}",
          class_id : "${data.class_id}",
          final_n2_deadline : "${data.N2_Deadline}",
          final_n3_deadline : "${data.N3_Deadline}",
          final_n3_special_text : "${data.N3_Special_Text}",
          final_n7_jury_decision : "${data.N7_Date_Jury_Decision}",
          final_n7_extra_retake : "${data.N7_Retake_Date}"
        }) {
          _id
          final_n2_deadline
          final_n3_deadline
          final_n3_special_text
          final_n7_jury_decision
          final_n7_extra_retake
        }
      }`,
    });
  }

  updateFinalTranscriptParameter(paramID: string, data: any): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
      mutation{
        UpdateFinalTranscriptParameter(_id:"${paramID}", final_transcript_parameter_input:{
          rncp_id : "${data.rncp_id}",
          class_id : "${data.class_id}",
          final_n2_deadline : "${data.N2_Deadline}",
          final_n3_deadline : "${data.N3_Deadline}",
          final_n3_special_text : "${data.N3_Special_Text}",
          final_n7_jury_decision : "${data.N7_Date_Jury_Decision}",
          final_n7_extra_retake : "${data.N7_Retake_Date}"
        }){
          final_n2_deadline
          final_n3_deadline
          final_n3_special_text
          final_n7_jury_decision
          final_n7_extra_retake
        }
      }`,
    });
  }

  createCertificateParameter(data: any): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
      mutation{
        CreateCertificateParameter(certificate_parameter_input:{
          rncp_id : "${data.rncp_id}",
          class_id : "${data.class_id}",
          rncp_logo : {
            file_name : "",
            file_path : ""
          },
          certifier_logo : {
            file_name : "",
            file_path : ""
          },
          certifier_admin_signature : {
            file_name : "${data.adminName}",
            file_path : "${data.adminSrc}"
          },
          certifier_stamp :{
            file_name : "${data.stampName}",
            file_path : "${data.stampSrc}"
          },
          certificate_background_image: {
            file_name : "${data.BGName}",
            file_path : "${data.BGSrc}"
          },
          font_type :"${data.fontType}",
          font_size: ${data.fontSize},
          header : "${data.headers}",
          footer : "${data.footers}",
          certificate_issuance_date : "${data.date}"
        }){
          certifier_admin_signature{
            file_name
            file_path
          }
          certifier_stamp{
            file_name
            file_path
          }
          certificate_background_image{
            file_name
            file_path
          }
          font_type
          font_size
          header
          footer
          certificate_issuance_date
        }
      }
      `,
    });
  }

  updateCertificateParameter(data: any): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
      mutation{
        UpdateCertificateParameter(_id : "${data._id}", certificate_parameter_input:{
          rncp_id : "${data.rncp_id}",
          class_id : "${data.class_id}",
          rncp_logo : {
            file_name : "",
            file_path : ""
          },
          certifier_logo : {
            file_name : "",
            file_path : ""
          },
          certifier_admin_signature : {
            file_name : "${data.adminName}",
            file_path : "${data.adminSrc}"
          },
          certifier_stamp :{
            file_name : "${data.stampName}",
            file_path : "${data.stampSrc}"
          },
          certificate_background_image: {
            file_name : "${data.BGName}",
            file_path : "${data.BGSrc}"
          },
          font_type :"${data.fontType}",
          font_size: ${data.fontSize},
          header : "${data.headers}",
          footer : "${data.footers}",
          certificate_issuance_date : "${data.date}"
        }){
          certifier_admin_signature{
            file_name
            file_path
          }
          certifier_stamp{
            file_name
            file_path
          }
          certificate_background_image{
            file_name
            file_path
          }
          font_type
          font_size
          header
          footer
          certificate_issuance_date
        }
      }
      `,
    });
  }

  getOneCertificateParameter(data: any): Observable<any> {
    return this.apollo.query({
      query: gql`
      query{
        GetOneCertificateParameter(rncp_id:"${data.rncp_id}", class_id:"${data.class_id}"){
          _id
          certifier_admin_signature{
            file_name
            file_path
          }
          certifier_stamp{
            file_name
            file_path
          }
          certificate_background_image{
            file_name
            file_path
          }
          font_type
          font_size
          header
          footer
          certificate_issuance_date
        }
      }
      `,
      fetchPolicy: 'network-only',
    });
  }

  getFirstCondition(rncpId: string, classId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query{
        GetFirstConditionSetUp (rncp_id:"${rncpId}", class_id:"${classId}"){
          type_evaluation
          sub_type_evaluation
          evaluation_step
          evaluation_max_point
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetFirstConditionSetUp']));
  }

  saveFirstCondition(classId: string, firstStepData): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation CreateUpdateCondition($classId: ID!, $firstStepData: FirstConditionSetUpInput) {
          CreateUpdateCondition(class_id: $classId, first_step_input: $firstStepData) {
            type_evaluation
            sub_type_evaluation
          }
        }
      `,
      variables: {
        classId,
        firstStepData,
      },
      errorPolicy: 'all',
    });
  }

  duplicateCondition(classId: string, duplicateConditionInput): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation CreateUpdateCondition($classId: ID!, $duplicateConditionInput: DuplicateConditionInput) {
          CreateUpdateCondition(class_id: $classId, duplicate_condition: $duplicateConditionInput) {
            type_evaluation
            sub_type_evaluation
          }
        }
      `,
      variables: {
        classId,
        duplicateConditionInput,
      },
      errorPolicy: 'all',
    });
  }

  getTitleShortName(rncpId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query{
        GetOneTitle(_id:"${rncpId}"){
          short_name
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneTitle']));
  }

  getClassName(classId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query{
        GetOneClass(_id:"${classId}"){
          name
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneClass']));
  }

  GetBlockOfCompetenceConditionDropdownList(typeEva: string, subTypeEva: string, search: string) {
    return this.apollo
      .query({
        query: gql`
      query{
        GetBlockOfCompetenceConditionDropdownList(type_evaluation:${typeEva}, sub_type_evaluation:${subTypeEva}, search:"${search}"){
          _id
          block_of_competence_condition
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetBlockOfCompetenceConditionDropdownList']));
  }

  getClassCondition(classId: string, blockType?: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query{
        GetOneClass(_id:"${classId}"){
          name
          type_evaluation
          sub_type_evaluation
          evaluation_step
          evaluation_max_point
          parent_rncp_title {
            short_name
            long_name
          }
          competency {
            allow_competency_auto_evaluation
            allow_competency_pro_evaluation
          }
          soft_skill {
            allow_soft_skill
            allow_soft_skill_auto_evaluation
            allow_soft_skill_pro_evaluation
          }
          test_auto_pro_created(class_id:"${classId}", ${blockType ? `block_type: ${blockType}` : ''})
          test_auto_pro_published(class_id:"${classId}", ${blockType ? `block_type: ${blockType}` : ''})
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneClass']));
  }

  getAllBlockOfCompetenceConditions(rncpId: string, classId: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
      query{
        GetAllBlockOfCompetenceConditions(rncp_title_id:"${rncpId}", class_id:"${classId}"){
          _id
          block_rncp_reference
          rncp_title {
            _id
          }
          class_id {
            _id
          }
          block_of_competence_condition
          description
          max_point
          min_score
          block_of_competence_condition_credit
          transversal_block
          is_retake_by_block
          selected_block_retake {
            _id
            block_of_competence_condition
          }
          is_specialization
          specialization {
            _id
          }
          count_for_title_final_score
          page_break
          block_of_tempelate_competence {
            _id
            ref_id
          }
          block_of_tempelate_soft_skill {
            _id
            ref_id
          }
          block_type
          is_auto_pro_eval
          ref_id
          order
          subjects {
            _id
            rncp_title {
              _id
            }
            class_id {
              _id
            }
            is_subject_transversal_block
            subject_transversal_block_id {
              _id
              subject_name
            }
            subject_name
            max_point
            minimum_score_for_certification
            coefficient
            count_for_title_final_score
            credit
            order
            evaluations {
              _id
              evaluation
              type
              weight
              coefficient
              minimum_score
              result_visibility
              parallel_intake
              auto_mark
              retake_during_the_year
              student_eligible_to_join
              retake_when_absent_justified
              retake_when_absent_not_justified
              use_different_notation_grid
              retake_evaluation {
                _id
                evaluation
                type
              }
              score_not_calculated_for_retake_block
              test_is_not_retake_able_in_retake_block
              selected_evaluation_retake_block {
                _id
                evaluation
              }
              order
              published_test_id {
                is_published
              }
            }
          }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllBlockOfCompetenceConditions']));
  }

  getAllBlockConditionsForValidation(rncpId: string, classId: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
      query{
        GetAllBlockOfCompetenceConditions(rncp_title_id:"${rncpId}", class_id:"${classId}", count_for_title_final_score: true){
          _id
          block_rncp_reference
          rncp_title {
            _id
          }
          class_id {
            _id
          }
          block_of_competence_condition
          description
          max_point
          min_score
          block_of_competence_condition_credit
          transversal_block
          is_retake_by_block
          selected_block_retake {
            _id
            block_of_competence_condition
          }
          is_specialization
          specialization {
            _id
          }
          count_for_title_final_score
          page_break
          block_of_tempelate_competence {
            _id
            ref_id
          }
          block_of_tempelate_soft_skill {
            _id
            ref_id
          }
          block_type
          is_auto_pro_eval
          ref_id
          order
          subjects {
            _id
            rncp_title {
              _id
            }
            class_id {
              _id
            }
            is_subject_transversal_block
            subject_transversal_block_id {
              _id
              subject_name
            }
            subject_name
            max_point
            minimum_score_for_certification
            coefficient
            count_for_title_final_score
            credit
            order
            evaluations {
              _id
              evaluation
              type
              weight
              coefficient
              minimum_score
              result_visibility
              parallel_intake
              auto_mark
              retake_during_the_year
              student_eligible_to_join
              retake_when_absent_justified
              retake_when_absent_not_justified
              use_different_notation_grid
              retake_evaluation {
                _id
                evaluation
                type
              }
              score_not_calculated_for_retake_block
              test_is_not_retake_able_in_retake_block
              selected_evaluation_retake_block {
                _id
                evaluation
              }
              order
            }
          }
          pass_fail_conditions {
            _id
            condition_name
            condition_type
            condition_parameters {
              correlation
              validation_type
              validation_parameter {
                parameter_type
                percentage_value
                block_id {
                  _id
                  block_of_competence_condition
                }
                subject_id {
                  _id
                  subject_name
                }
                evaluation_id {
                  _id
                  evaluation
                }
                sign
              }
              pass_mark
            }
          }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllBlockOfCompetenceConditions']));
  }

  getAllFinalTranscriptResult(rncpId: string, classId: string, studentId: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query {
            GetAllFinalTranscriptResult(rncp_title_id: "${rncpId}", class_id: "${classId}", student_id: "${studentId}") {
              student_id {
                _id
                first_name
                last_name
                civility
                email
                date_of_birth
                place_of_birth
              }
              rncp_id {
                _id
                short_name
                long_name
                rncp_level
                journal_text
                certifier {
                  _id
                  short_name
                  long_name
                }
                preparation_centers {
                  _id
                  short_name
                  long_name
                }
              }
              class_id {
                _id
                name
              }
              school_id {
                _id
                short_name
                long_name
              }
              total_mark
              total_point
              max_point
              pass_fail_status
              parameter_obtained_name
              parameter_obtained_id {
                condition_name
              }
              block_of_competence_conditions {
                block_id {
                  _id
                  block_of_competence_condition
                  max_point
                  min_score
                  block_of_competence_condition_credit
                }
                pass_fail_status
                total_mark
                total_point
                total_coefficient
                max_point
                subjects {
                  subject_id {
                    _id
                    subject_name
                  }
                  total_mark
                  total_point
                  coefficient
                  total_coefficient
                  total_credit
                  total_weight
                  max_point
                  pass_fail_status
                  evaluations {
                    evaluation_id {
                      _id
                      evaluation
                      weight
                      coefficient
                      minimum_score
                    }
                    total_mark
                    total_point
                    mark
                    weight
                    coefficient
                    pass_fail_status
                  }
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllFinalTranscriptResult']));
  }

  createUpdateBlockOfCompetenceCondition(rncpId, classId, blocks): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateUpdateBlockOfCompetenceCondition($rncpId: ID!, $classId: ID!, $blocks: [BlockOfCompetenceConditionInput]) {
            CreateUpdateBlockOfCompetenceCondition(
              rncp_title_id: $rncpId
              class_id: $classId
              block_of_competence_condition_input: $blocks
            ) {
              _id
              rncp_title {
                _id
              }
              class_id {
                _id
              }
              block_of_competence_condition
              description
              max_point
              min_score
              block_of_competence_condition_credit
              transversal_block
              is_retake_by_block
              selected_block_retake {
                _id
              }
              is_specialization
              count_for_title_final_score
            }
          }
        `,
        variables: {
          rncpId,
          classId,
          blocks,
        },
        errorPolicy: 'all',
      })
      .pipe(map((resp) => resp));
  }

  updateMaxPoint(classId, any): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation updateMaxPoint($classId: ID!, $any: any) {
            UpdateClass(_id: $classId, class_input: $any) {
              _id
              name
              evaluation_max_point
            }
          }
        `,
        variables: {
          classId,
          any,
        },
      })
      .pipe(map((resp) => resp.data['UpdateClass']));
  }

  deleteBlockCompetence(blockId): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
      mutation {
        DeleteBlockOfCompetenceCondition(_id: "${blockId}"){
          _id
        }
      }
      `,
      errorPolicy: 'all',
    });
  }

  deleteEvaluationCompetence(evalId): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
      mutation {
        DeleteEvaluation(_id: "${evalId}"){
          _id
        }
      }
      `,
      errorPolicy: 'all',
    });
  }

  deleteSubjectCompetence(subId): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
      mutation {
        DeleteSubject(_id: "${subId}"){
          _id
        }
      }
      `,
      errorPolicy: 'all',
    });
  }

  // Start of Second step eval by expertise
  getAllBlockOfCompetenceTemplateDropdown(titleID: string, classID: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query GetAllBlockOfCompetenceTemplateDropdown{
        GetAllBlockOfCompetenceTemplates(rncp_title_id:"${titleID}", class_id:"${classID}"){
          _id
          ref_id
          name
          phrase_names {
            phrase_type
            name
          }
          competence_templates_id {
            _id
            ref_id
            name
            short_name
            phrase_names {
              name
            }
          }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllBlockOfCompetenceTemplates']));
  }
  // Start of Third step eval by expertise
  getAllBlockOfSoftSkillTemplateDropdown(titleID: string, classID: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query GetAllBlockOfSoftSkillTemplateDropdown{
        GetAllSoftSkillBlockTemplates(rncp_title_id:"${titleID}", class_id:"${classID}"){
          _id
          ref_id
          name
          phrase_names {
            name
            phrase_type
          }
          competence_softskill_templates_id {
            _id
            ref_id
            name
            short_name
            phrase_names {
              name
            }
          }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllSoftSkillBlockTemplates']));
  }

  // Start of Second step eval by expertise
  getAllBlockOfCompetenceTemplate(titleID: string, classID: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query{
        GetAllBlockOfCompetenceTemplates(rncp_title_id:"${titleID}", class_id:"${classID}"){
          _id
          ref_id
          name
          description
          note
          phrase_names {
            _id
            phrase_type
            name
            phrase_parameters {
              correlation
              pass_mark
              validation_type
              validation_parameter {
                parameter_type
                percentage_value
                ratio_value
                sign
                competence_id {
                  _id
                }
                criteria_of_evaluation_template_id  {
                  _id
                }
              }
            }
          }
          competence_templates_id {
            _id
            ref_id
            name
            short_name
            description
            phrase_names {
              _id
              name
              phrase_parameters {
                correlation
                pass_mark
                validation_type
                validation_parameter {
                  parameter_type
                  percentage_value
                  ratio_value
                  sign
                  criteria_of_evaluation_template_id  {
                    _id
                  }
                }
              }
            }
            criteria_of_evaluation_templates_id {
              _id
              ref_id
              name
              description
            }
          }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllBlockOfCompetenceTemplates']));
  }

  // Start of Second step eval by expertise
  getAllCriteriaOfEvaluationTemplateQuestions(criteria_of_evaluation_template_id: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query GetAllCriteriaOfEvaluationTemplateQuestions{
        GetAllCriteriaOfEvaluationTemplateQuestions(
          criteria_of_evaluation_template_id: "${criteria_of_evaluation_template_id}"
        ) {
        _id
        question
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCriteriaOfEvaluationTemplateQuestions']));
  }

  saveOneBlockOfCompetenceTemplate(rncpId: string, classId: string, payload: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateUpdateBlockOfCompetenceTemplate($rncpId: ID!, $classId: ID!, $payload: [BlockOfCompetenceTemplateInput]) {
            CreateUpdateBlockOfCompetenceTemplate(
              rncp_title_id: $rncpId
              class_id: $classId
              block_of_competence_template_input: $payload
            ) {
              _id
            }
          }
        `,
        variables: {
          rncpId,
          classId,
          payload,
        },
      })
      .pipe(map((resp) => resp.data['CreateUpdateBlockOfCompetenceTemplate']));
  }

  deleteBlockOfCompetenceTemplate(blockId: string): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
      mutation DeleteBlockOfCompetenceTemplate{
        DeleteBlockOfCompetenceTemplate(_id: "${blockId}")
      }
      `,
      errorPolicy: 'all',
    });
  }

  deleteCompetencyTemplate(compId: string): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
      mutation DeleteCompetenceTemplate{
        DeleteCompetenceTemplate(_id: "${compId}")
      }
      `,
      errorPolicy: 'all',
    });
  }

  deleteCriteriaEvaluationTemplate(evaId: string): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
      mutation DeleteCriteriaOfEvaluationTemplate{
        DeleteCriteriaOfEvaluationTemplate(_id: "${evaId}")
      }
      `,
      errorPolicy: 'all',
    });
  }

  createOneBlockOfCompetenceTemplate(rncpId: string, classId: string, payload: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateBlockOfCompetenceTemplate($rncpId: ID!, $classId: ID!, $payload: BlockOfCompetenceTemplateInput) {
            CreateBlockOfCompetenceTemplate(rncp_title_id: $rncpId, class_id: $classId, block_of_competence_template_input: $payload) {
              _id
              ref_id
              name
              description
              note
            }
          }
        `,
        variables: {
          rncpId,
          classId,
          payload,
        },
      })
      .pipe(map((resp) => resp.data['CreateBlockOfCompetenceTemplate']));
  }

  // Start of Sixth step Grand Oral Validation
  getOneGrandOralValidation(titleID: string, classID: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query GetOneGrandOralValidation{
        GetOneGrandOralValidation(rncp_id:"${titleID}", class_id:"${classID}"){
          _id
          rncp_id {
            _id
          }
          class_id {
            _id
          }
          phrase_names {
            _id
            name
            phrase_type
            phrase_parameters {
              correlation
              validation_type
              min_level_mastery
              validation_parameter {
                parameter_type
                percentage_value
                ratio_value
                sign
                block_id {
                  _id
                }
                competence_id {
                  _id
                }
              }
            }
          }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneGrandOralValidation']));
  }

  createGrandOralValidation(payload: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateGrandOralValidation($payload: GrandOralValidationInput) {
            CreateGrandOralValidation(grand_oral_validation_input: $payload) {
              _id
              rncp_id {
                _id
              }
              class_id {
                _id
              }
              phrase_names {
                _id
                name
                phrase_type
                phrase_parameters {
                  correlation
                  validation_type
                  min_level_mastery
                  validation_parameter {
                    parameter_type
                    percentage_value
                    ratio_value
                    sign
                    block_id {
                      _id
                    }
                    competence_id {
                      _id
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          payload,
        },
      })
      .pipe(map((resp) => resp.data['CreateGrandOralValidation']));
  }

  updateGrandOralValidation(payload: any, _id?: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateGrandOralValidation($payload: GrandOralValidationInput, $_id: ID) {
            UpdateGrandOralValidation(grand_oral_validation_input: $payload, _id: $_id) {
              _id
              rncp_id {
                _id
              }
              class_id {
                _id
              }
              phrase_names {
                _id
                name
                phrase_type
                phrase_parameters {
                  correlation
                  validation_type
                  min_level_mastery
                  validation_parameter {
                    parameter_type
                    percentage_value
                    ratio_value
                    sign
                    block_id {
                      _id
                    }
                    competence_id {
                      _id
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          payload,
          _id,
        },
      })
      .pipe(map((resp) => resp.data['UpdateGrandOralValidation']));
  }

  deleteGrandOralValidation(_id: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteGrandOralValidation($_id: ID) {
            DeleteGrandOralValidation(_id: $_id) {
              rncp_id
              class_id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteGrandOralValidation']));
  }

  createOneCompetenceTemplate(blockId: string, payload: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateCompetenceTemplate($blockId: ID!, $payload: CompetenceTemplateInput) {
            CreateCompetenceTemplate(block_of_competence_template_id: $blockId, competence_template_input: $payload) {
              _id
              ref_id
              name
              short_name
              description
            }
          }
        `,
        variables: {
          blockId,
          payload,
        },
      })
      .pipe(map((resp) => resp.data['CreateCompetenceTemplate']));
  }

  createOneCriteriaOfEvaluationTemplate(competenceId: string, payload: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateCriteriaOfEvaluationTemplate($competenceId: ID!, $payload: CriteriaOfEvaluationTemplateInput) {
            CreateCriteriaOfEvaluationTemplate(competence_template_id: $competenceId, criteria_of_evaluation_template_input: $payload) {
              _id
              ref_id
              name
              description
            }
          }
        `,
        variables: {
          competenceId,
          payload,
        },
      })
      .pipe(map((resp) => resp.data['CreateCriteriaOfEvaluationTemplate']));
  }

  saveAllCompetencyTemplate(rncpId, classId, payload) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateUpdateBlockOfCompetenceTemplate($rncpId: ID!, $classId: ID!, $payload: [BlockOfCompetenceTemplateInput]) {
            CreateUpdateBlockOfCompetenceTemplate(
              rncp_title_id: $rncpId
              class_id: $classId
              block_of_competence_template_input: $payload
            ) {
              _id
              name
              description
              note
            }
          }
        `,
        variables: {
          rncpId,
          classId,
          payload,
        },
        errorPolicy: 'all',
      })
      .pipe(map((resp) => resp));
  }
  // End of Second step eval by experise

  // Start of Third step eval by expertise
  getAllBlockOfSoftSkillTemplate(titleID: string, classID: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query GetAllSoftSkillBlockTemplates{
        GetAllSoftSkillBlockTemplates(rncp_title_id:"${titleID}", class_id:"${classID}"){
          _id
          ref_id
          name
          description
          note
          phrase_names {
            _id
            name
            phrase_type
            phrase_parameters {
              correlation
              pass_mark
              validation_type
              validation_parameter {
                parameter_type
                percentage_value
                ratio_value
                sign
                competence_softskill_template_id {
                  _id
                }
                criteria_of_evaluation_softskill_template_id {
                  _id
                }
              }
            }
          }
          competence_softskill_templates_id {
            _id
            ref_id
            name
            short_name
            description
            phrase_names {
              _id
              name
              phrase_parameters {
                correlation
                pass_mark
                validation_type
                validation_parameter {
                  parameter_type
                  percentage_value
                  ratio_value
                  sign
                  criteria_of_evaluation_softskill_template_id {
                    _id
                  }
                }
              }
            }
            criteria_of_evaluation_softskill_templates_id {
              _id
              ref_id
              name
              description
            }
          }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllSoftSkillBlockTemplates']));
  }

  createOneBlockOfSoftSkillTemplate(rncpId: string, classId: string, payload: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateSoftSkillBlockTemplate($rncpId: ID!, $classId: ID!, $payload: SoftSkillBlockTemplateInput) {
            CreateSoftSkillBlockTemplate(rncp_title_id: $rncpId, class_id: $classId, soft_skill_block_template_input: $payload) {
              _id
              ref_id
              name
              description
              note
            }
          }
        `,
        variables: {
          rncpId,
          classId,
          payload,
        },
      })
      .pipe(map((resp) => resp.data['CreateSoftSkillBlockTemplate']));
  }

  createOneSoftSkillCompetenceTemplate(blockId: string, payload: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateSoftSkillCompetenceTemplate($blockId: ID!, $payload: SoftSkillCompetenceTemplateInput) {
            CreateSoftSkillCompetenceTemplate(soft_skill_block_template_id: $blockId, soft_skill_competence_template_input: $payload) {
              _id
              ref_id
              name
              short_name
              description
            }
          }
        `,
        variables: {
          blockId,
          payload,
        },
      })
      .pipe(map((resp) => resp.data['CreateSoftSkillCompetenceTemplate']));
  }

  createOneSoftSkillCriteriaOfEvaluationTemplate(competenceId: string, payload: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateSoftSkillEvaluationTemplate($competenceId: ID!, $payload: SoftSkillEvaluationTemplateInput) {
            CreateSoftSkillEvaluationTemplate(
              soft_skill_competence_template_id: $competenceId
              soft_skill_evaluation_template_input: $payload
            ) {
              _id
              ref_id
              name
              description
            }
          }
        `,
        variables: {
          competenceId,
          payload,
        },
      })
      .pipe(map((resp) => resp.data['CreateSoftSkillEvaluationTemplate']));
  }

  saveAllSoftSkillTemplate(rncpId, classId, payload) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateUpdateSoftSkillBlockOfCompetenceTemplate($rncpId: ID!, $classId: ID!, $payload: [SoftSkillBlockTemplateInput]) {
            CreateUpdateSoftSkillBlockOfCompetenceTemplate(
              rncp_title_id: $rncpId
              class_id: $classId
              soft_skill_block_template_input: $payload
            ) {
              _id
              name
              description
              note
            }
          }
        `,
        variables: {
          rncpId,
          classId,
          payload,
        },
      })
      .pipe(map((resp) => resp));
  }

  GetAllTitleDropdownListBySchool(school_id) {
    return this.apollo
      .query({
        query: gql`
        query GetAllTitleDropdownListBySchool{
          GetTitleDropdownList(school_id: "${school_id}") {
            _id
            short_name
            specializations {
              _id
              name
            }
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetTitleDropdownList']));
  }

  GetAllDocs(rncp_title_id, student_id, userTypeId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetAllDocs{
          GetAllDocs(
            rncp_title_id: "${rncp_title_id}"
            student_id: "${student_id}"
            type_of_documents: [document_expected, pdf_result, student_upload_grand_oral_presentation, student_upload_grand_oral_cv, grand_oral_pdf, grand_oral_result_pdf]
            uploaded_for_student_group: true
          ) {
            _id
            status
            document_name
            document_generation_type
            s3_file_name
            parent_folder {
              parent_rncp_title {
                _id
              }
              school {
                _id
              }
              folder_name
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
                  _id
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
              type_b_documents {
                _id
                document_name
                type_of_document
                s3_file_name
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
                  _id
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
              }
              grand_oral_pdfs {
                _id
                document_name
                s3_file_name
                type_of_document
                jury_organization_id {
                  _id
                }
                uploaded_for_student {
                  _id
                  first_name
                  last_name
                }
              }
              grand_oral_result_pdfs(logged_in_user_type_id: "${userTypeId}") {
                _id
                document_name
                s3_file_name
                type_of_document
                jury_organization_id {
                  _id
                }
                uploaded_for_student {
                  _id
                  first_name
                  last_name
                }
              }
              cv_docs{
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
                  _id
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
              presentation_docs {
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
                  _id
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
              tests {
                _id
                name
                group_test
                correction_type
                is_published
                documents {
                  _id
                  document_generation_type
                  document_name
                  type_of_document
                  s3_file_name
                  published_for_student
                  parent_class_id {
                    _id
                    name
                  }
                }
              }
              parent_folder_id {
                _id
                is_default_folder
                folder_name
              }
            }
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllDocs']));
  }

  deleteBlockOfSoftSkillTemplate(blockId: string): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
      mutation DeleteSoftSkillBlockTemplate{
        DeleteSoftSkillBlockTemplate(_id: "${blockId}")
      }
      `,
      errorPolicy: 'all',
    });
  }

  deleteSoftSkillCompetencyTemplate(compId: string): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
      mutation DeleteSoftSkillCompetenceTemplate{
        DeleteSoftSkillCompetenceTemplate(_id: "${compId}")
      }
      `,
      errorPolicy: 'all',
    });
  }

  deleteSoftSkillCriteriaEvaluationTemplate(evaId: string): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
      mutation DeleteSoftSkillEvaluationTemplate{
        DeleteSoftSkillEvaluationTemplate(_id: "${evaId}")
      }
      `,
      errorPolicy: 'all',
    });
  }
  // End of Third step eval by experise

  GetAllTitleDropdownList(search: string) {
    return this.apollo
      .query({
        query: gql`
        query GetAllTitleDropdownList{
          GetTitleDropdownList(search: "${search}") {
            _id
            short_name
            specializations {
              _id
              name
            }
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetTitleDropdownList']));
  }

  GetAllTitlePublish(search: string) {
    return this.apollo
      .query({
        query: gql`
        query GetAllTitlePublish{
          GetTitleDropdownList(search: "${search}", isPublished: publish) {
            _id
            short_name
            specializations {
              _id
              name
            }
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetTitleDropdownList']));
  }

  getAllClassDropdownList(rncpId: string) {
    return this.apollo
      .query({
        query: gql`
      query {
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

  getAllClassDropdownListByEvaluationType(rncpId: string, evaluationType: string) {
    return this.apollo
      .query({
        query: gql`
      query {
        GetClassDropdownList(rncp_id : "${rncpId}" type_evaluation: ${evaluationType}){
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

  getAlltestDropdownList(rncpId: string, classId: string) {
    return this.apollo
      .query({
        query: gql`
      query GetAlltestDropdownList{
        GetAllTests(rncp_title_id : "${rncpId}", class_id : "${classId}"){
          _id
          name
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllTests'];
        }),
      );
  }

  getAllTestGroupTestDropdownList(rncpId: string, classId: string) {
    return this.apollo
      .query({
        query: gql`
      query GetAllTestGroupTestDropdownList{
        GetAllTests(rncp_title_id : "${rncpId}", class_id : "${classId}", is_group_test: true){
          _id
          name
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllTests'];
        }),
      );
  }

  getOneTitleByIdForCourse(titleId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetOneTitleByIdForCourse{
          GetOneTitle(_id: "${titleId}") {
            _id
            short_name
            classes {
              _id
              name
            }
            specializations {
              _id
              name
            }
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneTitle']));
  }

  GetAllDocuments(rncpId: string, customRequest: string) {
    return this.apollo
      .query({
        query: gql`
        query GetAllDocuments{
          GetAllDocs(published_for_student: true, rncp_title_id: "${rncpId}") {
            _id
            document_name
            ${customRequest}
            parent_class_id{
              _id
              name
            }
            published_for_student
            s3_file_name
            type_of_document
            document_generation_type
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllDocs']));
  }

  CountParentFolderDeepForDocument(rncpId: string): Observable<number> {
    return this.apollo
      .query({
        query: gql`
        query CountParentFolderDeepForDocument{
          CountParentFolderDeepForDocument(rncp_title_id: "${rncpId}")
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['CountParentFolderDeepForDocument']));
  }

  getClassNameFromId(classId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetClassNameFromId{
          GetOneClass(_id: "${classId}") {
            name
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneClass']));
  }

  getTitlesOfCurrentUser(schoolId: string): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query GetTitlesOfCurrentUser{
          GetAllTitles(filter_by_user_login: all, school_id: "${schoolId}"){
            _id
            short_name
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTitles']));
  }

  GetListTutorialAdded(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllInAppTutorial {
              _id
              module
              is_published
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllInAppTutorial']));
  }

  importStep2Template(payload, file: File): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ImportAcademicSkillTemplate($import_block_template_input: ImportBlockTemplateInput, $file: Upload!) {
            ImportAcademicSkillTemplate(import_block_template_input: $import_block_template_input, file: $file) {
              _id
              ref_id
            }
          }
        `,
        variables: {
          import_block_template_input: payload,
          file: file,
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['ImportAcademicSkillTemplate']));
  }

  importStep3Template(payload, file: File): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ImportSoftSkillTemplate($import_block_template_input: ImportBlockTemplateInput, $file: Upload!) {
            ImportSoftSkillTemplate(import_block_template_input: $import_block_template_input, file: $file) {
              _id
              ref_id
            }
          }
        `,
        variables: {
          import_block_template_input: payload,
          file: file,
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['ImportSoftSkillTemplate']));
  }

  exportGroupCSV(rncp_id, class_id, test_id, delimiter, lang): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
      mutation ExportGroupCSV{
        ExportGroups(rncp_id: "${rncp_id}", class_id: "${class_id}", test_id: "${test_id}", delimiter: "${delimiter}", lang: "${lang}")
      }
      `,
        errorPolicy: 'all',
      })
      .pipe(map((resp) => resp.data['ExportGroups']));
  }

  TaskN7ForStatusUpdate(payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation TaskN7ForStatusUpdate($rncp_id: ID!, $class_id: ID!, $test_id: [ID]) {
            TaskN7ForStatusUpdate(rncp_id: $rncp_id, class_id: $class_id, test_id: $test_id, lang: "${this.translate.currentLang}")
          }
        `,
        variables: {
          rncp_id: payload.rncp_id,
          class_id: payload.class_id,
          test_id: payload.test_id,
        },
      })
      .pipe(map((resp) => resp.data['TaskN7ForStatusUpdate']));
  }

  GetResponseForStatusUpdate(rncpId: string, classId: string): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query GetResponseForStatusUpdate{
          GetResponseForStatusUpdate(rncp_id: "${rncpId}", class_id: "${classId}")
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetResponseForStatusUpdate']));
  }

  GetResponseForExportStatusUpdate(rncpId: string, classId: string, testId: string): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetResponseForExportStatusUpdate($lang: String!) {
            GetResponseForExportStatusUpdate(lang: $lang, rncp_id: "${rncpId}", class_id: "${classId}", test_id: "${testId}") {
              _id
              school {
                _id
                short_name
                long_name
              }
              rncp_title {
                _id
                short_name
                long_name
              }
              current_class {
                _id
                name
              }
              first_name
              last_name
              civility
              email
              test_name
              document_name
              student_document_name
              document_link
              upload_date
              upload_time
              student_score
              group_name
            }
          }
        `,
        variables: {
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetResponseForExportStatusUpdate']));
  }

  SendEmailStatusUpdate(test_id, delimiter): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendEmailStatusUpdate($test_id: [ID], $delimiter: EnumDelimiter) {
            SendEmailStatusUpdate(test_id:$test_id , delimiter: $delimiter, lang: "${this.translate.currentLang}")
          }
        `,
        variables: {
          test_id,
          delimiter,
        },
      })
      .pipe(map((resp) => resp.data['SendEmailStatusUpdate']));
  }

  saveNewQuestion(payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
        mutation {
          CreateCriteriaOfEvaluationTemplateQuestion(criteria_of_evaluation_template_question_input: {
            s3_file_name: "${payload.s3_file_name}",
            block_of_template_competence_id: "${payload.block_of_template_competence_id}"
          }) {
            s3_file_name
            block_of_template_competence_id {
              _id
              name
            }
            status
          }
        }
        `,
      })
      .pipe(map((resp) => resp));
  }

  getLimitationForDocument(doc_id): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetLimitationForDocument($doc_id: ID) {
            GetLimitationForDocument(doc_id: $doc_id) {
              student_allow
              operator_allow
              acad_allow
            }
          }
        `,
        variables: {
          doc_id,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetLimitationForDocument']));
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
}
