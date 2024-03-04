import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cacheable } from 'ngx-cacheable';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class AdmissionService {
  public resetData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // get current step
  public indexStep: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  // status per step mode
  public statusStepCampus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusStepOne: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusStepTwo: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusStepThree: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusStepFour: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusStepFive: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // data edit mode
  public statusEditCampusMode: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusEditMode: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusEditModeTwo: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusEditModeThree: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusEditModeFour: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusEditModeFive: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public dataCandidate: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public paymentForm: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  setResetStatus(value: boolean) {
    this.resetData.next(value);
  }

  setPaymentForm(value: any) {
    this.paymentForm.next(value);
  }

  setIndexStep(value: number) {
    this.indexStep.next(value);
  }

  setStatusStepCampus(value: boolean) {
    this.statusStepCampus.next(value);
  }

  setStatusStepOne(value: boolean) {
    this.statusStepOne.next(value);
  }

  setStatusStepTwo(value: boolean) {
    this.statusStepTwo.next(value);
  }

  setStatusStepThree(value: boolean) {
    this.statusStepThree.next(value);
  }

  setStatusStepFour(value: boolean) {
    this.statusStepFour.next(value);
  }

  setStatusStepFive(value: boolean) {
    this.statusStepFive.next(value);
  }

  setStatusEditMode(value: boolean) {
    this.statusEditMode.next(value);
  }

  setStatusEditModeTwo(value: boolean) {
    this.statusEditModeTwo.next(value);
  }

  setStatusEditModeThree(value: boolean) {
    this.statusEditModeThree.next(value);
  }

  setStatusEditModeFour(value: boolean) {
    this.statusEditModeFour.next(value);
  }

  setStatusEditModeFive(value: boolean) {
    this.statusEditModeFive.next(value);
  }

  setStatusEditCampusMode(value: boolean) {
    this.statusEditCampusMode.next(value);
  }

  setDataCandidate(value: any) {
    this.dataCandidate.next(value);
  }

  constructor(public httpClient: HttpClient, private apollo: Apollo, private translate: TranslateService) {}

  getPromoForRegistration(school, campus, level, region, gender): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetPromoAllExternalsForDisplay($school: String!, $campus: String!, $level: String!, $region: String!, $gender: EnumSex) {
            GetPromoAllExternalsForDisplay(school: $school, campus: $campus, level: $level, region: $region, gender: $gender) {
              _id
              ref_id
              module
              title
              sub_title
              is_published
              story
              school
              campus
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
        fetchPolicy: 'network-only',
        variables: {
          gender,
          region,
          school,
          campus,
          level,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetPromoAllExternalsForDisplay']));
  }

  GetAllDownPayment(scholar_season_id, school_id, campus, level): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllDownPayment($school_id: ID, $scholar_season_id: ID, $campus: ID, $level: ID) {
            GetAllDownPayment(school_id: $school_id, scholar_season_id: $scholar_season_id, campus: $campus, level: $level) {
              amount
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          scholar_season_id,
          school_id,
          campus,
          level,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllDownPayment']));
  }

  GetOneDownPayment(scholar_season_id, school_id, campus, level, sector, speciality): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneDownPayment($school_id: ID, $scholar_season_id: ID, $campus: ID, $level: ID, $sector: ID, $speciality: ID) {
            GetOneDownPayment(
              school_id: $school_id
              scholar_season_id: $scholar_season_id
              campus: $campus
              level: $level
              sector: $sector
              speciality: $speciality
            ) {
              amount
              internal
              external
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          scholar_season_id,
          school_id,
          campus,
          level,
          sector,
          speciality,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneDownPayment']));
  }

  GetAllFullRate(scholar_season_id, school_id, campus, level): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllFullRate($school_id: ID, $scholar_season_id: ID, $campus: ID, $level: ID) {
            GetAllFullRate(school_id: $school_id, scholar_season_id: $scholar_season_id, campus: $campus, level: $level) {
              _id
              amount_external
              amount_internal
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          scholar_season_id,
          school_id,
          campus,
          level,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllFullRate']));
  }

  GetOneFullRate(scholar_season_id, school_id, campus, level, sector, speciality): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneFullRate($school_id: ID, $scholar_season_id: ID, $campus: ID, $level: ID, $sector: ID, $speciality: ID) {
            GetOneFullRate(
              school_id: $school_id
              scholar_season_id: $scholar_season_id
              campus: $campus
              level: $level
              sector: $sector
              speciality: $speciality
            ) {
              _id
              amount_external
              amount_internal
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          scholar_season_id,
          school_id,
          campus,
          level,
          sector,
          speciality,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneFullRate']));
  }

  GetOneFullRateFC(scholar_season_id, school_id, campus, level, sector, speciality?): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneFullRate($school_id: ID, $scholar_season_id: ID, $campus: ID, $level: ID, $sector: ID, $speciality: ID) {
            GetOneFullRate(
              school_id: $school_id
              scholar_season_id: $scholar_season_id
              campus: $campus
              level: $level
              sector: $sector
              speciality: $speciality
            ) {
              _id
              amount_external
              amount_internal
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          scholar_season_id,
          school_id,
          campus,
          level,
          sector,
          speciality: speciality ? speciality : null,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneFullRate']));
  }

  getOneCandidateDetail(candidate_id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetOneCandidate {
          GetOneCandidate(_id: "${candidate_id}") {
            _id
            region
            civility
            readmission_status
            first_name
            last_name
            telephone
            account_holder_name
            iban
            bic
            cost
            last_name_used
            first_name_used
            address
            school_contract_pdf_link
            additional_address
            country
            city
            post_code
            date_of_birth
            country_of_birth
            candidate_admission_status
            finance
            nationality
            nationality_second
            post_code_of_birth
            city_of_birth
            payment_method
            is_admitted
            email
            photo
            phone_number_indicative
            place_of_birth
            nationality
            department
            school_mail
            admission_process_id {
              _id
            }
            student_id {
              user_id {
                entities {
                  type {
                    _id
                  }
                }
              }
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
            registration_profile_type
            photo
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
              additional_cost_ids {
                additional_cost
                amount
              }
              type_of_formation {
                _id
                type_of_information
              }
              description
              payment_modes {
                _id
                name
                description
                additional_cost
                currency
                term
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
            city
            address
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
            payment_supports {
              iban
              bic
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
            program_desired
            trial_date
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
              upload_document_rib
              family_name
              relation
              name
              sex
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
            college {
              name
              city
              postal_code
              country
            }
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidate']));
  }

  verifyEmailUnique(email, user_id?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation verifyEmailUnique($email: String, $user_id: ID) {
            CheckEmailActive(email: $email, user_id: $user_id)
          }
        `,
        variables: {
          email,
          user_id: user_id ? user_id : null,
        },
      })
      .pipe(map((resp) => resp.data['CheckEmailActive']));
  }

  CreatePaymentAdyen(payment_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreatePayment($is_use_3ds_config: Boolean, $payment_input: CreatePaymentInput!, $lang: String) {
            CreatePayment(is_use_3ds_config: $is_use_3ds_config, payment_input: $payment_input, lang: $lang) {
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
        },
      })
      .pipe(map((resp) => resp.data['CreatePayment']));
  }

  sendPaymentDetailAdyen(candidate_id, three_ds_result, is3DS2): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation sendPaymentDetailAdyen($candidate_id: ID!, $three_ds_result: String!, $is_3ds2: Boolean!, $lang: String) {
            SendPaymentDetail(candidate_id: $candidate_id, three_ds_result: $three_ds_result, is_3ds2: $is_3ds2, lang: $lang) {
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
        },
      })
      .pipe(map((resp) => resp.data['SendPaymentDetail']));
  }

  getCandidateAdmission(candidate_id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetOneCandidate {
          GetOneCandidate(_id: "${candidate_id}") {
            _id
            is_adult
            is_emancipated_minor
            admission_process_id {
              _id
            }
            student_id {
              user_id {
                entities {
                  type {
                    _id
                  }
                }
              }
            }
            emergency_contacts{
              family_name
              name
              relation
              email
              tele_phone
              fixed_phone
            }
            emancipated_document_proof_id {
              _id
              document_status
              s3_file_name
              document_name
            }
            legal_representative {
              unique_id
              first_name
              last_name
              email
              phone_number
              parental_link
              address
              postal_code
              city
            }
            region
            civility
            readmission_status
            first_name
            last_name
            telephone
            phone_number_indicative
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
            modality_status
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
              dp_additional_cost_amount
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
              family_name
              relation
              name
              sex
              civility
              tele_phone
              phone_number_indicative
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
            billing_id {
              _id
            }
            cost
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidate']));
  }

  getOneCandidateAfterAmendement(candidate_id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetOneCandidateAfterAmendement {
          GetOneCandidate(_id: "${candidate_id}") {
            _id
            current_school_contract_amendment_form {
              _id
              school_amendment_form_link
              school_amendment_pdf_name
              form_status
              contract_signed_at {
                date
                time
              }
            }
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidate']));
  }

  getCandidateAdmissionDiploma(candidate_id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetOneCandidate {
          GetOneCandidate(_id: "${candidate_id}") {
            _id
            civility
            first_name
            last_name
            email
            finance
            readmission_status
            candidate_admission_status
            campus {
              _id
              name
              address
            }
            photo
            registration_profile_type
            engagement_level
            level {
              _id
              name
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
            }
            diploma_status
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidate']));
  }
  getCandidateFinalValidation(candidate_id): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetCandidateFinalValidation {
          GetOneCandidate(_id: "${candidate_id}") {
            _id
            civility
            first_name
            last_name
            telephone
            readmission_status
            payment_method
            is_admitted
            email
            finance
            candidate_admission_status
            nationality
            last_name_used
            first_name_used
            address
            country
            city
            post_code
            date_of_birth
            country_of_birth
            nationality
            post_code_of_birth
            city_of_birth
            autorization_account
            photo
            connection
            personal_information
            signature
            method_of_payment
            payment
            fixed_phone
            user_id {
              _id
            }
            selected_payment_plan {
              name
              times
              additional_expense
              down_payment
              total_amount
            }
            payment_supports {
              upload_document_rib
              family_name
              relation
              name
              sex
              civility
              tele_phone
              email
              autorization_account
              iban
              bic
            }
            registration_profile {
              discount_on_full_rate
            }
            program_confirmed
            iban
            bic
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneCandidate']));
  }

  getCandidateInformation(candidate_id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetOneCandidate {
          GetOneCandidate(_id: "${candidate_id}") {
            _id
            is_adult
            is_emancipated_minor
            emergency_contacts{
              family_name
              name
              relation
              email
              tele_phone
              fixed_phone
            }
            emancipated_document_proof_id {
              _id
              document_status
              s3_file_name
              document_name
            }
            admission_member_id {
              _id
              first_name
              last_name
              civility
            }
            legal_representative {
              unique_id
              first_name
              last_name
              email
              phone_number
              parental_link
              address
              postal_code
              city
            }
            region
            civility
            first_name
            last_name
            readmission_status
            telephone
            department
            email
            nationality
            last_name_used
            first_name_used
            address
            additional_address
            country
            city
            post_code
            date_of_birth
            country_of_birth
            nationality
            nationality_second
            post_code_of_birth
            city_of_birth
            photo
            personal_information
            fixed_phone
            phone_number_indicative
            school {
              _id
              short_name
            }
            campus {
              _id
              name
            }
            user_id {
              _id
            }
            college {
              name
              city
              postal_code
              country
            }
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidate']));
  }

  getCandidateDownPayment(candidate_id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetOneCandidate {
          GetOneCandidate(_id: "${candidate_id}") {
            _id
            legal_representative {
              unique_id
              first_name
              last_name
              email
              phone_number
              parental_link
              address
              postal_code
              city
            }
            candidate_unique_number
            readmission_status
            region
            civility
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
              dp_additional_cost_amount
              discount_on_full_rate
              select_payment_method_available
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
            billing_id {
              deposit
              deposit_pay_amount
              is_deposit_completed
              remaining_billed
              amount_paid
            }
            program_desired
            trial_date
            autorization_account
            account_holder_name
            iban
            bic
            cost
            program_confirmed
            payment_transfer_check_data {
              wording_used_in_payment
              first_name_of_payer
              familiy_name_of_payer
              s3_document_name
            }
            is_candidate_transfer
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidate']));
  }

  getCandidatePayment(candidate_id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetCandidatePayment {
          GetOneCandidate(_id: "${candidate_id}") {
            _id
            region
            civility
            readmission_status
            first_name
            last_name
            telephone
            payment_method
            is_admitted
            email
            finance
            school_contract_pdf_link
            candidate_admission_status
            nationality
            last_name_used
            first_name_used
            address
            additional_address
            country
            city
            post_code
            date_of_birth
            country_of_birth
            nationality
            nationality_second
            post_code_of_birth
            city_of_birth
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
            payment_supports {
              upload_document_rib
              family_name
              relation
              name
              sex
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
            program_desired
            trial_date
            payment_transfer_check_data {
              wording_used_in_payment
              first_name_of_payer
              familiy_name_of_payer
              s3_document_name
            }
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidate']));
  }

  UpdateCandidate(candidates_id, candidate_input, is_save_identity_student?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidate($candidate_input: CandidateInput!, $lang: String, $is_save_identity_student: Boolean) {
            UpdateCandidate(_id: "${candidates_id}", candidate_input: $candidate_input, lang: $lang, is_save_identity_student: $is_save_identity_student) {
              _id
              region
              civility
              first_name
              last_name
              telephone
              finance
              payment_method
              is_admitted
              last_name_used
              first_name_used
              address
              additional_address
              country
              candidate_admission_status
              city
              post_code
              date_of_birth
              country_of_birth
              nationality_second
              post_code_of_birth
              city_of_birth
              email
              nationality
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
                other_amount
                additional_cost_ids {
                  additional_cost
                  amount
                }
                is_down_payment
                discount_on_full_rate
                type_of_formation {
                  _id
                  type_of_information
                }
                description
                payment_modes {
                  _id
                  name
                  description
                  additional_cost
                  currency
                  term
                  payment_date {
                    date
                    amount
                    percentage
                  }
                }
              }
              registration_profile_type
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
                  bank {
                    name
                    city
                    address
                  }
                  name
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
                upload_document_rib
                family_name
                relation
                name
                sex
                civility
                tele_phone
                email
                iban
              bic
              autorization_account
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
              iban
              bic
              autorization_account
            }
          }
        `,
        variables: {
          candidate_input,
          is_save_identity_student,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['UpdateCandidate']));
  }

  UpdateCandidateStatus(candidates_id, candidate_input, is_prevent_resend_notif, is_save_identity_student?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidateStatus($candidate_input: CandidateInput!, $lang: String, $is_prevent_resend_notif: Boolean, $is_save_identity_student: Boolean) {
            UpdateCandidate(_id: "${candidates_id}", candidate_input: $candidate_input, lang: $lang, is_prevent_resend_notif: $is_prevent_resend_notif, is_save_identity_student: $is_save_identity_student) {
              _id
              region
              civility
              first_name
              last_name
              telephone
              finance
              payment_method
              is_admitted
              last_name_used
              first_name_used
              address
              additional_address
              country
              candidate_admission_status
              city
              post_code
              date_of_birth
              country_of_birth
              nationality_second
              post_code_of_birth
              city_of_birth
              email
              nationality
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
                other_amount
                additional_cost_ids {
                  additional_cost
                  amount
                }
                is_down_payment
                discount_on_full_rate
                type_of_formation {
                  _id
                  type_of_information
                }
                description
                payment_modes {
                  _id
                  name
                  description
                  additional_cost
                  currency
                  term
                  payment_date {
                    date
                    amount
                    percentage
                  }
                }
              }
              registration_profile_type
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
                  bank {
                    name
                    city
                    address
                  }
                  name
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
                upload_document_rib
                family_name
                relation
                name
                sex
                civility
                tele_phone
                email
                iban
              bic
              autorization_account
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
              iban
              bic
              autorization_account
            }
          }
        `,
        variables: {
          candidate_input,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
          is_prevent_resend_notif,
          is_save_identity_student
        },
      })
      .pipe(map((resp) => resp.data['UpdateCandidate']));
  }

  TransferStudentResignedAfterRegisteredToAdmitted(candidates_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation TransferStudentResignedAfterRegisteredToAdmitted {
            TransferStudentResignedAfterRegisteredToAdmitted(candidate_id: "${candidates_id}") {
              _id
            }
          }
        `,
      })
      .pipe(map((resp) => resp.data['TransferStudentResignedAfterRegisteredToAdmitted']));
  }

  UpdateCandidateForm(candidates_id, candidate_input, isMinorStudent?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidate($candidate_input: CandidateInput!, $lang: String $isMinorStudent: Boolean) {
            UpdateCandidate(_id: "${candidates_id}", candidate_input: $candidate_input, lang: $lang, is_from_admission_form: true, is_minor_student: $isMinorStudent) {
              _id
              legal_representative {
                unique_id
                first_name
                last_name
                email
                phone_number
                parental_link
                address
                postal_code
                city
              }
              is_adult
              is_emancipated_minor
              emancipated_document_proof_id {
                document_status
              }
              region
              civility
              first_name
              last_name
              telephone
              finance
              payment_method
              is_admitted
              last_name_used
              first_name_used
              address
              additional_address
              country
              candidate_admission_status
              city
              post_code
              date_of_birth
              country_of_birth
              nationality_second
              post_code_of_birth
              city_of_birth
              email
              nationality
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
                other_amount
                dp_additional_cost_amount
                additional_cost_ids {
                  additional_cost
                  amount
                }
                is_down_payment
                discount_on_full_rate
                type_of_formation {
                  _id
                  type_of_information
                }
                description
                payment_modes {
                  _id
                  name
                  description
                  additional_cost
                  currency
                  term
                  payment_date {
                    date
                    amount
                    percentage
                  }
                }
              }
              registration_profile_type
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
                  bank {
                    name
                    city
                    address
                  }
                  name
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
                cost
                upload_document_rib
                family_name
                relation
                name
                sex
                civility
                tele_phone
                email
                account_holder_name
                iban
                bic
                autorization_account
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
              account_holder_name
              cost
              iban
              bic
              autorization_account
            }
          }
        `,
        variables: {
          candidate_input,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
          isMinorStudent: isMinorStudent
        },
      })
      .pipe(map((resp) => resp.data['UpdateCandidate']));
  }

  UpdateModalityForm(candidates_id, candidate_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidate($candidate_input: CandidateInput!, $lang: String) {
            UpdateCandidate(_id: "${candidates_id}", candidate_input: $candidate_input, lang: $lang) {
              _id
              region
              civility
              first_name
              last_name
              telephone
              finance
              payment_method
              is_admitted
              last_name_used
              first_name_used
              address
              additional_address
              country
              candidate_admission_status
              city
              post_code
              date_of_birth
              country_of_birth
              nationality_second
              post_code_of_birth
              city_of_birth
              email
              nationality
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
                other_amount
                dp_additional_cost_amount
                additional_cost_ids {
                  additional_cost
                  amount
                }
                is_down_payment
                discount_on_full_rate
                type_of_formation {
                  _id
                  type_of_information
                }
                description
                payment_modes {
                  _id
                  name
                  description
                  additional_cost
                  currency
                  term
                  payment_date {
                    date
                    amount
                    percentage
                  }
                }
              }
              registration_profile_type
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
                  bank {
                    name
                    city
                    address
                  }
                  name
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
                cost
                upload_document_rib
                family_name
                relation
                name
                sex
                civility
                tele_phone
                email
                account_holder_name
                iban
                bic
                autorization_account
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
              account_holder_name
              cost
              iban
              bic
              autorization_account
            }
          }
        `,
        variables: {
          candidate_input,
          lang: localStorage.getItem('currentLang'),
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
      .pipe(map((resp) => resp.data['ValidateManyCandidateFinancialSupport']));
  }

  UpdateCandidateDiploma(candidates_id, candidate_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidate($candidate_input: CandidateInput!, $lang: String) {
            UpdateCandidate(_id: "${candidates_id}", candidate_input: $candidate_input, lang: $lang) {
              _id
              civility
              first_name
              last_name
              email
              finance
              candidate_admission_status
              campus {
                _id
                name
                address
              }
              photo
              registration_profile_type
              engagement_level
              level {
                _id
                name
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
              }
              diploma_status
            }
          }
        `,
        variables: {
          candidate_input,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['UpdateCandidate']));
  }
  UpdateCandidateCampus(candidates_id, candidate_input, new_desired_program): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidate($candidate_input: CandidateInput!, $lang: String, $new_desired_program: ID) {
            UpdateCandidate(_id: "${candidates_id}", candidate_input: $candidate_input, lang: $lang, new_desired_program: $new_desired_program, is_from_admission_form: true) {
              _id
              region
              civility
              first_name
              last_name
              telephone
              finance
              payment_method
              is_admitted
              last_name_used
              first_name_used
              address
              additional_address
              country
              candidate_admission_status
              city
              post_code
              date_of_birth
              country_of_birth
              nationality_second
              post_code_of_birth
              city_of_birth
              email
              nationality
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
                other_amount
                additional_cost_ids {
                  additional_cost
                  amount
                }
                is_down_payment
                discount_on_full_rate
                type_of_formation {
                  _id
                  type_of_information
                }
                description
                payment_modes {
                  _id
                  name
                  description
                  additional_cost
                  currency
                  term
                  payment_date {
                    date
                    amount
                    percentage
                  }
                }
              }
              registration_profile_type
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
                  bank {
                    name
                    city
                    address
                  }
                  name
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
              payment_supports {
                upload_document_rib
                family_name
                relation
                name
                sex
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
              program_desired
              trial_date
              program_confirmed
            }
          }
        `,
        variables: {
          candidate_input,
          new_desired_program,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['UpdateCandidate']));
  }

  GeneratePDFSchoolContract(candidate_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GeneratePDFSchoolContract($lang: String!) {
            GeneratePDFSchoolContract(candidate_id: "${candidate_id}", lang: $lang, is_amendment: false)
          }
        `,
        variables: {
          candidate_id,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['GeneratePDFSchoolContract']));
  }

  GeneratePDFSchoolContractAmendement(candidate_id, dont_save_pdf_to_student): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GeneratePDFSchoolContractAmendement($lang: String!, $dont_save_pdf_to_student: Boolean) {
            GeneratePDFSchoolContract(candidate_id: "${candidate_id}", lang: $lang, is_amendment: true, dont_save_pdf_to_student: $dont_save_pdf_to_student)
          }
        `,
        variables: {
          candidate_id,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
          dont_save_pdf_to_student,
        },
      })
      .pipe(map((resp) => resp.data['GeneratePDFSchoolContract']));
  }

  GeneratePDFRegistrationCandidate(candidate_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GeneratePDFRegistrationCandidate($lang: String!) {
            GeneratePDFRegistrationCandidate(candidate_id: "${candidate_id}", lang: $lang)
          }
        `,
        variables: {
          candidate_id,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['GeneratePDFRegistrationCandidate']));
  }

  GetAllProfilRatesByName(rate): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllProfilRatesByName {
            GetAllProfilRates(filter: {name: "${rate}"}) {
              _id
              name
              description
              payment_modes {
                _id
                name
                description
                additional_cost
                currency
                term
                payment_date {
                  date
                  amount
                  percentage
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllProfilRates']));
  }

  GetPKAndSKKeysByCandidate(candidate_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetPKAndSKKeysByCandidate($candidate_id: ID!) {
            GetLegalEntityByCandidate(candidate_id: $candidate_id) {
              _id
              stripe_sk_key
              stripe_pk_key
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          candidate_id,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetLegalEntityByCandidate']));
  }

  GetLegalEntityByCandidateForDownPaymentStep(id: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetLegalEntityByCandidateForDownPaymentStep($id: ID!) {
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

  CreatePaymentIntent(payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreatePaymentIntent($create_payment_intent_input: CreatePaymentIntentInput) {
            CreatePaymentIntent(create_payment_intent_input: $create_payment_intent_input) {
              client_secret
            }
          }
        `,
        variables: {
          create_payment_intent_input: payload,
        },
      })
      .pipe(map((resp) => resp.data['CreatePaymentIntent']));
  }

  AcceptSchoolContractAmendment(form_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AcceptSchoolContractAmendment($form_id: ID, $lang: String) {
            AcceptSchoolContractAmendment(form_id: $form_id, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          form_id: form_id,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['AcceptSchoolContractAmendment']));
  }

  CreateCheckoutSession(payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateCheckoutSession($create_checkout_input: CreateCheckoutInput) {
            CreateCheckoutSession(create_checkout_input: $create_checkout_input) {
              url
              vendor
            }
          }
        `,
        variables: {
          create_checkout_input: payload,
        },
      })
      .pipe(map((resp) => resp.data['CreateCheckoutSession']));
  }

  getOneCandidateUserId(_id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneCandidate($_id: ID!) {
            GetOneCandidate(_id: $_id) {
              _id
              user_id {
                _id
              }
              email
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          _id,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidate']));
  }

  checkEmailAvailbility(email, user_id?){
    return this.apollo.mutate({
      mutation: gql`
      mutation CheckEmailActive($email: String, $userId: ID) {
        CheckEmailActive(email: $email, user_id: $userId)
      }
      `,
      variables: {
        email,
        user_id
      }
    }).pipe(map((resp) => resp.data['CheckEmailActive']));
  }
}
