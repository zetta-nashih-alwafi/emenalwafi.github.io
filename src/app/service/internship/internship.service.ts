import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular-link-http';
import gql from 'graphql-tag';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class InternshipService {
  areChildrenFormValid = false;
  companyIdOnEdit = new BehaviorSubject<string>(null);
  public indexStep: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  public schoolData: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  setIndexStep(value: number) {
    this.indexStep.next(value);
  }

  pushSelectedSchool(datass) {
    this.schoolData.next(datass);
  }

  get childrenFormStatus() {
    return this.areChildrenFormValid;
  }

  set childrenFormStatus(state: boolean) {
    this.areChildrenFormValid = state;
  }

  constructor(private apollo: Apollo, private httpClient: HttpClient, httpLink: HttpLink, private translate: TranslateService) {}

  getJSON() {
    return this.httpClient.get<any[]>('assets/data/settingCondition.json');
  }

  getAllInternships(pagination, filter?, sorting?, searching?): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllInternships(
            $pagination: PaginationInput
            $filter: InternshipFilterInput
            $sorting: InternshipSortingInput
            $searching: InternshipSearchingInput
          ) {
            GetAllInternships(pagination: $pagination, filter: $filter, sorting: $sorting, searching: $searching) {
              _id
              internship_creation_step
              date_agreement_asked
              mentor_id {
                _id
                first_name
                last_name
                civility
              }
              student_id {
                _id
                civility
                first_name
                last_name
                candidate_school{
                  _id
                  short_name
                }
                candidate_campus{
                  _id
                  name
                }
                email
              }
              company_relation_member_id {
                _id
                first_name
                last_name
                civility
              }
              is_published
              internship_status
              agreement_status
              company_branch_id {
                _id
                company_name
              }
              internship_date {
                date_to
                date_from
                duration_in_weeks
              }
              internship_status
              is_company_manager_already_sign
              is_mentor_already_sign
              is_student_already_sign
              count_document
              pdf_file_name
            }
          }
        `,
        variables: {
          pagination,
          filter: filter ? filter : null,
          sorting: sorting ? sorting : null,
          searching: searching ? searching : null,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllInternships']));
  }

  getAllAgreementConditionsTable(filter): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAgreementConditions($filter: AgreementConditionFilter) {
            GetAllAgreementConditions(filter: $filter) {
              _id
              scholar_season_id {
                _id
                scholar_season
              }
              schools_id {
                _id
                short_name
              }
              campuses
              levels
              condition_agreement
            }
          }
        `,
        variables: {
          filter: filter ? filter : null,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAgreementConditions']));
  }

  getOneInternship(_id?): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneInternship($_id: ID!) {
            GetOneInternship(_id: $_id) {
              _id
              internship_creation_step
              internship_name
              commentaries
              internship_status
              salary
              currency
              student_sign_status
              mentor_sign_status
              company_manager_sign_status
              company_relation_member_sign_status
              agreement_status
              company_branch_id {
                _id
                country
                company_entity_id {
                  _id
                }
                status
                company_name
                company_logo
                description
                brand
                type_of_company
                type_of_industry
                no_RC
                mentor_ids {
                  _id
                }
                school_ids {
                  _id
                  short_name
                }
                company_addresses {
                  address
                  city
                  country
                  is_main_address
                  postal_code
                  region
                  department
                }
                count_document
                images {
                  s3_file_name
                }
                company_logo
                banner
                activity
                twitter_link
                instagram_link
                facebook_link
                youtube_link
                video_link
                website_link
              }
              company_manager_id {
                _id
                first_name
                last_name
                civility
                email
                position
              }
              internship_date {
                date_from
                date_to
                time_from
                time_to
                duration_in_weeks
                duration_in_months
              }
              is_student_already_sign
              is_mentor_already_sign
              is_company_relation_member_already_sign
              is_company_manager_already_sign
              company_member_signs {
                _id
                is_already_sign
                company_member_id {
                  _id
                  first_name
                  last_name
                  civility
                }
              }
              is_published
              status
              amendments {
                _id
                amendment_type
                date_from
                time_from
                date_to
                time_to
                is_student_already_sign
                is_HR_already_sign
                is_BR_already_sign
              }
              mentor_id {
                _id
                first_name
                last_name
                civility
                email
                position
                portable_phone
              }
              company_members {
                is_should_sign_aggreement
                company_member_id {
                  _id
                  first_name
                  last_name
                  civility
                  email
                  position
                }
              }
              company_relation_member_id {
                _id
                first_name
                last_name
                civility
                email
                position
                portable_phone
              }
              student_id {
                _id
                civility
                first_name
                last_name
                photo
                sex
                date_of_birth
                is_photo_in_s3
                place_of_birth
                status
                candidate_id {
                  intake_channel
                }
                student_title_status
                photo_s3_path
                candidate_school
                candidate_level
                candidate_campus
                student_address {
                  address
                  additional_address
                  postal_code
                  city
                  country
                  is_main_address
                  city_of_birth
                  country_of_birth
                  post_code_of_birth
                }
                nationality
                nationality_second
                last_name_used
                first_name_used
                email
                tele_phone
                home_telephone
                date_of_birth
                companies {
                  status
                  is_active
                  internship_id {
                    _id
                    internship_name
                    internship_date {
                      date_from
                      date_to
                      duration_in_weeks
                      duration_in_months
                    }
                    volume_hours
                    job_description
                  }
                  company {
                    _id
                    country
                    company_entity_id {
                      _id
                    }
                    status
                    company_name
                    company_logo
                    description
                    brand
                    type_of_company
                    type_of_industry
                    no_RC
                    mentor_ids {
                      _id
                    }
                    school_ids {
                      _id
                      short_name
                    }
                    company_addresses {
                      address
                      city
                      country
                      is_main_address
                      postal_code
                      region
                      department
                    }
                    count_document
                    images {
                      s3_file_name
                    }
                    company_logo
                    banner
                    activity
                    twitter_link
                    instagram_link
                    facebook_link
                    youtube_link
                    video_link
                    website_link
                  }
                }
                school {
                  _id
                  logo
                  short_name
                  long_name
                  tele_phone
                  school_address {
                    address1
                    address2
                    postal_code
                    city
                    region
                    department
                    country
                    is_main_address
                  }
                }
              }
              is_published
              pdf_file_name
              department
              is_work_from_home
              volume_hours
              job_description
              internship_address {
                address
                postal_code
                city
              }
              internship_aboard {
                address
                postal_code
                city
              }
              company_manager_id {
                _id
                entities {
                  entity_name
                }
                first_name
                last_name
                civility
                position
                email
                portable_phone
              }
            }
          }
        `,
        variables: {
          _id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneInternship']));
  }

  getOneInternshipStatus(_id?): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneInternship($_id: ID!) {
            GetOneInternship(_id: $_id) {
              _id
              internship_creation_step
              internship_name
              commentaries
              internship_status
              agreement_status
              is_published
              status
              pdf_file_name
            }
          }
        `,
        variables: {
          _id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneInternship']));
  }

  updateInternship(id, payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateInternship($_id: ID!, $internship_input: CreateInternshipInput!) {
            UpdateInternship(_id: $_id, internship_input: $internship_input) {
              _id
              internship_creation_step
            }
          }
        `,
        variables: {
          internship_input: payload,
          _id: id,
        },
      })
      .pipe(map((resp) => resp.data['UpdateInternship']));
  }

  createAmendment(id, payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateAmendment($_id: ID!, $amendments: AmendmentInput!) {
            CreateAmendment(_id: $_id, amendments: $amendments) {
              _id
              internship_creation_step
            }
          }
        `,
        variables: {
          amendments: payload,
          _id: id,
        },
      })
      .pipe(map((resp) => resp.data['CreateAmendment']));
  }

  generateAgreementPDF(internship_id, is_CRM): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GenerateAgreementPDF($internship_id: ID, $is_CRM: Boolean) {
            GenerateAgreementPDF(internship_id: $internship_id, is_CRM: $is_CRM)
          }
        `,
        variables: {
          internship_id,
          is_CRM
        },
      })
      .pipe(map((resp) => resp.data['GenerateAgreementPDF']));
  }

  triggerNotificationINTERNSHIP_N8(internship_id, reason_input, user_ask_id, is_student): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation TriggerNotificationINTERNSHIP_N8(
            $internship_id: ID
            $reason_input: String
            $lang: String
            $user_ask_id: ID
            $is_student: Boolean
          ) {
            TriggerNotificationINTERNSHIP_N8(
              internship_id: $internship_id
              reason_input: $reason_input
              lang: $lang
              user_ask_id: $user_ask_id
              is_student: $is_student
            )
          }
        `,
        variables: {
          internship_id,
          reason_input,
          user_ask_id,
          is_student,
          lang: this.translate.currentLang,
        },
      })
      .pipe(map((resp) => resp.data['TriggerNotificationINTERNSHIP_N8']));
  }

  getAllScholarSeasons(filter?): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllScholarSeasons($filter: ScholarSeasonFilterInput) {
            GetAllScholarSeasons(filter: $filter) {
              _id
              scholar_season
              description
              from {
                date_utc
                time_utc
              }
              to {
                date_utc
                time_utc
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter: filter ? filter : null,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllScholarSeasons']));
  }

  CreateAgreementCondition(payload) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateAgreementCondition($agreement_condition_input: AgreementConditionInput) {
            CreateAgreementCondition(agreement_condition_input: $agreement_condition_input) {
              _id
            }
          }
        `,
        variables: {
          agreement_condition_input: payload ? payload : null,
        },
      })
      .pipe(map((resp) => resp.data['CreateAgreementCondition']));
  }
  UpdateAgreementCondition(_id, payload) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateAgreementCondition($_id: ID!, $agreement_condition_input: AgreementConditionInput) {
            UpdateAgreementCondition(_id: $_id,agreement_condition_input: $agreement_condition_input) {
              _id
            }
          }
        `,
        variables: {
          _id,
          agreement_condition_input: payload ? payload : null
        },
      })
      .pipe(map((resp) => resp.data['UpdateAgreementCondition']));
  }
}
