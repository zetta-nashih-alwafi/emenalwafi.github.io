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
export class PromoExternalService {
  constructor(private httpClient: HttpClient, private apollo: Apollo, private translate: TranslateService) {}

  createPromoExternal(data) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreatePromoExternal($promo_external_input: PromoExternalInput) {
            CreatePromoExternal(promo_external_input: $promo_external_input) {
              ref_id
              module
              title
              sub_title
              story
              school
              campus
              levels
              gender
              region
              hobbies
              job
              activity
              integration
              insertion
              program
              video_link
              image_upload
              generic
              is_published
            }
          }
        `,
        variables: {
          promo_external_input: data,
        },
      })
      .pipe(
        map((resp: any) => {
          return resp.data.PromoExternal;
        }),
      );
  }

  deletePromoExternal(_id: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeletePromoExternal($_id: ID!) {
            DeletePromoExternal(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeletePromoExternal']));
  }

  updatePromoExternal(_id: string, data: any) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdatePromoExternal($_id: ID!, $promo_external_input: PromoExternalInput) {
            UpdatePromoExternal(_id: $_id, promo_external_input: $promo_external_input) {
              ref_id
              module
              title
              sub_title
              story
              school
              campus
              levels
              gender
              region
              hobbies
              job
              activity
              integration
              insertion
              program
              video_link
              image_upload
              generic
              is_published
            }
          }
        `,
        variables: {
          _id,
          promo_external_input: data,
        },
      })
      .pipe(
        map((resp: any) => {
          return resp.data.PromoExternal;
        }),
      );
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
  getAllPromoExternals(pagination, sortValue, filter?) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllPromoExternals($pagination: PaginationInput, $sort: PromoExternalSortingInput) {
            GetAllPromoExternals(pagination: $pagination, sorting: $sort, ${filter}) {
              _id
              ref_id
              module
              title
              sub_title
              story
              school
              campus
              gender
              levels
              region
              hobbies
              job
              activity
              integration
              insertion
              program
              video_link
              image_upload
              generic
              is_published
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
      .valueChanges.pipe(map((resp) => resp.data['GetAllPromoExternals']));
  }

  getAllPromoExternalsForDisplay(filter) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetPromoAllExternalsForDisplay  {
            GetPromoAllExternalsForDisplay(${filter}) {
              _id
              ref_id
              module
              title
              sub_title
              story
              school
              campus
              gender 
              levels
              region
              hobbies
              job
              activity
              integration
              insertion
              program
              video_link
              image_upload
              generic
              is_published
            }
          }
        `,
        variables: {},
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['PromoExternal']));
  }
  getPromoExternal(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/promo-external.json');
  }
}
