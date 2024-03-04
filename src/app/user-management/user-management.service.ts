import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  public refresh: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  constructor(public httpClient: HttpClient, private apollo: Apollo) {}

  triggerRefresh(value: boolean) {
    this.refresh.next(value);
  }

  getAllUserTypeDropdown(entities?: string[]): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query getAllUserTypeDropdown($entities: [String]) {
            GetAllUserTypes(entities: $entities) {
              _id
              name
              entity
            }
          }
        `,
        variables: {
          entities,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((response) => {
          if (response.data) {
            return response.data['GetAllUserTypes'];
          }
        }),
      );
  }

  getAllSchoolDropdown(user_type_id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query getAllSchoolDropdown($user_type_id: ID) {
            GetAllCandidateSchool(user_type_id: $user_type_id) {
              _id
              short_name
              campuses {
                _id
                name
                levels {
                  _id
                  name
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          user_type_id,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  GetAllSchoolFilter(filter, user_type_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($user_type_id: ID){
            GetAllCandidateSchool(${filter}, user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              campuses {
                _id
                name
                address
                post_code
                city
                country
                currency
                bank {
                  name
                  contacts {
                    first_name
                    last_name
                    civility
                    sex
                    position
                    fixed_phone
                    mobile_phone
                    email
                  }
                  address
                  post_code
                  city
                  country
                }
                levels {
                  _id
                  name
                  code
                  description
                  extra_fees {
                    name
                    amount
                  }
                  rate_profiles {
                    name
                    down_payment
                    payment_plan {
                      name
                      times
                      additional_expense
                      payment_date {
                        date
                        amount
                      }
                    }
                  }
                  documents {
                    name
                    url
                  }
                  terms_and_condition
                  specialities {
                    name
                  }
                }
                specialities {
                  _id
                  name
                }
              }
              levels {
                _id
                name
                code
                description
                extra_fees {
                  name
                  amount
                }
                rate_profiles {
                  name
                  down_payment
                  payment_plan {
                    name
                    times
                    additional_expense
                    payment_date {
                      date
                      amount
                    }
                  }
                }
                documents {
                  name
                  url
                }
                terms_and_condition
                specialities {
                  name
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          user_type_id,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
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
          user_type_id
        },
      })
      .pipe(map((resp) => resp.data['UpdateUserEntities']));
  }

  updateUserAfterDeleteEntity(_id: string, user_input: any,user_type_id?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateUser($_id: ID!, $lang: String!, $user_input: UserInput!,$user_type_id: ID) {
            UpdateUser(_id: $_id, lang: $lang, user_input: $user_input, user_type_id: $user_type_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
          user_input,
          user_type_id: user_type_id? user_type_id : null
        },
      })
      .pipe(map((resp) => resp.data['UpdateUser']));
  }
}
