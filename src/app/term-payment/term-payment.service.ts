import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TermPaymentService {
  constructor(private apollo: Apollo) {}

  getCandidateName(id: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetCandidateName($id: ID!) {
            GetOneCandidate(_id: $id) {
              _id
              civility
              first_name
              last_name
              payment
              school {
                school_logo
              }
              scholar_season {
                _id
              }
              campus {
                _id
              }
              level {
                _id
              }
              sector {
                _id
              }
              speciality {
                _id
              }
              user_id {
                _id
              }
              admission_member_id {
                _id
              }
            }
          }
        `,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetOneCandidate']));
  }

  getCandidateBill(id: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetCandidateBill($id: ID!) {
            GetOneBilling(_id: $id) {
              current_form_unique_string
              amount_billed
              amount_paid
              total_amount
              deposit
              deposit_status
              deposit_pay_amount
              student_type {
                type_of_formation
              }
              remaining_billed
              terms {
                _id
                is_term_paid
                term_pay_amount
                term_status
                term_amount
                term_amount_not_authorised
                term_amount_chargeback
                term_amount_pending
                term_payment {
                  date
                  time
                }
                term_payment_deferment {
                  date
                  time
                }
              }
              candidate_id {
                payment
              }
            }
          }
        `,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetOneBilling']));
  }

  sendPayN2(filter, billingIds, user_type_ids) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendPAYN2toManyBillings($user_type_ids: [ID], $billingIds: [ID], $lang: String) {
            SendPAYN2toManyBillings(user_type_ids: $user_type_ids, billing_ids: $billingIds, lang: $lang, ${filter})
          }
        `,
        variables: {
          billingIds,
          user_type_ids,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['SendPAYN2toManyBillings']));
  }

  sendPayN9(filter, billingIds, user_type_ids) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendPAYN9toManyBillings($user_type_ids: [ID], $billingIds: [ID], $lang: String) {
            SendPAYN9toManyBillings(user_type_ids: $user_type_ids, billing_ids: $billingIds, lang: $lang, ${filter})
          }
        `,
        variables: {
          billingIds,
          user_type_ids,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['SendPAYN9toManyBillings']));
  }

  getCandidatesParentData(candidateId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query getCandidatesParentData($candidateId: ID!) {
            GetOneCandidate(_id: $candidateId) {
              _id
              civility
              first_name
              last_name
              cost
              intake_channel {
                _id
                program
              }
              school {
                school_logo
              }
              selected_payment_plan {
                total_amount
              }
              payment_supports {
                _id
                relation
                account_holder_name
                bic
                iban
                financial_support_status
                cost
                family_name
                name
                sex
                civility
                tele_phone
                email
                upload_document_rib
                parent_address {
                  address
                  postal_code
                  city
                  region
                  department
                  country
                }
              }
              parents {
                _id
                account_holder_name
                bic
                iban
                financial_support_status
                relation
                family_name
                name
                sex
                civility
                tele_phone
                email
                is_same_address
                job
                professional_email
                profession
                is_parent_also_payment_support
                parent_address {
                  address
                  postal_code
                  country
                  city
                  region
                  department
                  is_main_address
                }
              }
            }
          }
        `,
        variables: { candidateId },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneCandidate']));
  }

  getSelectPaymentMethodAvailable(id: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetSelectPaymentMethodAvailable($id: ID!) {
            GetOneCandidate(_id: $id) {
              _id
              civility
              first_name
              last_name
              candidate_unique_number
              school {
                school_logo
              }
              registration_profile {
                select_payment_method_available
              }
            }
          }
        `,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetOneCandidate']));
  }

  CreatePaymentAdyen(payment_input, billingId, termPayment, affected_terms, billing_input, user_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreatePayment(
            $is_use_3ds_config: Boolean
            $payment_input: CreatePaymentInput!
            $lang: String
            $billingId: ID
            $termPayment: Boolean
            $affected_terms: [AffectedTermBillingInput]
            $billing_input: BillingInput
            $user_id: ID
          ) {
            CreatePayment(
              is_use_3ds_config: $is_use_3ds_config
              payment_input: $payment_input
              lang: $lang
              billing_id: $billingId
              term_payment: $termPayment
              affected_terms: $affected_terms
              billing_input: $billing_input
              user_id: $user_id
            ) {
              psp_reference
              result_code
              amount {
                currency
                value
              }
              merchant_reference
              refusal_reason
              refusal_reason_code
              action {
                payment_method_type
                type
                # Below are fields for Redirect DS 2
                payment_data
                authorisation_token
                sub_type
                token
                # Above are fields for Redirect DS 2
                # Below are fields for Redirect DS 1
                url
                method
                data {
                  md
                  pa_req
                  term_url
                }
                # Above are fields for Redirect DS 1
              }
            }
          }
        `,
        variables: {
          is_use_3ds_config: true,
          payment_input,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
          billingId,
          termPayment,
          affected_terms,
          billing_input,
          user_id: user_id ? user_id : null
        },
      })
      .pipe(map((resp) => resp.data['CreatePayment']));
  }

  sendPaymentDetailAdyen(candidate_id, three_ds_result, is3DS2, billingId, termPayment): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation sendPaymentDetailAdyen(
            $candidate_id: ID!
            $three_ds_result: String!
            $is_3ds2: Boolean!
            $lang: String
            $billingId: ID
            $termPayment: Boolean
          ) {
            SendPaymentDetail(
              candidate_id: $candidate_id
              three_ds_result: $three_ds_result
              is_3ds2: $is_3ds2
              lang: $lang
              billing_id: $billingId
              term_payment: $termPayment
            ) {
              psp_reference
              result_code
              amount {
                currency
                value
              }
              merchant_reference
              refusal_reason
              refusal_reason_code
              action {
                payment_data
                payment_method_type
                authorisation_token
                sub_type
                token
                type
              }
            }
          }
        `,
        variables: {
          candidate_id,
          three_ds_result,
          is_3ds2: is3DS2,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
          billingId,
          termPayment,
        },
      })
      .pipe(map((resp) => resp.data['SendPaymentDetail']));
  }

  SaveProofOfPaymentTerm(billingId, transferPayload, paymentMethod, amount, billing_input, affected_terms) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SaveProofOfPaymentTerm(
            $billing_id: ID
            $transfer_check_payment_input: PaymentTransferCheckDataInput
            $method_of_payment: MethodOfPayment
            $amount: Float
            $lang: String
            $billing_input: BillingInput
            $affected_terms: [AffectedTermBillingInput]
          ) {
            SaveProofOfPaymentTerm(
              billing_id: $billing_id
              transfer_check_payment_input: $transfer_check_payment_input
              method_of_payment: $method_of_payment
              amount: $amount
              lang: $lang
              billing_input: $billing_input
              affected_terms: $affected_terms
            ) {
              _id
            }
          }
        `,
        variables: {
          billing_id: billingId,
          transfer_check_payment_input: transferPayload,
          method_of_payment: paymentMethod,
          amount,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
          billing_input,
          affected_terms,
        },
      })
      .pipe(map((resp) => resp.data['SaveProofOfPaymentTerm']));
  }

  SendPayN3(candidateId) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendPayN3($candidateId: ID, $lang: String) {
            Send_Pay_N3(candidate_id: $candidateId, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          candidateId,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['Send_Pay_N3']));
  }

  ValidateCandidateFinancialSupport(payload, sendPayN8) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ValidateCandidateFinancialSupport($payload: ValidateFinancialSupportInput, $sendPayN8: Boolean) {
            ValidateCandidateFinancialSupport(financial_support_input: $payload, send_PAY_N8: $sendPayN8) {
              _id
            }
          }
        `,
        variables: {
          payload,
          sendPayN8,
        },
      })
      .pipe(map((resp) => resp.data['ValidateCandidateFinancialSupport']));
  }

  getCandidateDataForSpecialForm(candidateId): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query getCandidateDataForSpecialForm($candidateId: ID!) {
            GetOneCandidate(_id: $candidateId) {
              _id
              modality_step_special_form_status
              region
              civility
              readmission_status
              first_name
              last_name
              telephone
              department
              payment_method
              is_admitted
              email
              finance
              candidate_admission_status
              nationality
              last_name_used
              first_name_used
              address
              additional_address
              country
              city
              post_code
              school_contract_pdf_link
              date_of_birth
              country_of_birth
              nationality
              nationality_second
              post_code_of_birth
              city_of_birth
              autorization_account
              phone_number_indicative
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
              photo
              announcement_call
              announcement_email {
                sent_date
                sent_time
              }
              registration_profile_type
              intake_channel {
                _id
                program
                scholar_season_id {
                  _id
                  scholar_season
                }
                admission_document {
                  s3_file_name
                  document_name
                }
              }
              registration_profile {
                _id
                name
                is_down_payment
                other_amount
                discount_on_full_rate
                type_of_formation {
                  _id
                  type_of_information
                }
                additional_cost_ids {
                  additional_cost
                  amount
                }
                description
                payment_modes {
                  _id
                  name
                  description
                  additional_cost
                  currency
                  term
                  select_payment_method_available
                  payment_date {
                    date
                    amount
                    percentage
                  }
                }
              }
              engagement_level
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
              school {
                _id
                school_logo
                short_name
                long_name
                campuses {
                  _id
                  name
                  bank {
                    name
                    city
                    address
                  }
                  levels {
                    _id
                    name
                  }
                }
              }
              connection
              personal_information
              signature
              method_of_payment
              payment
              admission_member_id {
                _id
                first_name
                last_name
                civility
                profile_picture
                email
                position
                portable_phone
              }
              fixed_phone
              is_whatsapp
              participate_in_open_house_day
              participate_in_job_meeting
              count_document
              user_id {
                _id
              }
              payment_splits {
                payer_name
                percentage
              }
              selected_payment_plan {
                name
                times
                additional_expense
                down_payment
                total_amount
                payment_date {
                  date
                  amount
                }
              }
              payment_supports {
                _id
                upload_document_rib
                financial_support_status
                family_name
                relation
                name
                sex
                civility
                tele_phone
                email
                autorization_account
                account_holder_name
                cost
                iban
                bic
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
              program_desired
              trial_date
              program_confirmed
              candidate_sign_date {
                date
                time
              }
              account_holder_name
              iban
              bic
              cost
            }
          }
        `,
        variables: { candidateId },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidate']));
  }

  UpdateCandidateFromSpecialForm(candidateId, candidateInput) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidateFromSpecialForm($candidateId: ID!, $candidateInput: CandidateInput!, $lang: String) {
            UpdateCandidate(_id: $candidateId, candidate_input: $candidateInput, lang: $lang) {
              _id
              payment_supports {
                _id
                account_holder_name
                iban
                bic
                cost
                financial_support_status
              }
            }
          }
        `,
        variables: {
          candidateId,
          candidateInput,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['UpdateCandidate']));
  }

  ValidateManyCandidateFinancialSupport(candidateId, payload) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ValidateManyCandidateFinancialSupport($candidateId: ID, $payload: [ValidateFinancialSupportInput]) {
            ValidateManyCandidateFinancialSupport(candidate_id: $candidateId, payment_supports: $payload)
          }
        `,
        variables: {
          candidateId,
          payload,
        },
      })
      .pipe(map((resp) => resp.data['ValidateCandidateFinancialSupport']));
  }

  GetLegalEntityByCandidateForTermPayment(id: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetLegalEntityByCandidateForTermPayment($id: ID!) {
            GetLegalEntityByCandidate(candidate_id: $id) {
              _id
              legal_entity_name
              account_holder_details {
                bank_account_details {
                  iban
                }
              }
              bic
            }
          }
        `,
        variables: { id },
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetLegalEntityByCandidate']));
  }
  UpdateBillingCalculation(billing_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateBilling($billing_input: BillingInput, $_id: ID) {
            UpdateBilling(billing_input: $billing_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          billing_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateBilling']));
  }
}
