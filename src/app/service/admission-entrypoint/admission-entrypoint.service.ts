import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AdmissionEntrypointService {
  constructor(private httpClient: HttpClient, private apollo: Apollo) {}

  getAdmissionChannels(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/admission-channels.json');
  }
  getScholarPeriod(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/scholar-period.json');
  }
  getSchools(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/schools.json');
  }
  getCampus(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/campus-tab.json');
  }
  getSpeciality(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/speciality.json');
  }
  getLegalEntities(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/legal-entities.json');
  }
  getPaymentModes(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/payment-modes.json');
  }
  getScholarshipFees(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/scholarship-fees.json');
  }

  getAffectedTermsBillingForAskingPayment(amount, billing_id, payment_method?, is_from_asking_payment_sepa?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GetAffectedTermsBillingForAskingPayment($amount: Float, $billing_id: ID, $payment_method: EnumPaymentMethod, $is_from_asking_payment_sepa: Boolean) {
            GetAffectedTermsBilling(amount: $amount, billing_id: $billing_id, payment_method: $payment_method, is_from_asking_payment_sepa: $is_from_asking_payment_sepa) {
              _id
              term_id
              term_index
              term_payment {
                date
                time
              }
              term_payment_deferment {
                date
                time
              }
              is_term_pending
              is_term_paid
              term_amount
              term_pay_amount
              term_pay_date {
                date
                time
              }
              is_partial
              term_status
              term_amount_not_authorised
              term_amount_pending
              term_amount_chargeback
              payment_source
              term_source
              payment_type
              amount
              pay_amount
              status
              is_regulation
            }
          }
        `,
        variables: {
          amount,
          billing_id,
          payment_method: payment_method ? payment_method : null,
          is_from_asking_payment_sepa
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['GetAffectedTermsBilling']));
  }

  getPaymentMethodAdyen(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAvailPaymentMethods($filter: FilterPaymentMethodInput!) {
            GetAllAvailPaymentMethods(filter: $filter) {
              brands
              details {
                key
                type
              }
              name
              type
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAvailPaymentMethods']));
  }

  getAllCountryCodes(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCountryCodes {
            GetAllCountryCodes {
              _id
              country
              country_code
              currency
              currency_code
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCountryCodes']));
  }

  getAllTypeOfInformation(pagination, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllTypeOfInformation($pagination: PaginationInput, $filter: TypeOfInformationFilterInput) {
            GetAllTypeOfInformation(pagination: $pagination, filter: $filter) {
              _id
              type_of_information
              type_of_formation
              description
              count_document
              sigle
              admission_form_id {
                _id
                form_builder_name
              }
              document_builder_id {
                _id
                document_builder_name
              }
              form_builder_id {
                _id
                form_builder_name
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          filter,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTypeOfInformation']));
  }

  getAllTypeOfInformationDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllTypeOfInformation {
            GetAllTypeOfInformation {
              _id
              type_of_information
              type_of_formation
              description
              sigle
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTypeOfInformation']));
  }

  getAllTypeOfInformationByScholar(scholar_season_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllTypeOfInformation {
            GetAllTypeOfInformation {
              _id
              type_of_information
              type_of_formation
              description
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTypeOfInformation']));
  }

  createTypeOfInformation(type_of_information_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateTypeOfInformation($type_of_information_input: TypeOfInformationInput) {
            CreateTypeOfInformation(type_of_information_input: $type_of_information_input) {
              _id
            }
          }
        `,
        variables: {
          type_of_information_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateTypeOfInformation']));
  }

  updateTypeOfInformation(_id, type_of_information_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateTypeOfInformation($_id: ID!, $type_of_information_input: TypeOfInformationInput) {
            UpdateTypeOfInformation(_id: $_id, type_of_information_input: $type_of_information_input) {
              _id
            }
          }
        `,
        variables: {
          _id,
          type_of_information_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateTypeOfInformation']));
  }

  deleteTypeOfInformation(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteTypeOfInformation($_id: ID!) {
            DeleteTypeOfInformation(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteTypeOfInformation']));
  }

  addInducedHoursCoefficient(_id, induced_hours): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation UpdatePrograms($_id: [ID], $induced_hours: Float) {
          UpdatePrograms(program_ids: $_id, program_input: { induced_hours_coefficient: $induced_hours })
        }
      `,
      variables: {
        _id,
        induced_hours,
      },
    });
  }

  addPaidLeaveAllowance(_id, paid_leave_allowance_rate): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation UpdatePrograms($_id: [ID], $paid_leave_allowance_rate: Float) {
          UpdatePrograms(program_ids: $_id, program_input: { paid_leave_allowance_rate: $paid_leave_allowance_rate })
        }
      `,
      variables: {
        _id,
        paid_leave_allowance_rate,
      },
    });
  }
}
