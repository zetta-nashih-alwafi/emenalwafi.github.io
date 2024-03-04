import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Cacheable } from 'ngx-cacheable';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AlumniService {
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

  getAllAlumni(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllAlumni {
              _id
              pro_tel
              per_tel
              student_id {
                first_name
                last_name
                civility
                first_name_used
                last_name_used
                is_photo_in_s3
                photo
                photo_s3_path
                email
                professional_email
              }
              civility
              first_name
              used_first_name
              last_name
              used_last_name
              email
              city
              country
              phone_number
              professional_email
              professional_phone_number
              promo_year
              school
              campus
              speciality
              professional_status
              company
              activity_sector
              job_name
              alumni_survey_id {
                _id
              }
              created_by
              updated_by
              status
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumni']));
  }

  getAllAlumniFollowUp(pagination, sortValue, filter, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllAlumni($user_type_ids: [ID], $pagination: PaginationInput, $sort: AlumniSortingInput) {
          GetAllAlumni(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}) {
            _id
            last_survey_completed
            rncp_title
            candidate_id {
              first_name
              last_name
              civility
              first_name_used
              last_name_used
              address
              city_of_birth
              country_of_birth
              email
            }
            updated_at
            email
            professional_email
            date_of_birth
            civility
            first_name
            used_first_name
            last_name
            used_last_name
            promo_year
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
            sector {
              _id
              name
            }
            speciality {
              _id
              name
            }
            city
            country
            professional_status
            company
            activity_sector
            job_name
            last_survey_sent {
              date
              time
            }
            sent_by {
              _id
              first_name
              last_name
              civility
              email
            }
            alumni_survey_process_ids {
              _id
              form_builder_id {
                _id
                form_builder_name
              }
            }
            email_status
              count_document
            }
          }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumni']));
  }

  getAllAlumniFollowUpCheckbox(pagination, sortValue, filter, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllAlumni($user_type_ids: [ID], $pagination: PaginationInput, $sort: AlumniSortingInput) {
          GetAllAlumni(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}) {
            _id
            candidate_id {
              first_name
              last_name
              civility
              first_name_used
              last_name_used
              address
              city_of_birth
              country_of_birth
              email
            }
            updated_at
            email
            professional_email
            date_of_birth
            civility
            first_name
            used_first_name
            last_name
            used_last_name
            promo_year
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
            sector {
              _id
              name
            }
            speciality {
              _id
              name
            }
            city
            country
            professional_status
            company
            activity_sector
            job_name
            last_survey_sent {
              date
              time
            }
            sent_by {
              _id
              first_name
              last_name
              civility
              email
            }
            alumni_survey_process_ids {
              _id
              form_builder_id {
                _id
                form_builder_name
              }
            }
            email_status
            count_document
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumni']));
  }

  getAllAlumniForExportCheckbox(pagination, sortValue, filter, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllAlumni($user_type_ids: [ID], $pagination: PaginationInput, $sort: AlumniSortingInput) {
          GetAllAlumni(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}) {
            _id
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumni']));
  }

  getAllAlumniForSurveyCheckbox(pagination, sortValue, filter, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllAlumni($user_type_ids: [ID], $pagination: PaginationInput, $sort: AlumniSortingInput) {
          GetAllAlumni(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}) {
            _id
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumni']));
  }

  getAllAlumniTrombinoscope(pagination): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAlumni($pagination: PaginationInput) {
            GetAllAlumni(pagination: $pagination) {
              _id
              student_id {
                first_name
                last_name
                civility
                first_name_used
                last_name_used
                student_address {
                  city_of_birth
                  country_of_birth
                }
                email
                professional_email
              }
              date_of_birth
              civility
              first_name
              used_first_name
              last_name
              used_last_name
              email
              city
              country
              phone_number
              professional_email
              professional_phone_number
              promo_year
              school
              campus
              speciality
              professional_status
              company
              activity_sector
              job_name
              alumni_survey_id {
                _id
              }
              pro_tel
              per_tel
              updated_at
              updated_by
              status
              count_document
              promo_name
              master
              master_promo
              personal_postcode
              personal_address
            }
          }
        `,
        variables: {
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumni']));
  }

  getAllAlumniTrombinoscopeAlumni(pagination, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAlumni($pagination: PaginationInput) {
            GetAllAlumni(pagination: $pagination, ${filter}) {
              _id
              student_id {
                first_name
                last_name
                civility
                first_name_used
                last_name_used
                student_address {
                  city_of_birth
                  country_of_birth
                }
                email
                professional_email
              }
              date_of_birth
              civility
              first_name
              used_first_name
              last_name
              used_last_name
              email
              city
              country
              phone_number
              professional_email
              professional_phone_number
              promo_year
              school
              campus
              speciality
              professional_status
              company
              activity_sector
              job_name
              alumni_survey_id {
                _id
              }
              pro_tel
              per_tel
              updated_at
              updated_by
              status
              count_document
              promo_name
              master
              master_promo
              personal_postcode
              personal_address
            }
          }
        `,
        variables: {
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumni']));
  }

  getOneAlumni(_id: String): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetOneAlumni(_id:"${_id}") {
              _id
              student_id {
                first_name
                last_name
                civility
                first_name_used
                last_name_used
                email
                tele_phone
              }
              civility
              pro_tel
              per_tel
              first_name
              used_first_name
              last_name
              used_last_name
              email
              city
              country
              phone_number
              professional_email
              professional_phone_number
              promo_year
              school
              campus
              speciality
              professional_status
              company
              activity_sector
              job_name
              alumni_survey_id {
                _id
                photo
              }
              created_by
              updated_by
              status
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneAlumni']));
  }

  getOneAlumniByStudent(_id: String): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetOneAlumni(student_id:"${_id}") {
              _id
              student_id {
                first_name
                last_name
                civility
                first_name_used
                last_name_used
                email
                tele_phone
              }
              civility
              pro_tel
              per_tel
              first_name
              used_first_name
              last_name
              used_last_name
              email
              city
              country
              phone_number
              professional_email
              professional_phone_number
              promo_year
              school
              campus
              speciality
              professional_status
              company
              activity_sector
              job_name
              alumni_survey_id {
                _id
                photo
              }
              created_by
              updated_by
              status
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneAlumni']));
  }

  getAllAlumniMember(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllUsers($pagination: PaginationInput, $sort: UserSorting) {
          GetAllUsers(pagination: $pagination, sorting: $sort, ${filter}, user_type: "60b4421aa16cc71e0c37132d") {
            _id
            first_name
            civility
            last_name
            entities {
              entity_name
              candidate_school
              type {
                name
                _id
              }
            }
            user_status
            email
            portable_phone
              count_document
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }

  UpdateAlumni(alumni_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateAlumni($alumni_input: AlumniInput, $_id: ID!) {
            UpdateAlumni(alumni_input: $alumni_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          alumni_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateAlumni']));
  }

  getOneAlumniDetail(id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetOneAlumniDetail {
          GetOneAlumni(_id: "${id}") {
            _id
            civility
            first_name
            last_name
            used_last_name
            promo_year
            school {
              _id
            }
            campus {
              _id
            }
            sector {
              _id
            }
            speciality {
              _id
            }
            date_of_birth
            email
            personal_address
            personal_postcode
            country
            city
            department
            region
            professional_status
            company
            activity_sector
            job_name
            phone_number
            # rncp_title
            user_id {
              _id
            }
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneAlumni']));
  }

  getOneAlumniSurveyDetail(id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetOneAlumni {
          GetOneAlumni(_id: "${id}") {
            _id
            alumni_survey_process_ids {
              _id
              date_sent {
                date
                time
              }
              survey_status
              name
              form_builder_id {
                _id
                form_builder_name
              }
            }
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneAlumni']));
  }

  getOneAlumniSurvey(id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query {
          GetOneAlumniSurvey(_id: "${id}") {
            _id
            civility
            first_name
            used_first_name
            last_name
            used_last_name
            promo_year
            school
            campus
            speciality
            email
            phone_number
            photo
            city
            country
            is_working
            siret
            company
            company_activity
            job_occupied
            professional_phone_number
            professional_email
            define_school_efap
            is_following_social_media
            is_allow_receive_newsletter
            email_newsletter
            alumni_id {
              _id
            }
            status
            pro_postcode
            pro_sector_precise
            pro_city
            pro_country
            date_of_birth
            com_sur_mail_pro
            com_sur_mail_perso
            created_by
            created_at
            master
            master_promo
            dead
            promo_name
            mentor
            personal_address
            personal_postcode
            pro_tel
            per_tel
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneAlumniSurvey']));
  }

  SendAlumniSurvey(alumni_survey_inputs): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendAlumniSurvey($alumni_survey_inputs: [AlumniSurveyInput]) {
            SendAlumniSurvey(alumni_survey_inputs: $alumni_survey_inputs) {
              _id
            }
          }
        `,
        variables: {
          alumni_survey_inputs,
        },
      })
      .pipe(map((resp) => resp.data['SendAlumniSurvey']));
  }

  UpdateAlumniSurvey(alumni_survey_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateAlumniSurvey($alumni_survey_input: AlumniSurveyInput, $_id: ID!) {
            UpdateAlumniSurvey(alumni_survey_input: $alumni_survey_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          alumni_survey_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateAlumniSurvey']));
  }

  SendAlumniN1Notification(_id, form_builder_id, user_type_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendAlumniN1Notification($_id: [ID!], $form_builder_id: ID, $user_type_id: ID) {
            SendAlumniN1Notification(_id: $_id, form_builder_id: $form_builder_id, user_type_id: $user_type_id)
          }
        `,
        variables: {
          _id,
          form_builder_id,
          user_type_id
        },
      })
      .pipe(map((resp) => resp.data['SendAlumniN1Notification']));
  }

  createAlumniHistory(alumni_history_input): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateAlumniHistory($alumni_history_input: AlumniHistoryInput) {
            CreateAlumniHistory(alumni_history_input: $alumni_history_input) {
              _id
            }
          }
        `,
        variables: {
          alumni_history_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateAlumniHistory']));
  }

  CreateAlumni(alumni_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateAlumni($alumni_input: AlumniInput) {
            CreateAlumni(alumni_input: $alumni_input) {
              _id
            }
          }
        `,
        variables: {
          alumni_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateAlumni']));
  }

  getAllAlumniHistory(pagination, filter, alumni_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllAlumniHistories($pagination: PaginationInput) {
          GetAllAlumniHistories(pagination: $pagination, ${filter}, alumni_id: "${alumni_id}") {
            _id
            history_date
            history_time
            action
            description
            who {
              first_name
              last_name
              civility
            }
            status
            alumni_id {
              _id
              updated_at
            }
            count_document
          }
        }
        `,
        variables: {
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumniHistories']));
  }

  getAllAlumniHistoryDetail(pagination, filter, alumni_id, sorting): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllAlumniHistories($pagination: PaginationInput, $sorting: AlumniHistorySortingInput, $lang: String) {
          GetAllAlumniHistories(pagination: $pagination, ${filter}, alumni_id: "${alumni_id}", sorting: $sorting, lang: $lang) {
            _id
            history_date
            history_time
            action
            description
            who {
              first_name
              last_name
              civility
            }
            status
            alumni_id {
              _id
              updated_at
            }
            count_document
          }
        }
        `,
        variables: {
          pagination,
          sorting: sorting ? sorting : {},
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumniHistories']));
  }

  getAllAlumniHistoryCheckbox(pagination, filter, alumni_id, sorting): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllAlumniHistories($pagination: PaginationInput, $sorting: AlumniHistorySortingInput, ) {
          GetAllAlumniHistories(pagination: $pagination, ${filter}, alumni_id: "${alumni_id}", sorting: $sorting) {
            _id
            history_date
            history_time
            action
            description
            who {
              first_name
              last_name
              civility
            }
            status
            alumni_id {
              _id
              updated_at
            }
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
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumniHistories']));
  }

  GetAllAlumniPromoYear(): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAlumniPromoYear {
            GetAllAlumniPromoYear
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumniPromoYear']));
  }

  GetAllAlumniSchool(): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAlumniSchool {
            GetAllAlumniSchoolDropdown{
              _id
              short_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumniSchoolDropdown']));
  }

  GetAllAlumniCampus(): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAlumniCampus {
            GetAllAlumniCampusDropdown
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumniCampusDropdown']));
  }

  GetAllAlumniFiliere(): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllAlumniFiliere
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumniFiliere']));
  }

  GetAllAlumniSector(): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAlumniSector {
            GetAllAlumniSectorDropdown{
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumniSectorDropdown']));
  }
  GetAllAlumniSpeciality(): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAlumniSpeciality{
            GetAllAlumniSpecialityDropdown{
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumniSpecialityDropdown']));
  }

  GetAllAlumniCity(): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAlumniCity{
            GetAllAlumniCityDropdown
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumniCityDropdown']));
  }

  GetAllAlumniCountry(): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAlumniCountry{
            GetAllAlumniCountryDropdown
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumniCountryDropdown']));
  }

  GetAllAlumniCompany(): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAlumniCompany{
            GetAllAlumniCompanyDropdown
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumniCompanyDropdown']));
  }

  GetAllAlumniSurveySender(): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAlumniSurveySender{
            GetAllAlumniSenderSurveyDropdown{
              _id
              civility
              first_name
              last_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumniSenderSurveyDropdown']));
  }

  getAllSpecializations(sectorId): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSpecializations($sectorId: ID) {
            GetAllSpecializations(filter: {sector: $sectorId}){
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          sectorId,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSpecializations']));
  }

  getAllSpecialities(filter): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSpecializations($filter: SpecializationFilterInput) {
            GetAllSpecializations(filter: $filter){
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSpecializations']));
  }

  getAllSectors(filter?): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSectors($filter: SectorFilterInput) {
            GetAllSectors(filter: $filter) {
              _id
              name
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSectors']));
  }

  getAllCandidateSchool(user_type_id?): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($user_type_id: ID){
            GetAllCandidateSchool(user_type_id: $user_type_id) {
              _id
              short_name
              campuses {
                _id
                name
              }
            }
          }
        `,variables: {
          user_type_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }
  GetAllAlumniComments(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAlumniComments($filter: AlumniCommentFilterInput) {
            GetAllAlumniComments(filter: $filter) {
              _id
              alumni_id {
                _id
                first_name
                last_name
                civility
              }
              created_by {
                _id
                first_name
                last_name
                civility
                profile_picture
              }
              subject
              comment
              is_personal_situation
              is_restrictive_conditions
              is_reply
              reply_for_comment_id {
                _id
                alumni_id {
                  _id
                  first_name
                  last_name
                  civility
                }
                created_by {
                  _id
                  first_name
                  last_name
                  civility
                  profile_picture
                }
                subject
                comment
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
              reply_comment_ids {
                _id
                alumni_id {
                  _id
                  first_name
                  last_name
                  civility
                }
                created_by {
                  _id
                  first_name
                  last_name
                  civility
                  profile_picture
                }
                subject
                comment
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
              tagged_user_ids {
                _id
                first_name
                last_name
                civility
              }
              date_created
              category
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumniComments']));
  }

  GetOneAlumniComment(_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneAlumniComment($_id: ID!) {
            GetOneAlumniComment(_id: $_id) {
              _id
              alumni_id {
                _id
                first_name
                last_name
                civility
              }
              created_by {
                _id
                first_name
                last_name
                civility
                profile_picture
              }
              subject
              comment
              is_personal_situation
              is_restrictive_conditions
              is_reply
              reply_for_comment_id {
                _id
                alumni_id {
                  _id
                  first_name
                  last_name
                  civility
                }
                created_by {
                  _id
                  first_name
                  last_name
                  civility
                  profile_picture
                }
                subject
                comment
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
              reply_comment_ids {
                _id
                alumni_id {
                  _id
                  first_name
                  last_name
                  civility
                }
                created_by {
                  _id
                  first_name
                  last_name
                  civility
                  profile_picture
                }
                subject
                comment
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
              tagged_user_ids {
                _id
                first_name
                last_name
                civility
              }
              category
              date_created
            }
          }
        `,
        variables: {
          _id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneAlumniComment']));
  }

  GetAllAlumniCommentCategories(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAlumniCommentCategories{
            GetAllAlumniCommentCategories
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumniCommentCategories']));
  }

  CreateAlumniComment(alumni_comment_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateAlumniComment($alumni_comment_input: AlumniCommentInput) {
            CreateAlumniComment(alumni_comment_input: $alumni_comment_input) {
              _id
            }
          }
        `,
        variables: {
          alumni_comment_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateAlumniComment']));
  }

  UpdateAlumniComment(_id, alumni_comment_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateAlumniComment($_id: ID!, $alumni_comment_input: AlumniCommentInput) {
            UpdateAlumniComment(_id: $_id, alumni_comment_input: $alumni_comment_input) {
              _id
            }
          }
        `,
        variables: {
          _id,
          alumni_comment_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateAlumniComment']));
  }

  DeleteAlumniComment(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteAlumniComment($_id: ID!) {
            DeleteAlumniComment(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteAlumniComment']));
  }

  GetAlumniCommentsFilterList(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAlumniComments($filter: AlumniCommentFilterInput) {
            GetAllAlumniComments(filter: $filter) {
              created_by {
                _id
                first_name
                last_name
                civility
              }
              date_created
              category
              is_reply
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumniComments']));
  }

  GetAllAlumniCampusBySchool(filter): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAlumniCampusDropdown($filter: AlumniCampusDropdownFilterInput) {
            GetAllAlumniCampusDropdown(filter: $filter)
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumniCampusDropdown']));
  }

  GetAllAlumniSectorByCampus(filter): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAlumniSectorDropdown($filter: AlumniSectorDropdownFilterInput) {
            GetAllAlumniSectorDropdown(filter: $filter){
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumniSectorDropdown']));
  }

  GetAllAlumniSpecialityBySector(filter): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAlumniSpecialityDropdown($filter: AlumniSpecialityDropdownFilterInput) {
            GetAllAlumniSpecialityDropdown(filter: $filter){
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumniSpecialityDropdown']));
  }
}
