import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Cacheable } from 'ngx-cacheable';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private selectedCompanyId = new BehaviorSubject<string>('');
  private pathCompanyLogo = new BehaviorSubject<string>('');
  private initCompany = new BehaviorSubject<boolean>(false);
  private companyName = new BehaviorSubject<string>('');
  private companyFilter = new BehaviorSubject<string>(null);
  private refreshCompany = new BehaviorSubject<boolean>(false);
  private _childrenFormValidationStatus: boolean = true;

  selectedCompanyId$ = this.selectedCompanyId.asObservable();
  pathCompanyLogo$ = this.pathCompanyLogo.asObservable();
  initCompany$ = this.initCompany.asObservable();
  companyName$ = this.companyName.asObservable();
  companyFilter$ = this.companyFilter.asObservable();
  refreshCompany$ = this.refreshCompany.asObservable();

  setCompanyId(companyId: string) {
    this.selectedCompanyId.next(companyId);
  }
  setPathCompany(path: string) {
    this.pathCompanyLogo.next(path);
  }
  setInitCompany(path: boolean) {
    this.initCompany.next(path);
  }
  setCompanyName(path: string) {
    this.companyName.next(path);
  }
  filterCompany(value: string) {
    this.companyFilter.next(value);
  }
  setRefreshCompany(value: boolean) {
    this.initCompany.next(value);
  }
  setRefreshEditCompany(value: boolean) {
    this.refreshCompany.next(value);
  }

  public get childrenFormValidationStatus() {
    return this._childrenFormValidationStatus;
  }

  public set childrenFormValidationStatus(state: boolean) {
    this._childrenFormValidationStatus = state;
  }

  constructor(private apollo: Apollo, private http: HttpClient) {}

  // Dummy data
  getCompanies() {
    return this.http.get<any[]>('assets/data/companies.json');
  }
  // End of Dummy data

  getEntitiesName(): string[] {
    return ['admtc', 'academic', 'company', 'group_of_schools'];
  }
  getEntitiesCompany(): string[] {
    return ['company'];
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

  getAllCompanies(search?, pagination?, filter?, sorting?): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllCompanies(
            $search: String
            $pagination: PaginationInput
            $school_id: ID
            $user_login: EnumCompanyUserLogin
            $filter: CompanyFilterInput
            $sorting: CompanySortInput
          ) {
            GetAllCompanies(
              search: $search
              pagination: $pagination
              school_id: $school_id
              user_login: $user_login
              filter: $filter
              sorting: $sorting
            ) {
              _id
              company_logo
              company_name
              brand
              activity
              type_of_company
              no_RC
              capital
              no_of_employee_in_france
              count_document
              company_addresses {
                address
                postal_code
                city
                country
              }
              company_entity_id{
                company_name
              }
            }
          }
        `,
        variables: {
          search,
          pagination,
          filter,
          sorting: sorting ? sorting : null,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCompanies']));
  }

  getAllCompaniesOfAnEntity(search?, pagination?): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllCompanies($search: String, $pagination: PaginationInput, $school_id: ID, $user_login: EnumCompanyUserLogin) {
            GetAllCompanies(search: $search, pagination: $pagination, school_id: $school_id, user_login: $user_login) {
              _id
              company_name
              no_RC
              count_document
              company_addresses {
                address
                postal_code
                city
                country
              }
            }
          }
        `,
        variables: {
          search,
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCompanies']));
  }

  getAllCompanyEntity(search?, pagination?): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllCompanyEntities($search: String, $pagination: PaginationInput, $school_id: ID, $user_login: EnumCompanyUserLogin) {
            GetAllCompanyEntities(search: $search, pagination: $pagination, school_id: $school_id, user_login: $user_login) {
              _id
              company_name
              no_RC
              count_document
            }
          }
        `,
        variables: {
          search,
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCompanyEntities']));
  }

  getAllCompaniesDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCompaniesDropdown{
            GetAllCompanies {
              _id
              company_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCompanies']));
  }

  RefreshCompany(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation RefreshCompany($_id: ID) {
            RefreshCompany(_id: $_id) {
              _id
              company_name
              no_RC
              company_status
              company_name_2
              company_name_3
              company_addresses {
                address
                postal_code
                city
                country
                region
                department
                is_main_address
              }
            }
          }
        `,
        variables: {
          _id: _id,
        },
      })
      .pipe(map((resp) => resp.data['RefreshCompany']));
  }

  getOneCompany(_id): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetOneCompany($_id: ID) {
            GetOneCompany(_id: $_id) {
              _id
              company_name
              company_logo
              capital_type
              brand
              activity
              type_of_company
              no_RC
              capital
              no_of_employee_in_france
              no_of_employee_in_france_by_year
              status
              company_status
              created_at
              updated_at
              nic
              company_name_2
              company_name_3
              payroll
              company_addresses {
                address
                postal_code
                city
                country
                region
                department
                is_main_address
              }
              company_entity_id{
                company_name
              }
            }
          }
        `,
        variables: {
          _id: _id,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneCompany']));
  }

  getOneCompanyForPayload(_id): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetOneCompany($_id: ID) {
            GetOneCompany(_id: $_id) {
              company_name
              company_logo
              capital_type
              brand
              activity
              type_of_company
              no_RC
              capital
              no_of_employee_in_france
              company_addresses {
                address
                postal_code
                city
                country
                region
                department
                is_main_address
              }
            }
          }
        `,
        variables: {
          _id: _id,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneCompany']));
  }

  getCompanyDropdownList(search?): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetCompanyDropdownList{
            GetAllCompanies(
              search: "${search}") {
              _id
              company_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCompanies']));
  }

  getCompanyWithSchool(search?, school?): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetCompanyWithSchool{
            GetAllCompanies(
              school_id:"${school}"
              search: "${search}") {
              _id
              company_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCompanies']));
  }

  getAllCompanyDropdownList(): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query {
            GetAllCompanies {
              _id
              company_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCompanies']));
  }

  getAllCompanyByAcadir(school_id, country?, search?, pagination?, zipCode?): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllCompanies($school_id: ID, $pagination: PaginationInput) {
            GetAllCompanies(
              school_id: $school_id,
              pagination: $pagination,
              search: "${search}",
              country: "${country}",
              zip_code: "${zipCode}"
              ) {
              _id
              company_logo
              company_name
              brand
              activity
              type_of_company
              no_RC
              capital
              no_of_employee_in_france
              count_document
              company_addresses {
                address
                postal_code
                city
                country
              }
            }
          }
        `,
        variables: {
          school_id: school_id,
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCompanies']));
  }

  getAllCompanyForCheck(school_id): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllCompanies($school_id: ID) {
            GetAllCompanies(school_id: $school_id) {
              _id
            }
          }
        `,
        variables: {
          school_id: school_id,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCompanies']));
  }

  getAllCompanyBySearch(country?, search?): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query {
            GetAllCompanies(
              search: "${search}",
              country: "${country}"
            ) {
              _id
              company_logo
              company_name
              brand
              activity
              type_of_company
              no_RC
              capital
              no_of_employee_in_france
              company_addresses {
                address
                postal_code
                city
                country
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCompanies']));
  }

  getAllCompanyByAdmtc(country?, search?, pagination?, zipCode?): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllCompanies($pagination: PaginationInput){
            GetAllCompanies(
              search: "${search}",
              country: "${country}",
              pagination: $pagination,
              zip_code: "${zipCode}"
            ) {
              _id
              company_logo
              company_name
              brand
              activity
              type_of_company
              no_RC
              capital
              no_of_employee_in_france
              count_document
              company_addresses {
                address
                postal_code
                city
                country
              }
            }
          }
        `,
        variables: {
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCompanies']));
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
          department
        }
      }
      `,
      })
      .pipe(map((resp) => resp.data['GetAllZipCodes']));
  }

  getCompanyStaff(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllUsers(school: "5a96e37ccdb80b47be7088ec", entity: company) {
              civility
              full_name
              entities {
                companies {
                  _id
                  company_name
                }
                entity_name
                type {
                  name
                }
              }
              status
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getOneMentor(_id, email): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneUser{
            GetOneUser(
              _id: "${_id}"
              email: "${email}"
            ) {
              civility
              first_name
              last_name
              email
              position
              office_phone
              direct_line
              portable_phone
              full_name
              entities {
                companies {
                  _id
                  company_name
                }
                entity_name
                type {
                  _id
                  name
                }
              }
              status
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneUser']));
  }

  getSchoolsByUser(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
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

  validateCompany(company_name, zip_code, country): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ValidateCompany($company_name: String!, $zip_code: String!, $country: String!) {
            ValidateCompany(company_name: $company_name, zip_code: $zip_code, country: $country) {
              message
              companies {
                _id
                company_name
                brand
                activity
                type_of_company
                no_RC
                capital
                no_of_employee_in_france
                company_addresses {
                  address
                  postal_code
                  city
                  country
                }
              }
            }
          }
        `,
        variables: {
          company_name,
          zip_code,
          country,
        },
      })
      .pipe(map((resp) => resp.data['ValidateCompany']));
  }

  validateMentor(company_id, first_name, last_name, email): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ValidateMentor($company_id: ID!, $first_name: String!, $last_name: String!, $email: String!) {
            ValidateMentor(company_id: $company_id, first_name: $first_name, last_name: $last_name, email: $email) {
              message
              mentor {
                _id
                email
                civility
                first_name
                last_name
                full_name
                entities {
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
                user_status
                count_document
              }
            }
          }
        `,
        variables: {
          company_id,
          first_name,
          last_name,
          email,
        },
      })
      .pipe(map((resp) => resp.data['ValidateMentor']));
  }

  validateEmailMentor(company_id, email): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ValidateMentor($company_id: ID!, $email: String!) {
            ValidateMentor(company_id: $company_id, email: $email) {
              message
              mentor {
                _id
                email
                civility
                first_name
                last_name
                full_name
                direct_line
                office_phone
                portable_phone
                position
                entities {
                  school {
                    _id
                    short_name
                  }
                  assigned_rncp_title {
                    _id
                    short_name
                  }
                  companies {
                    _id
                    company_name
                  }
                  type {
                    _id
                    name
                  }
                  entity_name
                }
                user_status
                count_document
              }
            }
          }
        `,
        variables: {
          company_id,
          email,
        },
      })
      .pipe(map((resp) => resp.data['ValidateMentor']));
  }

  createCompany(company_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateCompany($company_input: CompanyTypeInput) {
            CreateCompany(company_input: $company_input) {
              _id
              company_name
            }
          }
        `,
        variables: {
          company_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateCompany']));
  }

  updateCompany(_id, company_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCompany($_id: ID!, $company_input: CompanyTypeInput) {
            UpdateCompany(_id: $_id, company_input: $company_input) {
              _id
              company_name
            }
          }
        `,
        variables: {
          _id,
          company_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateCompany']));
  }

  updateCompanyByAcadir(_id, company_input, update_by_acadir,school_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCompany($_id: ID!, $company_input: CompanyTypeInput, $update_by_acadir: Boolean, $school_id: ID) {
            UpdateCompany(_id: $_id, company_input: $company_input, update_by_acadir: $update_by_acadir, school_id: $school_id) {
              _id
              company_name
            }
          }
        `,
        variables: {
          _id,
          company_input,
          update_by_acadir,
          school_id
        },
      })
      .pipe(map((resp) => resp.data['UpdateCompany']));
  }

  deleteCompany(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteCompany($_id: ID!) {
            DeleteCompany(_id: $_id) {
              _id
              company_name
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteCompany']));
  }

  connectSchoolToCompany(company_id, school_ids): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ConnectSchoolToCompany($company_id: ID!, $school_ids: [ID]!) {
            ConnectSchoolToCompany(company_id: $company_id, school_ids: $school_ids) {
              _id
              company_name
            }
          }
        `,
        variables: {
          company_id,
          school_ids,
        },
      })
      .pipe(map((resp) => resp.data['ConnectSchoolToCompany']));
  }

  connectMentorToSchool(mentor_ids, company_id, school_ids): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ConnectMentorToSchool($mentor_ids: [ID]!, $company_id: ID!, $school_ids: [ID]!) {
            ConnectMentorToSchool(mentor_ids: $mentor_ids, company_id: $company_id, school_ids: $school_ids)
          }
        `,
        variables: {
          mentor_ids,
          company_id,
          school_ids,
        },
      })
      .pipe(map((resp) => resp.data['ConnectMentorToSchool']));
  }

  connectSchoolToMentor(mentor_id, company_id, school_ids): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ConnectMentorToCompanyAndSchool($mentor_id: ID!, $company_id: ID!, $school_ids: [ID]!) {
            ConnectMentorToCompanyAndSchool(mentor_id: $mentor_id, company_id: $company_id, school_ids: $school_ids) {
              _id
              first_name
            }
          }
        `,
        variables: {
          mentor_id,
          company_id,
          school_ids,
        },
      })
      .pipe(map((resp) => resp.data['ConnectMentorToCompanyAndSchool']));
  }

  connectSchoolToMentorADMTC(mentor_id, company_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ConnectMentorToCompanyAndSchool($mentor_id: ID!, $company_id: ID!) {
            ConnectMentorToCompanyAndSchool(mentor_id: $mentor_id, company_id: $company_id) {
              _id
              first_name
            }
          }
        `,
        variables: {
          mentor_id,
          company_id,
        },
      })
      .pipe(map((resp) => resp.data['ConnectMentorToCompanyAndSchool']));
  }

  sendRevisionCompany(company_id, user_login_id, description, lang): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation RequestReviseCompany($company_id: ID, $user_login_id: ID, $description: String!, $lang: String) {
            RequestReviseCompany(company_id: $company_id, user_login_id: $user_login_id, description: $description, lang: $lang)
          }
        `,
        variables: {
          company_id,
          user_login_id,
          description,
          lang,
        },
      })
      .pipe(map((resp) => resp.data['RequestReviseCompany']));
  }

  sendRevisionMentor(mentor_id, company_id, user_login_id, description, lang): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation RequestReviseMentor($mentor_id: ID, $company_id: ID, $user_login_id: ID, $description: String!, $lang: String) {
            RequestReviseMentor(
              mentor_id: $mentor_id
              company_id: $company_id
              user_login_id: $user_login_id
              description: $description
              lang: $lang
            )
          }
        `,
        variables: {
          mentor_id,
          company_id,
          user_login_id,
          description,
          lang,
        },
      })
      .pipe(map((resp) => resp.data['RequestReviseMentor']));
  }

  disconnectSchoolFromCompany(company_id, school_ids): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DisconnectSchoolFromCompany($company_id: ID!, $school_ids: [ID]!) {
            DisconnectSchoolFromCompany(company_id: $company_id, school_ids: $school_ids) {
              _id
              company_name
            }
          }
        `,
        variables: {
          company_id,
          school_ids,
        },
      })
      .pipe(map((resp) => resp.data['DisconnectSchoolFromCompany']));
  }
  removeMentorInThisSchool(company_id, mentor_ids): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation {
            DeleteMentorFromCompany(mentor_ids: "${mentor_ids}", company_id: "${company_id}") {
              _id
              first_name
            }
          }
        `,
      })
      .pipe(map((resp) => resp.data['DeleteMentorFromCompany']));
  }

  removeMentorInThisCompany(company_id, mentor_ids): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteMentorFromCompany{
            DeleteMentorFromCompany(mentor_ids: "${mentor_ids}", company_id: "${company_id}")
          }
        `,
      })
      .pipe(map((resp) => resp.data['DeleteMentorFromCompany']));
  }

  getAllMentor(company): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query GetAllMentor{
          GetAllUsers(
            company: "${company}"
            ) {
            _id
            civility
            first_name
            last_name
            full_name
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getOneMentorId(email): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query GetOneUser{
          GetOneUser (
            email:"${email}"
          ) {
            _id
            email
            first_name
            last_name
            civility
            entities {
              entity_name
              companies {
                _id
              }
              type {
                _id
                name
              }
            }
            position
            direct_line
            office_phone
            portable_phone
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneUser']));
  }

  populateDataMentor(company, company_schools): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query PopulateDataMentor{
          GetAllUsers(
            company_staff: true
            company: "${company}"
            company_schools: "${company_schools}"
            ) {
            _id
            civility
            first_name
            last_name
            full_name
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getAllUserInStaffCompany(company, pagination, sorting, filter): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query GetAllUsers($pagination: PaginationInput, $sorting: UserSorting){
          GetAllUsers(
            company_staff: true,
            ${filter}
            company: "${company}",
            pagination: $pagination,
            sorting: $sorting
            ) {
            _id
            email
            civility
            first_name
            last_name
            full_name
            position
            office_phone
            direct_line
            portable_phone
            entities {
              companies {
                _id
                company_name
              }
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
            user_status
            count_document
          }
        }
      `,
        variables: {
          pagination,
          sorting: sorting ? sorting : {},
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getAllUserInStaffCompanyByAcadir(company_schools, company, pagination, sorting, filter, user_type: string[], company_staff: boolean = false): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query GetAllUsers($pagination: PaginationInput, $sorting: UserSorting, $company_schools: [ID], $user_type: [ID!], $company_staff: Boolean){
          GetAllUsers(
            ${filter}
            company: "${company}",
            company_schools: $company_schools,
            user_type: $user_type,
            pagination: $pagination,
            sorting: $sorting
            company_staff: $company_staff
            ) {
            _id
            email
            civility
            first_name
            last_name
            full_name
            position
            office_phone
            direct_line
            portable_phone
            entities {
              companies {
                _id
                company_name
              }
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
            user_status
            count_document
          }
        }
      `,
        variables: {
          pagination,
          sorting: sorting ? sorting : {},
          company_schools,
          user_type: user_type ? user_type : null,
          company_staff,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getOneUserInStaffCompany(userId): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query GetOneUser{
          GetOneUser(_id: "${userId}") {
            _id
            email
            civility
            first_name
            last_name
            full_name
            position
            office_phone
            direct_line
            portable_phone
            entities {
              companies {
                _id
                company_name
              }
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
            user_status
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneUser']));
  }

  getAllUserInStaffCompanyByAcadirNoPagination(company_schools, company): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query GetAllUsers($company_schools: [ID]){
          GetAllUsers(
            company_staff: true,
            company: "${company}",
            company_schools: $company_schools,
            ) {
            _id
          }
        }
      `,
        variables: {
          company_schools,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getAllSchools(companyId, pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
      query GetAllSchools($page: PaginationInput, $sort: SchoolSorting) {
        GetAllSchools(
          ${filter}
          company: "${companyId}"
          pagination: $page
          sorting: $sort
          ) {
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
      .pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getSchoolsByCompanyId(companyId): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
      query GetSchoolByCompanyId($page: PaginationInput) {
        GetAllSchools(
          company: "${companyId}"
          pagination: $page
          ) {
          _id
          short_name
          count_document
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getAllSchoolsDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSchoolsDropdown{
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

  GetAllTitleDropdownList(school_id) {
    return this.apollo
      .query({
        query: gql`
        query {
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

  getClassesByTitle(rncpId: string): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query {
          GetAllClasses(rncp_id: "${rncpId}", sorting: { name: asc}) {
            _id
            name
          }
        }
      `,
      })
      .pipe(map((resp) => resp.data['GetAllClasses']));
  }

  getOneSchool(school, pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
      query GetAllSchools($page: PaginationInput, $sort: SchoolSorting) {
        GetAllSchools(
          ${filter}
          school: "${school}"
          pagination: $page
          sorting: $sort
          ) {
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
      .pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getSchoolByAcadit(school): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
      query {
        GetAllSchools(school: "${school}") {
            _id
            short_name
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllSchools']));
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
  getCountry() {
    // return this.http.get<any[]>('assets/data/country.json');
    // *************** Modified the method for backward compatibility.
    // *************** Need to remove once done migrating to student service's GetAllCountries
    return this.apollo.query({
      query: gql`
      query GetAllCountries {
        GetAllCountries {
          _id
          country
          country_code
        }
      }
      `,
      fetchPolicy: 'network-only',
    }).pipe(map(response => {
      if (Array.isArray(response.data['GetAllCountries'])) {
        let array = response.data['GetAllCountries']
        array = array.map(item => {
          return {
            name: item?.country,
            code: item?.country_code,
          }
        })
        const result = array.filter(item => item?.name)
        return result
      } else {
        return []
      }
    }));
  }

  GetOneCompanyEntity(_id): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetOneCompanyEntity($_id: ID!) {
            GetOneCompanyEntity(_id: $_id) {
              _id
              denomination
              company_name
              no_RC
              status
              company_status
              no_rc_of_head_office
              activity
              activity_branch
              slice_of_salaried_workforce_branch
              type_of_company
              type_of_company_by_year
              created_at
              updated_at
              no_of_employee_in_france
              no_of_employee_in_france_by_year
              slice_of_salary
              nic
              slice_of_salaried_workforce
              slice_of_salaried_workforce_by_year
              created_at_of_head_office
              updated_at_of_head_office
              no_rc_of_head_office
              company_branches_id {
                legal_status
              }
              company_addresses {
                address
                postal_code
                city
                country
                region
                department
                is_main_address
              }
            }
          }
        `,
        variables: {
          _id: _id,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneCompanyEntity']));
  }

  GetAllBranchesOfCompanyEntity(_id): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetOneCompanyEntity($_id: ID!) {
            GetOneCompanyEntity(_id: $_id) {
              _id
              company_branches_id {
                _id
                company_name
                no_RC
                company_addresses {
                  address
                  is_main_address
                }
                count_document
              }
            }
          }
        `,
        variables: {
          _id: _id,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneCompanyEntity']));
  }

  GetAllCompanyNotes(filter): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllCompanyNotes($filter: CompanyNoteFilterInput) {
            GetAllCompanyNotes(filter: $filter) {
              _id
              company_id {
                _id
                company_name
              }
              company_entity_id {
                _id
                company_name
              }
              created_by {
                civility
                first_name
                last_name
                profile_picture
              }
              subject
              note
              is_reply
              category
              date_created
              tagged_user_ids {
                _id
                civility
                first_name
                last_name
              }
              reply_note_ids {
                _id
                company_id {
                  _id
                  company_name
                }
                created_by {
                  _id
                  civility
                  first_name
                  last_name
                  profile_picture
                }
                subject
                note
                category
                is_reply
                tagged_user_ids {
                  _id
                  first_name
                  last_name
                  civility
                }
                date_created
              }
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCompanyNotes']));
  }

  GetAllCompanyNoteCategories(): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetAllCompanyNoteCategories {
            GetAllCompanyNoteCategories
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCompanyNoteCategories']));
  }

  CreateCompanyNote(company_note_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateCompanyNote($company_note_input: CompanyNoteInput) {
            CreateCompanyNote(company_note_input: $company_note_input) {
              _id
            }
          }
        `,
        variables: {
          company_note_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateCompanyNote']));
  }
  GetOneCompanyNote(_id): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetOneCompanyNote($_id: ID!) {
            GetOneCompanyNote(_id: $_id) {
              _id
              subject
              note
              category
              date_created
              reply_note_ids {
                _id
                subject
                note
                category
                date_created
                created_by {
                  first_name
                  last_name
                }
                tagged_user_ids {
                  _id
                  first_name
                  last_name
                }
              }
              created_by {
                first_name
                last_name
              }
              tagged_user_ids {
                _id
                first_name
                last_name
              }
            }
          }
        `,
        variables: {
          _id,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneCompanyNote']));
  }
  UpdateCompanyNote(_id, company_note_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCompanyNote($_id: ID!, $company_note_input: CompanyNoteInput) {
            UpdateCompanyNote(_id: $_id, company_note_input: $company_note_input) {
              _id
            }
          }
        `,
        variables: {
          company_note_input,
          _id,
        },
      })
      .pipe(map((resp) => resp.data['UpdateCompanyNote']));
  }
  DeleteCompanyNote(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteCompanyNote($_id: ID!) {
            DeleteCompanyNote(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteCompanyNote']));
  }

  GetCompanyCaseBySiret(siret, country, school_id?): Observable<any> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetCompanyEtalabBySiret($siret: String, $country: String, $school_id: ID) {
            GetCompanyEtalabBySiret(siret: $siret, country: $country, school_id: $school_id) {
              message
              companies {
                _id
                company_type
                company_name
                type_of_company
                type_of_company_by_year
                no_RC
                activity
                activity_branch
                no_of_employee_in_france
                company_addresses {
                  address
                  postal_code
                  city
                  region
                  department
                  country
                  is_main_address
                }
                status
                company_status
                created_at
                updated_at
                sign_of_the_establishment
                nic
                denomination
                no_rc_of_head_office
                slice_of_salary
                no_of_employee_in_france_code
                no_of_employee_in_france_by_year
                slice_of_salaried_workforce_code
                slice_of_salaried_workforce
                slice_of_salaried_workforce_by_year
                slice_of_salaried_workforce_branch
                created_at_of_head_office
                updated_at_of_head_office
                legal_status
              }
              company_name
            }
          }
        `,
        variables: {
          siret,
          country,
          school_id,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetCompanyEtalabBySiret']));
  }

  CreateCompanyByCases(message, company_branch_id, company_entity_id, school_to_connect, companies): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateCompanyByCases(
            $message: String
            $company_branch_id: ID
            $company_entity_id: ID
            $school_to_connect: ID
            $companies: [CompanyEtalabBranchEntityInput]
          ) {
            CreateCompanyByCases(
              message: $message
              company_branch_id: $company_branch_id
              company_entity_id: $company_entity_id
              school_to_connect: $school_to_connect
              companies: $companies
            ) {
              _id
            }
          }
        `,
        variables: {
          message,
          company_branch_id,
          company_entity_id,
          school_to_connect,
          companies,
        },
      })
      .pipe(map((resp) => resp.data['CreateCompanyByCases']));
  }

  validateCompanyNonFrance(company_name, zip_code): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ValidateCompanyNonFrance($company_name: String!, $zip_code: String!) {
            ValidateCompanyNonFrance(company_name: $company_name, zip_code: $zip_code) {
              message
              companies {
                _id
                company_name
                brand
                activity
                type_of_company
                no_RC
                capital
                no_of_employee_in_france
                company_addresses {
                  address
                  postal_code
                  city
                  country
                }
              }
            }
          }
        `,
        variables: {
          company_name,
          zip_code,
        },
      })
      .pipe(map((resp) => resp.data['ValidateCompanyNonFrance']));
  }
  
  ImportCompanyData(companyInput, file,user_type_id?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ImportCompanyData($companyInput: ImportCompanyInput!, $file: Upload!, $lang: String,$user_type_id: ID) {
            ImportCompanyBySiret(import_company_input: $companyInput, file: $file, lang: $lang, user_type_id: $user_type_id)
          }
        `,
        variables: {
          file,
          companyInput,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
          user_type_id: user_type_id? user_type_id : null
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['ImportCompanyBySiret']));
  }

  importCountryAndNationality(delimiter, file): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ImportCountryNationality($delimiter: String!, $file: Upload!, $lang: String) {
            ImportCountryNationality(delimiter: $delimiter, file: $file, lang: $lang)
          }
        `,
        variables: {
          file,
          delimiter: delimiter?.file_delimeter ? delimiter?.file_delimeter : '',
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['ImportCountryNationality']));
  }
}