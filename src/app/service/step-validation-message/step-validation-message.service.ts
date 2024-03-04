import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class StepValidationMessageService {
  constructor(private httpClient: HttpClient, private apollo: Apollo, private translate: TranslateService) {}

  createStepValidationMessage(data) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateStepValidationMessage($step_validation_message_input: StepValidationMessageInput) {
            CreateStepValidationMessage(step_validation_message_input: $step_validation_message_input) {
              validation_step
              first_title
              second_title
              school
              campus
              gender
              region
              generic
              video_link
              image_upload
              is_published
            }
          }
        `,
        variables: {
          step_validation_message_input: data,
        },
      })
      .pipe(
        map((resp: any) => {
          return resp.data.StepValidationMessage;
        }),
      );
  }
  updateStepValidationMessage(_id, data) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateStepValidationMessage($_id: ID!, $step_validation_message_input: StepValidationMessageInput) {
            UpdateStepValidationMessage(_id: $_id, step_validation_message_input: $step_validation_message_input) {
              validation_step
              first_title
              second_title
              school
              campus
              gender
              region
              generic
              video_link
              image_upload
              is_published
            }
          }
        `,
        variables: {
          step_validation_message_input: data,
          _id,
        },
      })
      .pipe(
        map((resp: any) => {
          return resp.data.StepValidationMessage;
        }),
      );
  }
  deleteStepValidationMessage(_id) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteStepValidationMessage($_id: ID!) {
            DeleteStepValidationMessage(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(
        map((resp: any) => {
          return resp.data.StepValidationMessage;
        }),
      );
  }

  editStepValidationMessage(_id, data) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateStepValidationMessage($_id: ID!, $step_validation_message_input: StepValidationMessageInput) {
            UpdateStepValidationMessage(_id: $_id, step_validation_message_input: $step_validation_message_input) {
              validation_step
              first_title
              second_title
              school
              campus
              gender
              region
              generic
              video_link
              image_upload
              is_published
            }
          }
        `,
        variables: {
          step_validation_message_input: data,
          _id: _id,
        },
      })
      .pipe(
        map((resp: any) => {
          return resp.data.StepValidationMessage;
        }),
      );
  }

  getAllStepValidationMessage(pagination, sortValue, filter?) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStepValidationMessages($pagination: PaginationInput, $sort: StepValidationMessageSortingInput) {
            GetAllStepValidationMessages(pagination: $pagination, sorting: $sort, ${filter}) {
              _id
              validation_step
              first_title
              second_title
              school
              campus
              gender
              region
              video_link
              image_upload
              generic
              is_published
              first_button
              second_button
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
      .valueChanges.pipe(map((resp) => resp.data['GetAllStepValidationMessages']));
  }
  getAllCandidateSchool(pagination, filter?, user_type_id?) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($pagination: PaginationInput, $filter: CandidateSchoolFilterInput, $user_type_id: ID) {
            GetAllCandidateSchool(pagination: $pagination, filter: $filter, user_type_id: $user_type_id) {
              short_name
              long_name
              campuses {
                name
              }
              levels {
                name
                code
              }
              specialities {
                name
              }
            }
          }
        `,
        variables: {
          pagination,
          filter: filter ? filter : {},
          user_type_id: user_type_id ? user_type_id : null,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }
  getPromoExternal(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/promo-external.json');
  }
}
