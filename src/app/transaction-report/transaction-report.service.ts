import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TransactionReportService {
  constructor(public httpClient: HttpClient, private apollo: Apollo, private translate: TranslateService) {}

  getAllTransactions(filter, sorting, pagination): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllTransactions($sorting: TransactionSortingInput, $pagination: PaginationInput, $filter: TransactionFilterInput, $lang: String) {
            GetAllTransactions(sorting: $sorting, pagination: $pagination, filter: $filter, lang: $lang) {
              _id
              candidate_id {
                _id
                readmission_status
                candidate_unique_number
                first_name
                last_name
                civility
              }
              legal_entity {
                legal_entity_name
              }
              latest_status
              latest_response
              card_type
              psp_reference
              total_amount
              created_at {
                date
                time
              }
              is_from_cronjob
              is_for_term
              term_pays {
                term_id
                amount
                term_payment {
                  date
                  time
                } 
                term_payment_deferment{
                  date
                  time
                } 
                term_index
              }
              billing_id {
                _id
                terms {
                  _id
                  term_payment {
                    date
                    time
                  }
                  term_payment_deferment{
                    date
                    time
                  }
                }
              }
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          sorting,
          pagination,
          filter,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllTransactions'];
        }),
      );
  }
  getAllTransactionsId(filter, sorting, pagination): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllTransactions($sorting: TransactionSortingInput, $pagination: PaginationInput, $filter: TransactionFilterInput) {
            GetAllTransactions(sorting: $sorting, pagination: $pagination, filter: $filter) {
              _id
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          sorting,
          pagination,
          filter,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllTransactions'];
        }),
      );
  }

  getAllTransactionsCheckbox(filter, sorting, pagination): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllTransactions($sorting: TransactionSortingInput, $pagination: PaginationInput) {
            GetAllTransactions(${filter}, sorting: $sorting, pagination: $pagination) {
              _id
              candidate_id {
                _id
                candidate_unique_number
                first_name
                last_name
                civility
              }
              legal_entity {
                legal_entity_name
              }
              latest_status
              latest_response
              card_type
              psp_reference
              total_amount
              created_at {
                date
                time
              }
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          sorting,
          pagination,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllTransactions'];
        }),
      );
  }

  getOneTransaction(transactionId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneTransaction($transactionId: ID) {
            GetOneTransaction(_id: $transactionId) {
              _id
              created_at {
                date
                time
              }
              legal_entity {
                _id
                legal_entity_name
                account_holder_details {
                  bank_account_details {
                    iban
                  }
                }
              }
              candidate_id {
                _id
                last_name
                first_name
              }
              latest_status
              latest_response
              total_amount
              fee_amount
              net_amount
              card_type
              card_summary
              psp_reference
              timelines {
                timeline_status
                date
                time
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          transactionId,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneTransaction'];
        }),
      );
  }

  getAllBalanceReports(filter, sorting, pagination): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllBalanceReports($sorting: BalanceReportSortingInput, $pagination: PaginationInput, $filter: BalanceReportFilterInput) {
            GetAllBalanceReports(sorting: $sorting, pagination: $pagination, filter: $filter) {
              _id
              candidate_id {
                _id
                first_name
                last_name
                civility
                candidate_unique_number
              }
              legal_entity {
                legal_entity_name
              }
              currency
              amount
              transaction_status
              date_initiated {
                date
                time
              }
              created_at {
                date
                time
              }
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          sorting,
          pagination,
          filter,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllBalanceReports'];
        }),
      );
  }

  getAllPayoutBalanceReports(filter, sorting, pagination): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllBalanceReports($sorting: BalanceReportSortingInput, $pagination: PaginationInput, $filter: BalanceReportFilterInput) {
            GetAllBalanceReports(sorting: $sorting, pagination: $pagination, filter: $filter, is_payout_detail: true) {
              _id
              candidate_id {
                _id
                first_name
                last_name
                civility
                candidate_unique_number
              }
              legal_entity {
                legal_entity_name
              }
              currency
              amount
              transaction_status
              date_initiated {
                date
                time
              }
              created_at {
                date
                time
              }
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          sorting,
          pagination,
          filter,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllBalanceReports'];
        }),
      );
  }

  getOneBalanceReports(_id): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneBalanceReport($_id: ID) {
            GetOneBalanceReport(_id: $_id) {
              _id
              candidate_id {
                _id
                first_name
                last_name
                civility
              }
              legal_entity {
                legal_entity_name
                account_holder_details {
                  bank_account_details {
                    iban
                  }
                }
              }
              currency
              amount
              transaction_status
              date_initiated {
                date
                time
              }
              created_at {
                date
                time
              }
              description
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          _id,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetOneBalanceReport'];
        }),
      );
  }

  getAllBalanceReportsCheckbox(filter, sorting, pagination): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllBalanceReports($sorting: BalanceReportSortingInput, $pagination: PaginationInput, $filter: BalanceReportFilterInput) {
            GetAllBalanceReports(sorting: $sorting, pagination: $pagination, filter: $filter) {
              _id
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          sorting,
          pagination,
          filter,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllBalanceReports'];
        }),
      );
  }
}
