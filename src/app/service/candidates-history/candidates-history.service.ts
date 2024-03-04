import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cacheable } from 'ngx-cacheable';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class CandidatesHistoryService {
  constructor(private httpClient: HttpClient, private apollo: Apollo, private translate: TranslateService) {}

  getAllCandidatesHistory(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateHistories($pagination: PaginationInput, $sort: CandidateHistorySortInput) {
            GetAllCandidateHistories(pagination: $pagination, sorting: $sort, ${filter}) {
                  _id
                  date
                  time
                  is_admitted
                  first_name
                  last_name
                  student_type
                  nationality
                  photo
                  intake_channel
                  engagement_level
                  admission_member_id {
                    _id
                    first_name
                    last_name
                    civility
                    email
                    position
                  }
                }
              }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }
  getCandidatesHistory(pagination, sortValue, filter_): Observable<any[]> {
    /*let filterQuery = '';
      let filterKey = '';
      let filterValue = '';
      if (filter_) {
        filterQuery = filter_.trim().toLowerCase().split(':');
        filterValue = filterQuery[1];
        filterKey = filterQuery[0];
        if (filterKey === 'full_name')
          filterKey = 'last_name';
      }
      console.log(filterValue, filterKey);*/
    return this.httpClient.get<any[]>('assets/data/candidates-history.json');
  }
  getAllTransactionHistoriesOfCandidate(candidateId: string, intake_channel?: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllDataForStudenBalanceTable($filter: TransactionHistoryFilterInput) {
            GetAllTransactionHistories(filter: $filter, sorting: { created_at: asc }) {
              _id
              candidate_id {
                _id
                first_name
                last_name
                civility
                intake_channel {
                  _id
                  scholar_season_id {
                    scholar_season
                  }
                  program
                }
                payment
              }
              payment_date
              total_debit
              total_credit
              transaction_date #date column
              transaction_time
              operation_name #operation name column
              from #payer column
              flux #flux column
              nature #nature column
              debit #debit column
              credit #credit column
              balance #solde column
              term_id #FLAG
              term_index
              is_cancelled
              is_chargeback
              is_manual_action
              billing_id {
                _id
                terms {
                  _id
                  term_status #term status column
                  term_pay_date {
                    date #payment date column for term
                    time
                  }
                  term_amount
                  term_pay_amount
                  term_amount_pending
                  term_amount_chargeback
                  term_amount_not_authorised
                  term_source
                }
                deposit_status #term status for deposit
                deposit_pay_date {
                  date #payment date column for deposit
                  time
                }
                is_financial_support
                financial_support_info {
                  _id
                  civility
                  email
                  family_name
                  name
                  relation
                }
              }
              account_document #accounting document column
              balance_date {
                date #balance date column
                time
              }
              export_status #FLAG
              operation_line_visual_status #FLAG
              od_type
              legal_entity_id {
                _id
                legal_entity_name
              }
              initial_legal_entity_id {
                _id
                legal_entity_name
              }
              destination_legal_entity_id {
                _id
                legal_entity_name
              }
              reference
              note
              transaction_id {
                _id
                legal_entity {
                  _id
                  legal_entity_name
                }
                psp_reference
              }
              finance_organization_id {
                _id
                company_branch_id {
                  _id
                  company_name
                }
                organization_id {
                  _id
                  name
                }
                terms {
                  _id
                  term_status
                  term_amount
                  term_pay_date {
                    date #payment date column for term
                    time
                  }
                  term_pay_amount
                }
              }
              term_index_display
            }
          }
        `,
        variables: {
          filter: {
            candidate_id: candidateId,
            intake_channel: intake_channel,
          },
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTransactionHistories']));
  }

  getAllMasterTransactionHistories(candidateId: string, intake_channel?: string) {
    return this.apollo
      .query({
        query: gql`
          query GetAllMasterTableTransaction($filter: MasterTransactionFilterInput) {
            GetAllMasterTableTransaction(filter: $filter, sorting: { created_at: asc }) {
              _id
              legal_entity_id {
                legal_entity_name
              }
              method_of_payment
              date_action {
                date
                time
              }
              payment_date
              payment_time
              operation_name
              candidate_id {
                _id
                last_name
                first_name
                civility
                candidate_unique_number
              }
              initial_legal_entity_id {
                _id
                legal_entity_name
              }
              destination_legal_entity_id {
                _id
                legal_entity_name
              }
              billing_id {
                _id
                terms {
                  _id
                  is_regulation
                  term_status
                  term_pay_date {
                    date #payment date column for term
                    time
                  }
                  term_amount
                  term_pay_amount
                  term_amount_pending
                  term_amount_chargeback
                  term_amount_not_authorised
                  term_source
                }
                deposit_status #term status for deposit
                deposit_pay_date {
                  date #payment date column for deposit
                  time
                }
                is_financial_support
                financial_support_info {
                  _id
                  civility
                  email
                  family_name
                  name
                  relation
                }
              }
              finance_organization_id {
                _id
                organization_id {
                  _id
                  name
                }
                company_branch_id {
                  _id
                  company_name
                }
                terms {
                  _id
                  term_status
                  term_amount
                  term_pay_date {
                    date #payment date column for term
                    time
                  }
                  term_pay_amount
                }
              }
              flux
              nature
              debit
              credit
              balance
              note
              reference
              term_id #FLAG
              term_index
              is_manual_action
              export_status
              date_action {
                date
                time
              }
              accounting_document
              balance_date
              balance_time
              total_credit
              total_debit
              status_line_dp_term
              reference
              note
              od_type
              transaction_id {
                _id
                legal_entity {
                  _id
                  legal_entity_name
                }
                psp_reference
              }
              transaction_type
              manual_billings {
                billing_id {
                  _id
                  is_financial_support
                  financial_support_info {
                    _id
                    civility
                    email
                    family_name
                    name
                    relation
                  }
                  candidate_id {
                    _id
                    last_name
                    first_name
                    civility
                  }
                }
                finance_organization_id {
                  _id
                  organization_id {
                    _id
                    name
                  }
                  company_branch_id {
                    _id
                    company_name
                  }
                }
                amount
              }
              updated_by{
                first_name
                last_name
                civility
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter: {
            candidate_id: candidateId,
            intake_channel: intake_channel,
            table_type: 'student_balance',
          },
        },
      })
      .pipe(map((resp) => resp.data['GetAllMasterTableTransaction']));
  }

  getInternshipFees(pagination, sortValue, filter_): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/internship-fees.json');
  }
  GetAllFinanceOrganization(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllFinanceOrganization($filter: FinanceOrganizationFilterInput) {
            GetAllFinanceOrganization(filter: $filter) {
              _id
              organization_id {
                _id
                name
                organization_type
                organization_id
              }
              company_branch_id {
                _id
                company_name
              }
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllFinanceOrganization']));
  }

  getAllBilling(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllBillingForFinancialStatus($filter: BillingFilterInput) {
            GetAllBilling(filter: $filter) {
              _id
              candidate_id {
                _id
                civility
                first_name
                last_name
                candidate_admission_status
                payment
                intake_channel {
                  _id
                  scholar_season_id {
                    scholar_season
                  }
                  program
                }
                legal_representative{
                  unique_id
                }
              }
              student_type {
                type_of_information
                type_of_formation
              }
              deposit_pay_date {
                date
                time
              }
              dp_histories {
                deposit_pay_amount
                deposit_status
                is_deposit_completed
                deposit
                date_inserted {
                  date
                  time
                }
              }
              total_amount
              amount_billed
              amount_paid
              remaining_billed
              amount_late
              accumulated_late
              deposit
              deposit_pay_amount
              deposit_status
              is_deposit_completed
              overdue
              overdue_not_paid
              terms {
                _id
                is_regulation
                term_pay_date {
                  date
                  time
                }
                is_locked
                is_term_paid
                term_pay_amount
                term_payment {
                  date
                  time
                }
                term_payment_deferment {
                  date
                  time
                }
                is_partial
                term_amount
                term_status
                term_amount_not_authorised
                term_amount_pending
                term_amount_chargeback
                is_regulation
              }
              is_financial_support
              financial_support_info {
                _id
                civility
                email
                family_name
                name
                relation
              }
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllBilling']));
  }
}
