import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ReadmissionService {
  constructor(public httpClient: HttpClient, private apollo: Apollo, private translate: TranslateService) {}

  getAllCandidatesReadmission(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidatesReadmission($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput, $lang: String) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching, lang: $lang) {
                  _id
                  jury_decision(is_readmission_table: true)
                  civility
                  first_name
                  last_name
                  payment_method
                  email
                  school_mail
                  candidate_unique_number
                  candidate_admission_status
                  financement
                  is_program_assigned
                  is_future_program_assigned
                  program_status
                  financial_situation
                  reason_no_reinscription
                  reinscription_yes_no {
                    is_answer_yes
                    answer_label
                  }
                  billing_id {
                    _id
                    is_deposit_completed
                    deposit_pay_amount
                    deposit
                    account_number
                    deposit_status
                  }
                  photo
                  reg_n8_sent_date {
                    sent_date
                    sent_time
                  }
                  announcement_call
                  announcement_email {
                    sent_date
                    sent_time
                  }
                  intake_channel {
                    _id
                    program
                    scholar_season_id {
                      _id
                      scholar_season
                    }
                  }
                  type_of_formation_id {
                    _id
                    type_of_information
                    type_of_formation
                    sigle
                    admission_form_id {
                      _id
                      form_builder_name
                    }
                  }
                  registration_profile {
                    _id
                    name
                    is_down_payment
                    discount_on_full_rate
                    type_of_formation {
                      _id
                      type_of_information
                    }
                    additional_cost_ids {
                      additional_cost
                      amount
                    }
                  }
                  scholar_season {
                    _id
                    scholar_season
                  }
                  payment
                  admission_member_id {
                    _id
                    first_name
                    last_name
                    civility
                    profile_picture
                    email
                    position
                  }
                  count_document
                  payment_supports {
                    relation
                    family_name
                    name
                    civility
                    tele_phone
                    email
                    parent_address {
                      address
                      additional_address
                      postal_code
                      city
                      region
                      department
                      country
                    }
                  }
                  selected_payment_plan {
                    additional_expense
                  }
                  continuous_formation_manager_id {
                    _id
                    first_name
                    last_name
                    civility
                    profile_picture
                    email
                    position
                  }
                  admission_process_id {
                    _id
                    steps {
                      _id
                      index
                      step_title
                      step_type
                      step_status
                      status
                      user_validator {
                        first_name
                        last_name
                        civility
                      }
                    }
                  }
                  latest_previous_program{
                    _id
                    program
                    scholar_season_id {
                      _id
                      scholar_season
                    }
                  }
                  type_of_readmission
                  registered_at {
                    date
                    time
                  }
                  resign_after_school_begins_at {
                    date
                    time
                  }
                  no_show_at {
                    date
                    time
                  }
                  level {
                    _id
                    name
                    specialities {
                      _id
                      name
                    }
                  }
                  speciality {
                    _id
                    name
                  }
                  scholar_season {
                    _id
                    scholar_season
                  }
                  sector {
                    _id
                    name
                  }
                  campus {
                    _id
                    name
                    address
                    levels {
                      _id
                      name
                    }
                    specialities {
                      _id
                      name
                    }
                  }
                  school {
                    _id
                    short_name
                    long_name
                    campuses {
                      _id
                      name
                      levels {
                        _id
                        name
                      }
                    }
                  }
                  last_reminder_date{
                    date
                    time
                  }
                }
              }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
          lang: this.translate.currentLang,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }
}
