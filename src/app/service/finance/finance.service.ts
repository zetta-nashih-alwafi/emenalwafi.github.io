import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cacheable } from 'ngx-cacheable';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FinancesService {
  public tutorialData: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public dataEditTutorial: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public tutorialStep: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public statusStepOne: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusStepTwo: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusStepThree: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusStepFour: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusStepFive: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public confirmed: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public dataStepTwo: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public dataStepThree: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public dataStepFour: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public dataStepFive: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public legalEntityId: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  public dataCheque: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public allDataCheque: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public dataChequeEnitty: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public dataBilling: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public reconciliationImport: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public currentStep: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public statusStepOneCheque: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusStepTwoCheque: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusStepThreeCheque: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusStepFourCheque: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isAccountingHaveInvalidData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isDataMerchantBoardingSaved: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  private _childrenFormValidationStatus = true;
  private _importRegistrationValidationStatus = true;
  private _importofFinanceObjectiveValidationStatus = true;
  private _importofFinancialN1ValidationStatus = true;

  setDataMerchantBoardingSaved(value: boolean) {
    this.isDataMerchantBoardingSaved.next(value);
  }

  setTutorialStep(value: number) {
    this.tutorialStep.next(value);
  }

  setLegalEntityId(value: any) {
    this.legalEntityId.next(value);
  }

  setCurrentStep(value: number) {
    this.currentStep.next(value);
  }

  setTutorialView(value: any) {
    this.tutorialData.next(value);
  }

  setTutorialEdit(value: any) {
    this.dataEditTutorial.next(value);
  }

  setReconciliationImport(value: any) {
    this.reconciliationImport.next(value);
  }

  setDataBilling(value: any) {
    this.dataBilling.next(value);
  }

  setDataCheque(value: any) {
    this.dataCheque.next(value);
  }

  setAllDataCheque(value: any) {
    this.allDataCheque.next(value);
  }

  setDataEntityCheque(value: any) {
    this.dataChequeEnitty.next(value);
  }

  setConfirmation(value: boolean) {
    this.confirmed.next(value);
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

  setIsAccountingHaveInvalidData(value: boolean) {
    this.isAccountingHaveInvalidData.next(value);
  }

  setDataStepTwo(value: any) {
    this.dataStepTwo.next(value);
  }

  setDataStepThree(value: any) {
    this.dataStepThree.next(value);
  }

  setDataStepFour(value: any) {
    this.dataStepFour.next(value);
  }

  setDataStepFive(value: any) {
    this.dataStepFive.next(value);
  }

  setStatusStepTwoCheque(value: any) {
    this.statusStepTwoCheque.next(value);
  }

  setStatusStepThreeCheque(value: any) {
    this.statusStepThreeCheque.next(value);
  }

  setStatusStepFourCheque(value: any) {
    this.statusStepFourCheque.next(value);
  }

  setStatusStepOneCheque(value: any) {
    this.statusStepOneCheque.next(value);
  }

  public get childrenFormValidationStatus() {
    return this._childrenFormValidationStatus;
  }

  public set childrenFormValidationStatus(state: boolean) {
    this._childrenFormValidationStatus = state;
  }

  public get importRegistrationValidationStatus() {
    return this._importRegistrationValidationStatus;
  }

  public set importRegistrationValidationStatus(state: boolean) {
    this._importRegistrationValidationStatus = state;
  }

  public get importOfFinanceObjectiveValidationStatus() {
    return this._importofFinanceObjectiveValidationStatus;
  }

  public set importOfFinanceObjectiveValidationStatus(state: boolean) {
    this._importofFinanceObjectiveValidationStatus = state;
  }

  public get importOfFinancialN1ValidationStatus() {
    return this._importofFinancialN1ValidationStatus;
  }

  public set importOfFinancialN1ValidationStatus(state: boolean) {
    this._importofFinancialN1ValidationStatus = state;
  }

  constructor(public httpClient: HttpClient, private apollo: Apollo, private translate: TranslateService) {}

  getAffectedTermsBillingForAddPayment(amount, billing_id, payment_method, is_from_asking_payment_sepa): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GetAffectedTermsBillingForAddPayment(
            $amount: Float
            $billing_id: ID
            $payment_method: EnumPaymentMethod
            $is_from_asking_payment_sepa: Boolean
          ) {
            GetAffectedTermsBilling(
              amount: $amount
              billing_id: $billing_id
              payment_method: $payment_method
              is_from_asking_payment_sepa: $is_from_asking_payment_sepa
            ) {
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
              is_locked
              is_term_paid
              term_amount
              term_pay_amount
              term_pay_date {
                date
                time
              }
              is_partial
              term_status
              percentage
              is_regulation
              term_amount_not_authorised
              term_amount_pending
              term_amount_chargeback
              payment_source
              term_source
              payment_type
              amount
              pay_amount
              status
            }
          }
        `,
        variables: {
          amount,
          billing_id,
          payment_method,
          is_from_asking_payment_sepa,
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['GetAffectedTermsBilling']));
  }

  getAffectedTermsFinancement(amount, finance_organization_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GetAffectedTermsFinancement($amount: Float, $finance_organization_id: ID) {
            GetAffectedTermsFinancement(amount: $amount, finance_organization_id: $finance_organization_id) {
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
              is_locked
              is_term_paid
              term_amount
              term_pay_amount
              term_pay_date {
                date
                time
              }
              is_partial
              term_status
              percentage
              is_regulation
              payment_source
              term_source
              payment_type
              amount
              pay_amount
              status
            }
          }
        `,
        variables: {
          amount,
          finance_organization_id,
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['GetAffectedTermsFinancement']));
  }

  getLegalEntityByStudent(studentId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query {
        GetLegalEntityByStudent(student_id: "${studentId}") {
          _id
          name
          banks
        }
      }
      `,
      })
      .pipe(map((resp) => resp.data['GetLegalEntityByStudent']));
  }

  getAcountingNumber(studentId: string, addedNumber: number): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query {
        GetAcountingNumber(student_id: "${studentId}", added_number: ${addedNumber})
      }
      `,
      })
      .pipe(map((resp) => resp.data['GetAcountingNumber']));
  }

  GetAllIntakeChannels(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllIntakeChannels {
              intake_channel
              intake_channel_detail
              down_payment_id {
                _id
                amount
              }
              full_rate_id {
                _id
                amount_internal
                amount_external
              }
              legal_entities_id {
                _id
                legal_entity_name
              }
              sector_id {
                _id
                name
              }
              speciality_id {
                _id
                name
              }
              volume_hours {
                _id
                volume_hour
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllIntakeChannels']));
  }

  GetAllIntakeChannelsScholar(scholar): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllIntakeChannels(${scholar}) {
              intake_channel
              intake_channel_detail
              down_payment_id {
                _id
                amount
              }
              full_rate_id {
                _id
                amount_internal
                amount_external
              }
              legal_entities_id {
                _id
                legal_entity_name
              }
              sector_id {
                _id
                name
              }
              speciality_id {
                _id
                name
              }
              volume_hours {
                _id
                volume_hour
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllIntakeChannels']));
  }

  GetAdmissionIntakeData(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
            query GetAllIntakeChannels($pagination: PaginationInput, $sort: IntakeChannelSortingInput) {
              GetAllIntakeChannels(pagination: $pagination, sorting: $sort, ${filter}) {
              _id
              intake_channel
              school
              campus
              level
              scholar_season
              intake_channel_detail
              down_payment_id {
                _id
                amount
                external
                internal
              }
              full_rate_id {
                _id
                amount_internal
                amount_external
              }
              legal_entities_id {
                _id
                legal_entity_name
              }
              sector_id {
                _id
                name
              }
              speciality_id {
                _id
                name
              }
              volume_hours {
                _id
                volume_hour
              }
              accounting_account_id {
                _id
                account_number
              }
              analytical_code_id {
                _id
                analytical_code
              }
              count_document
              admission_flyer {
                document_name
                s3_file_name
              }
              admission_document {
                document_name
                s3_file_name
              }
              paid_leave_allowance_rate
              induced_hours_coefficient
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllIntakeChannels']));
  }

  GetAllIntakeChannelsAssignTeacher(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllIntakeChannels($filter: IntakeChannelFilterInput) {
            GetAllIntakeChannels(filter: $filter) {
              legal_entities_id {
                _id
                legal_entity_name
              }
              campus
              school
              level
              sector_id {
                name
              }
              speciality_id {
                _id
                name
              }
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllIntakeChannels']));
  }

  GetAdmissionIntakeDataCheckbox(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
            query GetAllIntakeChannels($pagination: PaginationInput, $sort: IntakeChannelSortingInput) {
              GetAllIntakeChannels(pagination: $pagination, sorting: $sort, ${filter}) {
              _id
              intake_channel
              school
              campus
              level
              scholar_season
              intake_channel_detail
              paid_leave_allowance_rate
              induced_hours_coefficient
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllIntakeChannels']));
  }
  getAllIdIntakeChannelsForCheckbox(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
            query GetAllIntakeChannels($pagination: PaginationInput, $sort: IntakeChannelSortingInput) {
              GetAllIntakeChannels(pagination: $pagination, sorting: $sort, ${filter}) {
              _id
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllIntakeChannels']));
  }
  getAllDataIntakeChannelsForConnectLegal(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
            query GetAllIntakeChannels($pagination: PaginationInput, $sort: IntakeChannelSortingInput) {
              GetAllIntakeChannels(pagination: $pagination, sorting: $sort, ${filter}) {
              _id
              campus
              level
              speciality_id {
                _id
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
      .valueChanges.pipe(map((resp) => resp.data['GetAllIntakeChannels']));
  }

  getAllIdIntakeChannelsForAddInducedHours(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
            query GetAllIntakeChannels($pagination: PaginationInput, $sort: IntakeChannelSortingInput) {
              GetAllIntakeChannels(pagination: $pagination, sorting: $sort, ${filter}) {
              _id
              induced_hours_coefficient
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllIntakeChannels']));
  }

  checkAdmissionIntakeData(pagination, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
            query GetAllIntakeChannels($pagination: PaginationInput) {
              GetAllIntakeChannels(pagination: $pagination, ${filter}) {
              intake_channel
              is_completed
              count_document
            }
          }
        `,
        variables: {
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllIntakeChannels']));
  }

  GetAllAccountingData(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
            query {
              GetAllIntakeChannels(${filter}) {
              intake_channel
              intake_channel_detail
              down_payment_id {
                _id
                amount
                external
                internal
              }
              full_rate_id {
                _id
                amount_internal
                amount_external
              }
              legal_entities_id {
                _id
                legal_entity_name
              }
              sector_id {
                _id
                name
              }
              speciality_id {
                _id
                name
              }
              volume_hours {
                _id
                volume_hour
              }
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllIntakeChannels']));
  }

  GetAllIntakeChannelDropdown(search): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllIntakeChannelDropdown
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllIntakeChannelDropdown']));
  }

  GetAllIntakeChannelNoScholar(search): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllIntakeChannelDropdown(without_scholar_season: true)
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllIntakeChannelDropdown']));
  }

  getAllProgramsDropdown() {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllProgramsDropdown(is_without_scholar_season: true)
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllProgramsDropdown']));
  }

  getAllProgramHaveSector(scholar_season_id) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllPrograms(filter: {is_should_have_sector: true, scholar_season_id: "${scholar_season_id}"}) {
              _id
              program
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllPrograms']));
  }

  getAllProgramHaveNoSector(scholar_season_id) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllPrograms(filter: {is_should_have_speciality: false, scholar_season_id: "${scholar_season_id}"}) {
              _id
              program
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllPrograms']));
  }

  getAllProgramForProfile(scholar_season_id, school_id, campus, level) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllPrograms($school_id: [ID], $campus: [ID], $level: [ID]) {
            GetAllPrograms(filter: {school_id: $school_id, campus: $campus, level: $level, scholar_season_id: "${scholar_season_id}"}) {
              _id
              program
            }
          }
        `,
        variables: {
          school_id,
          campus,
          level,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllPrograms']));
  }

  getAllProgramWithoutSector(scholar_season_id) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllPrograms(filter: {is_should_have_sector: false, scholar_season_id: "${scholar_season_id}"}) {
              _id
              program
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllPrograms']));
  }

  getAllProgramByScholar(scholar_season_id) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllPrograms(filter: {scholar_season_id: "${scholar_season_id}"}) {
              _id
              program
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllPrograms']));
  }

  GetAllCandidateCampus(pagination, sortValue, filter, scholar_season_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateCampus($pagination: PaginationInput, $sort: CandidateCampusSortingInput) {
            GetAllCandidateCampus(pagination: $pagination, sorting: $sort, ${filter}, scholar_season_id: "${scholar_season_id}") {
              _id
              name
              school_id {
                _id
                short_name
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
                name
              }
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
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateCampus']));
  }

  GetAllInAppTutorial(pagination): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllInAppTutorial($pagination: PaginationInput) {
            GetAllInAppTutorial(pagination: $pagination) {
              _id
              module
              sub_modules {
                sub_module
                items {
                  title
                  description
                }
              }
              scenario_checklist_url
              video_presentation
              qa_checklist_url
              count_document
              is_published
              video_url
            }
          }
        `,
        variables: {
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllInAppTutorial']));
  }

  GetAllInAppTutorials(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllInAppTutorial {
              _id
              module
              sub_modules {
                sub_module
                items {
                  title
                  description
                }
              }
              scenario_checklist_url
              video_presentation
              qa_checklist_url
              count_document
              video_url
              is_published
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllInAppTutorial']));
  }

  GetListTutorialAdded(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllInAppTutorial {
              _id
              module
              is_published
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllInAppTutorial']));
  }

  GetListProfileRates(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllProfilRates($filter: ProfilRateFilterInput) {
            GetAllProfilRates(filter: $filter) {
              _id
              name
              is_admission
              is_readmission
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllProfilRates']));
  }

  GetListProfileRatesDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllProfilRates {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllProfilRates']));
  }

  GetReadmissionProfileDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetReadmissionProfileDropdown{
            GetReadmissionProfileDropdown {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetReadmissionProfileDropdown']));
  }

  GetAllUsers(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllUsers($pagination: PaginationInput, $sort: UserSorting) {
            GetAllUsers(pagination: $pagination, sorting: $sort, ${filter}, user_type: "617f64ec5a48fe222851880f") {
              _id
              first_name
              last_name
              civility
              position
              portable_phone
              email
              legal_entity
              work_location
              status
              user_status
              count_document
              entities {
                  type {
                      _id
                      name
                  }
                  entity_name
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
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }

  // GetAllLegalEntities(pagination, sortValue, filter): Observable<any[]> {
  //   return this.apollo
  //     .watchQuery<any[]>({
  //       query: gql`
  //         query GetAllLegalEntities($pagination: PaginationInput, $sort: LegalEntitySortingInput) {
  //           GetAllLegalEntities(pagination: $pagination, sorting: $sort, ${filter}) {
  //             _id
  //             name
  //             accounting_account
  //             banks
  //             rib
  //             school_id {
  //               _id
  //               short_name
  //             }
  //             campus {
  //               _id
  //               name
  //             }
  //             level {
  //               _id
  //               name
  //             }
  //             count_document
  //             immatriculation
  //             siret
  //             legal_representative {
  //               civility
  //               first_name
  //               last_name
  //               email
  //             }
  //             financial_representative {
  //               civility
  //               first_name
  //               last_name
  //               email
  //             }
  //             bank {
  //               name
  //               iban
  //               bic
  //               postal_code
  //               city
  //               department
  //               region
  //               address
  //               country
  //             }
  //             headquarter_address {
  //               number
  //               street
  //               postal_code
  //               country
  //               city
  //               department
  //               region
  //             }
  //             urrsaf_number
  //             tva_number
  //             city
  //           }
  //         }
  //       `,
  //       variables: {
  //         pagination,
  //         sort: sortValue ? sortValue : {},
  //       },
  //       fetchPolicy: 'network-only',
  //     })
  //     .valueChanges.pipe(map((resp) => resp.data['GetAllLegalEntities']));
  // }

  GetAllLegalEntitiesForCheckbox(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllLegalEntitiesForCheckbox($pagination: PaginationInput, $sort: LegalEntitySortingInput) {
            GetAllLegalEntities(pagination: $pagination, sorting: $sort, ${filter}) {
             _id
             legal_entity_name
           }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllLegalEntities']));
  }

  GetAllLegalEntities(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllLegalEntities($pagination: PaginationInput, $sort: LegalEntitySortingInput) {
            GetAllLegalEntities(pagination: $pagination, sorting: $sort, ${filter}) {
             _id
             onboard_step
             legal_entity
             legal_entity_name
             legal_entity_stamp
             psp_reference
             account_code
             account_holder_code
             pci_expired_date {
                  date
                  time
                }
             account_holder_details {
               business_detail {
                 registration_number
                 signatories {
                   signatory_name {
                     first_name
                     gender
                     last_name
                   }
                 }
                 shareholders {
                   first_name
                   gender
                   last_name
                 }
               }
               bank_account_details {
                 iban
                 bank_name
               }
               account_holder_address {
                 country
                 city
                 postal_code
                 street
                 state_or_province
                 house_number_or_name
               }
             }
             immatriculation
             urrsaf_number
             bic
             tva_number
             online_payment_status
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
      .valueChanges.pipe(map((resp) => resp.data['GetAllLegalEntities']));
  }

  GetAllSectors(pagination, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSectors($pagination: PaginationInput, $filter: SectorFilterInput) {
            GetAllSectors(pagination: $pagination, filter: $filter) {
              _id
              name
              count_document
              description
              programs {
                _id
                program
              }
              sigli
            }
          }
        `,
        variables: {
          pagination,
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSectors']));
  }

  GetAllSectorsTable(pagination, sorting, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSectors($pagination: PaginationInput, $filter: SectorFilterInput, $sorting: SectorSortingInput) {
            GetAllSectors(pagination: $pagination, filter: $filter, sorting: $sorting) {
              _id
              name
              count_document
              description
              programs {
                _id
                program
              }
              school_id {
                _id
                short_name
              }
              campus_id {
                _id
                name
              }
              level_id {
                _id
                name
              }
              sigli
            }
          }
        `,
        variables: {
          pagination,
          filter,
          sorting: sorting ? sorting : null,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSectors']));
  }

  GetAllSectorsDropdown(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSectors($filter: SectorFilterInput) {
            GetAllSectors(filter: $filter) {
              _id
              name
              programs {
                _id
                program
              }
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSectors']));
  }

  GetAllSpecializations(pagination, sortValue = null, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSpecializations(
            $pagination: PaginationInput
            $sortValue: SpecializationSortingInput
            $filter: SpecializationFilterInput
          ) {
            GetAllSpecializations(pagination: $pagination, sorting: $sortValue, filter: $filter) {
              _id
              name
              status
              count_document
              description
              programs {
                _id
                program
              }
              sectors {
                _id
                name
              }
              sigli
            }
          }
        `,
        variables: {
          pagination,
          sortValue,
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSpecializations']));
  }

  GetAllSpecializationsDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllSpecializations {
              name
              intake_channel
              description
              programs {
                _id
                program
              }
              sectors {
                name
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSpecializations']));
  }

  GetAllSpecializationsByScholar(scholar_season_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSpecializationsByScholar{
            GetAllSpecializations(filter: {scholar_season_id: "${scholar_season_id}"}) {
              _id
              name
              intake_channel
              description
              programs {
                _id
                program
              }
              sectors {
                name
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSpecializations']));
  }
  getSpecialityIntakeChannelDropDown(candidate_school_id, scholar_season_id): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetSpecialityIntakeChannelDropDown($candidate_school_id: ID!, $scholar_season_id: ID!) {
            GetSpecialityIntakeChannelDropDown(candidate_school_id: $candidate_school_id, scholar_season_id: $scholar_season_id) {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          candidate_school_id,
          scholar_season_id,
        },
      })
      .pipe(map((resp) => resp.data['GetSpecialityIntakeChannelDropDown']));
  }
  GetAllSpecializationsByScholarSchool(scholar_season_id, candidate_school_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllSpecializations(filter: {scholar_season_id: "${scholar_season_id}", candidate_school_ids: ["${candidate_school_ids}"]}) {
              _id
              name
              intake_channel
              description
              programs {
                _id
                program
              }
              sectors {
                name
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSpecializations']));
  }

  GetAllTransactionHistories(pagination, filter, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllTransactionHistories($pagination: PaginationInput, $user_type_ids: [ID]) {
            GetAllTransactionHistories(pagination: $pagination, ${filter}, user_type_ids: $user_type_ids) {
              _id
              accounting_document
              transaction_date
              transaction_time
              transaction_type
              description
              transaction
              from
              to
              bank
              debit
              credit
              reference
              term_index
              amount
              candidate_id {
                _id
                first_name
                last_name
                civility
                email
                payment_supports {
                  civility
                  name
                  family_name
                }
                billing_id {
                  deposit
                  intake_channel {
                    _id
                    program
                    scholar_season_id {
                  _id
                  scholar_season
                }
                  }
                  deposit_pay_amount
                  is_deposit_completed
                  terms {
                    _id
                    is_term_paid
                    term_amount
                    term_pay_amount
                    term_payment {
                      date
                      time
                    }
                  }
                }
              }
              candidate_id {
                _id
                payment_supports {
                  relation
                  family_name
                  name
                  civility
                  email
                }
              }
              intake_channel {
                _id
                program
                scholar_season_id {
                  _id
                  scholar_season
                }
              }
              letter
              count_document
              total_debit
              total_credit
            }
          }
        `,
        variables: {
          pagination,
          user_type_ids,
          // sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTransactionHistories']));
  }

  GetAllTransactionHistoriesCheckbox(pagination, filter, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllTransactionHistories($pagination: PaginationInput, $user_type_ids: [ID]) {
            GetAllTransactionHistories(pagination: $pagination, ${filter}, user_type_ids: $user_type_ids) {
              _id
              debit
              credit
              count_document
            }
          }
        `,
        variables: {
          pagination,
          user_type_ids,
          // sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTransactionHistories']));
  }

  GetAllTransactionHistoriesForExport(pagination, filter, user_type_ids): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
        query GetAllTransactionHistoriesForExport($pagination: PaginationInput, $user_type_ids: [ID]) {
            GetAllTransactionHistories(pagination: $pagination, ${filter}, user_type_ids: $user_type_ids) {
              _id
            }
        }
        `,
        variables: {
          pagination,
          user_type_ids,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTransactionHistories']));
  }

  GetAllBanksFromTransactionhistory(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllBanksFromTransactionhistory{
            GetAllBanksFromTransactionhistory
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllBanksFromTransactionhistory']));
  }

  GetAllCandidateSchool(pagination, sortValue, filter, user_type_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($pagination: PaginationInput, $sort: CandidateSchoolSortingInput, $user_type_id: ID) {
            GetAllCandidateSchool(pagination: $pagination, sorting: $sort, ${filter}, user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              school_logo
              tele_phone
              signalement_email
              school_addresses {
                address
                postal_code
                city
                region
                department
                is_main_address
                country
              }
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
              }
              levels {
                _id
                name
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
              count_document
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
          user_type_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  GetAllCandidateSchoolWithScholar(pagination, sortValue, filter, scholar_season_id, user_type_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($pagination: PaginationInput, $sort: CandidateSchoolSortingInput, $user_type_id: ID) {
            GetAllCandidateSchool(pagination: $pagination, sorting: $sort, ${filter}, scholar_season_id: "${scholar_season_id}", user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              school_logo
              tele_phone
              signalement_email
              school_addresses {
                address
                postal_code
                city
                region
                department
                is_main_address
                country
              }
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
              }
              levels {
                _id
                name
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
              count_document
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
          user_type_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  GetAllCandidateSchoolWithScholarCheckbox(pagination, sortValue, filter, scholar_season_id, user_type_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($pagination: PaginationInput, $sort: CandidateSchoolSortingInput, $user_type_id: ID) {
            GetAllCandidateSchool(pagination: $pagination, sorting: $sort, ${filter}, scholar_season_id: "${scholar_season_id}", user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              school_logo
              tele_phone
              count_document
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
          user_type_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  getSchoolCampusLevelDropdown(scholar_season_id: string, filter?: any, user_type_id?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($scholar_season_id: ID, $filter: CandidateSchoolFilterInput, $user_type_id: ID) {
            GetAllCandidateSchool(scholar_season_id: $scholar_season_id, filter: $filter, user_type_id: $user_type_id) {
              _id
              short_name
              count_document
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
        variables: {
          scholar_season_id,
          filter: filter ? filter : null,
          user_type_id: user_type_id ? user_type_id : null,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  getAllSchoolsDropdown(scholar_season_id: string, user_type_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidateSchool($user_type_id: ID) {
          GetAllCandidateSchool(scholar_season_id: "${scholar_season_id}", user_type_id: $user_type_id) {
            _id
            short_name
            count_document
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

  getAllCampusesDropdown(filter: { scholar_season_id: string; school_id: string }) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCampuses($filter: CampusFilterInput) {
            GetAllCampuses(filter: $filter) {
              _id
              name
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCampuses']));
  }

  getAllCampusesDropdownCascadeFilter(filter, user_type_login) {
    return this.apollo
      .query({
        query: gql`
          query GetAllCampuses($filter: CampusFilterInput, $user_type_login: ID) {
            GetAllCampuses(filter: $filter, user_type_login: $user_type_login) {
              _id
              name
            }
          }
        `,
        variables: {
          filter,
          user_type_login,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCampuses']));
  }

  getAllCampusesDropdownCascadeFilterTrombs(filter, user_type_logins) {
    return this.apollo
      .query({
        query: gql`
          query GetAllCampuses($filter: CampusFilterInput, $user_type_logins: [ID]) {
            GetAllCampuses(filter: $filter, user_type_logins: $user_type_logins) {
              _id
              name
            }
          }
        `,
        variables: {
          filter,
          user_type_logins,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllCampuses']));
  }

  getAllLevelsDropdown(filter: { scholar_season_id: string; school_id: string; campus_id: string }) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllLevels($filter: LevelFilterInput) {
            GetAllLevels(filter: $filter) {
              _id
              name
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllLevels']));
  }

  getAllLevelsDropdownCascadeFilter(filter, user_type_login) {
    return this.apollo
      .query({
        query: gql`
          query GetAllLevels($filter: LevelFilterInput, $user_type_login: ID) {
            GetAllLevels(filter: $filter, user_type_login: $user_type_login) {
              _id
              name
            }
          }
        `,
        variables: {
          filter,
          user_type_login,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllLevels']));
  }

  getAllLevelsDropdownCascadeFilterTrombs(filter, user_type_logins) {
    return this.apollo
      .query({
        query: gql`
          query GetAllLevels($filter: LevelFilterInput, $user_type_logins: [ID]) {
            GetAllLevels(filter: $filter, user_type_logins: $user_type_logins) {
              _id
              name
            }
          }
        `,
        variables: {
          filter,
          user_type_logins,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllLevels']));
  }

  GetAllProfilRates(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllProfilRates($pagination: PaginationInput, $sort: ProfilRateSortingInput) {
            GetAllProfilRates(pagination: $pagination, sorting: $sort, ${filter}) {
              _id
              name
              description
              is_down_payment
              discount_on_full_rate
              other_currency
              other_amount
              select_payment_method_available
              is_admission
              is_readmission
              document_builder_id {
                _id
                document_builder_name
                document_type
                is_published
              }
              scholar_season_id {
                _id
              }
              additional_cost_ids {
                _id
                additional_cost
                amount
              }
              payment_modes {
                _id
                name
                description
              }
              programs {
                _id
                program
              }
              count_document
              school_ids {
                _id
              }
              campuses {
                _id
                name
              }
              levels {
                _id
                name
              }
              type_of_formation {
                _id
              }
              dp_additional_cost_amount
              dp_additional_cost_currency
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllProfilRates']));
  }
  getAllProfilRatesIdForExport(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllProfilRates($pagination: PaginationInput, $sort: ProfilRateSortingInput) {
            GetAllProfilRates(pagination: $pagination, sorting: $sort, ${filter}) {
              _id
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllProfilRates']));
  }

  GetAllAdditionalCosts(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAdditionalCosts($pagination: PaginationInput, $sort: AdditionalCostSortingInput) {
            GetAllAdditionalCosts(pagination: $pagination, sorting: $sort, ${filter}) {
              count_document
              additional_cost
              description
              amount
              currency
              _id
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAdditionalCosts']));
  }

  GetAllAdditionalCostsDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAdditionalCosts {
            GetAllAdditionalCosts {
              _id
              additional_cost
              description
              amount
              currency
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAdditionalCosts']));
  }

  getAllPaymentModes(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllPaymentModes($pagination: PaginationInput, $sort: PaymentModeSortingInput) {
            GetAllPaymentModes(pagination: $pagination, sorting: $sort, ${filter}) {
              _id
              name
              description
              additional_cost
              currency
              payment_date {
                date
                amount
                percentage
              }
              select_payment_method_available
              term
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
      .valueChanges.pipe(map((resp) => resp.data['GetAllPaymentModes']));
  }

  getAllPaymentModesForExport(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllPaymentModes($pagination: PaginationInput, $sort: PaymentModeSortingInput) {
            GetAllPaymentModes(pagination: $pagination, sorting: $sort, ${filter}) {
              _id
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllPaymentModes']));
  }

  GetAllFinanceOrganization(filter, pagination, search, sorting, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllFinanceOrganization(
            $filter: FinanceOrganizationFilterInput
            $pagination: PaginationInput
            $search: FinanceOrganizationSearchInput
            $sorting: FinanceOrganizationSortingInput
            $user_type_ids: [ID]
          ) {
            GetAllFinanceOrganization(
              filter: $filter
              pagination: $pagination
              search: $search
              sorting: $sorting
              user_type_ids: $user_type_ids
            ) {
              _id
              candidate_id {
                _id
                last_name
                first_name
                civility
                email
                candidate_admission_status
                registration_profile {
                  is_down_payment
                  discount_on_full_rate
                  additional_cost_ids {
                    _id
                    additional_cost
                    amount
                  }
                }
                selected_payment_plan {
                  additional_expense
                }
                payment_supports {
                  name
                  family_name
                  civility
                  email
                }
              }
              account_number
              organization_id {
                _id
                name
                organization_type
              }
              intake_channel {
                program
              }
              financial_profile
              student_type {
                type_of_information
                type_of_formation
              }
              profil_rate
              is_profil_rate_updated
              payment_method
              financial_supports {
                relation
                family_name
                name
              }
              amount_billed
              amount_paid
              remaining_billed
              amount_late
              accumulated_late
              deposit
              deposit_pay_amount
              deposit_pay_date {
                date
                time
              }
              is_deposit_completed
              overdue
              overdue_not_paid
              is_student_blocked
              terms {
                _id
                is_regulation
                term_payment {
                  date
                  time
                }
                term_payment_deferment {
                  date
                  time
                }
                is_term_paid
                term_amount
                term_pay_amount
                term_status
                term_pay_date {
                  date
                  time
                }
                is_partial
                is_locked
                is_regulation
              }
              count_document
              term_times
              deposit_status
              organization_name
              organization_type
              total_amount
            }
          }
        `,
        variables: {
          filter,
          pagination,
          search,
          sorting,
          user_type_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllFinanceOrganization']));
  }
  GetAllFinanceOrganizationId(filter, pagination, search, sorting): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllFinanceOrganization(
            $filter: FinanceOrganizationFilterInput
            $pagination: PaginationInput
            $search: FinanceOrganizationSearchInput
            $sorting: FinanceOrganizationSortingInput
          ) {
            GetAllFinanceOrganization(filter: $filter, pagination: $pagination, search: $search, sorting: $sorting) {
              _id
            }
          }
        `,
        variables: {
          filter,
          pagination,
          search,
          sorting,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllFinanceOrganization']));
  }
  GetAllFinanceOrganizationForGenerate(filter, pagination, search, sorting): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllFinanceOrganization(
            $filter: FinanceOrganizationFilterInput
            $pagination: PaginationInput
            $search: FinanceOrganizationSearchInput
            $sorting: FinanceOrganizationSortingInput
          ) {
            GetAllFinanceOrganization(filter: $filter, pagination: $pagination, search: $search, sorting: $sorting) {
              _id
              term_times
            }
          }
        `,
        variables: {
          filter,
          pagination,
          search,
          sorting,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllFinanceOrganization']));
  }
  GetAllFinanceOrganizationForMultipleMail(filter, pagination, search, sorting): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllFinanceOrganization(
            $filter: FinanceOrganizationFilterInput
            $pagination: PaginationInput
            $search: FinanceOrganizationSearchInput
            $sorting: FinanceOrganizationSortingInput
          ) {
            GetAllFinanceOrganization(filter: $filter, pagination: $pagination, search: $search, sorting: $sorting) {
              _id
              organization_id {
                _id
                name
              }
            }
          }
        `,
        variables: {
          filter,
          pagination,
          search,
          sorting,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllFinanceOrganization']));
  }
  GetAllFinanceOrganizationDropdown() {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllFinanceOrganization {
            GetAllFinanceOrganization {
              _id
              intake_channel {
                _id
                program
              }
              student_type {
                _id
                type_of_formation
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllFinanceOrganization']));
  }

  GetOneFinanceOrganization(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllFinanceOrganization($filter: FinanceOrganizationFilterInput) {
            GetAllFinanceOrganization(filter: $filter) {
              _id
              candidate_id {
                _id
                last_name
                first_name
                civility
                email
                candidate_admission_status
                registration_profile {
                  is_down_payment
                  discount_on_full_rate
                  additional_cost_ids {
                    _id
                    additional_cost
                    amount
                  }
                }
                selected_payment_plan {
                  additional_expense
                }
                payment_supports {
                  name
                  family_name
                  civility
                  email
                }
                legal_representative{
                  unique_id
                }
              }
              organization_id {
                _id
                name
                organization_type
              }
              company_branch_id {
                _id
                company_name
              }
              financial_profile
              financial_supports {
                relation
                family_name
                name
              }
              amount_billed
              amount_paid
              remaining_billed
              amount_late
              accumulated_late
              deposit
              deposit_pay_amount
              is_deposit_completed
              overdue
              overdue_not_paid
              terms {
                _id
                term_status
                term_payment {
                  date
                  time
                }
                term_payment_deferment {
                  date
                  time
                }
                is_term_paid
                term_amount
                term_pay_amount
                term_pay_date {
                  date
                  time
                }
                is_partial
                is_locked
                is_regulation
              }
              timeline_template_id {
                _id
              }
              count_document
              term_times
              deposit_status
              total_amount
              student_type {
                type_of_information
                type_of_formation
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

  GetOneFinanceOrganizationForCheckStatus(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllFinanceOrganization($filter: FinanceOrganizationFilterInput) {
            GetAllFinanceOrganization(filter: $filter) {
              _id
              account_number
              terms {
                _id
                term_status
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

  getAllBilling(pagination, sortValue, filter, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllBilling($pagination: PaginationInput, $sort: BillingSortingInput, $user_type_ids: [ID]) {
            GetAllBilling(pagination: $pagination, sorting: $sort, ${filter}, user_type_ids: $user_type_ids) {
              _id
              account_number
              is_financial_support
              is_have_special_case
              financial_support_info{
                _id
                relation
                name
                family_name
                civility
                email
              }
              deposit_pay_date {
                date
                time
              }
              is_profil_rate_updated
              student_id {
                _id
                first_name
                last_name
                civility
                email
              }
              candidate_id {
                _id
                last_name
                first_name
                civility
                email
                payment
                school_mail
                candidate_admission_status
                modality_step_special_form_status
                readmission_status
                registration_profile {
                  is_down_payment
                  discount_on_full_rate
                  additional_cost_ids {
                    _id
                    additional_cost
                    amount
                  }
                }
                selected_payment_plan {
                    additional_expense
                }
                payment_supports {
                  relation
                  family_name
                  name
                  civility
                  tele_phone
                  email
                  _id
                }
              }
              financial_profile
              student_type {
                _id
                type_of_information
              }
              amount_billed
              profil_rate
              payment_method
              financial_supports {
                relation
                name
                civility
                email
                family_name
              }
              amount_paid
              remaining_billed
              amount_late
              accumulated_late
              count_document
              intake_channel {
                _id
                program
                scholar_season_id {
                  _id
                  scholar_season
                }
              }
              deposit
              is_deposit_completed
              deposit_pay_amount
              overdue
              is_student_blocked
              overdue_not_paid
              terms {
                _id
                reference_term_id
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
              total_amount
              deposit_status
              legal_entity {
                legal_entity_name
              }
              sent_pay_n2 {
                date
                time
              }
              dp_histories{
                deposit_pay_amount
                deposit_status
                is_deposit_completed
                deposit
                date_inserted{
                  date
                  time
                }
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
          user_type_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllBilling']));
  }

  getAllProgramBillingDropdown(filter, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllProgramDropdown($filter: DropdownProgramFilterInput, $user_type_ids: [ID]) {
            GetAllProgramDropdown(filter: $filter, user_type_ids: $user_type_ids) {
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,
        variables: {
          user_type_ids,
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllProgramDropdown']));
  }

  getAllBillingCheckbox(pagination, sortValue, filter, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllBilling($pagination: PaginationInput, $sort: BillingSortingInput, $user_type_ids: [ID]) {
            GetAllBilling(pagination: $pagination, sorting: $sort, ${filter}, user_type_ids: $user_type_ids) {
              _id
              account_number
              is_profil_rate_updated
              is_financial_support
              financial_support_info{
                _id
                relation
                name
                family_name
                civility
              }
              student_id {
                _id
                first_name
                last_name
                civility
                email
              }
              candidate_id {
                _id
                last_name
                first_name
                civility
                email
                candidate_admission_status
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
          user_type_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllBilling']));
  }
  getAllBillingSendEmailCheckbox(pagination, sortValue, filter, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllBilling($pagination: PaginationInput, $sort: BillingSortingInput, $user_type_ids: [ID]) {
            GetAllBilling(pagination: $pagination, sorting: $sort, ${filter}, user_type_ids: $user_type_ids) {
              _id
              is_financial_support
              financial_support_info{
                _id
                relation
                name
                family_name
                civility
                email
              }
              candidate_id {
                _id
                last_name
                first_name
                civility
                email
                candidate_admission_status
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
          user_type_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllBilling']));
  }
  getAllBillingIdCheckbox(pagination, sortValue, filter, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllBilling($pagination: PaginationInput, $sort: BillingSortingInput, $user_type_ids: [ID]) {
            GetAllBilling(pagination: $pagination, sorting: $sort, ${filter}, user_type_ids: $user_type_ids) {
              _id
              amount_billed
              terms {
                is_term_paid
                is_partial
                term_amount
                term_pay_amount
                term_amount_chargeback
              }
            }
          }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
          user_type_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllBilling']));
  }

  getAllBillingForCheque(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllBillingForCheque{
            GetAllBilling(${filter}) {
              _id
              account_number
              student_id {
                _id
                first_name
                last_name
                civility
                email
              }
              candidate_id {
                _id
                first_name
                last_name
                civility
                email
              }
              financial_profile
              deposit
              is_deposit_completed
              financial_supports {
                relation
                name
                civility
                email
                family_name
              }
              intake_channel {
                _id
                program
              }
              terms {
                _id
                term_pay_date {
                  date
                  time
                }
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
                term_amount
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllBilling']));
  }

  getAllBillingForReconciliation(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllBillingForReconciliation{
            GetAllBilling(${filter}) {
              _id
              account_number
              student_id {
                _id
                first_name
                last_name
                civility
                email
              }
              financial_profile
              deposit
              is_deposit_completed
              financial_supports {
                relation
                name
                civility
                email
                family_name
              }
              intake_channel {
                _id
                program
              }
              candidate_id {
                _id
                payment_supports {
                  name
                  family_name
                  civility
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllBilling']));
  }

  getAllBillingForFilter(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllBilling {
              _id
              student_type {
                _id
                type_of_information
                type_of_formation
              }
              payment_method
              intake_channel {
                _id
                program
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllBilling']));
  }

  GetFinancialSupportsDropdown(): Observable<any> {
    return this.apollo
      .watchQuery<any>({
        query: gql`
          query GetFinancialSupportsDropdown{
            GetFinancialSupportsDropdown
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetFinancialSupportsDropdown']));
  }

  getAllScholarSeasonsNameAndID(filter: any): Observable<Array<{ _id: string; scholar_season: string; is_published: boolean }>> {
    return this.apollo
      .query({
        query: gql`
          query GetAllScholarSeasonsNameAndID($filter: ScholarSeasonFilterInput) {
            GetAllScholarSeasons(filter: $filter) {
              _id
              scholar_season
              is_published
            }
          }
        `,
        variables: { filter },
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetAllScholarSeasons']));
  }

  GetAllScholarSeasons(pagination?, sortValue?, filter?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllScholarSeasons($pagination: PaginationInput) {
            GetAllScholarSeasons(pagination: $pagination) {
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
              is_published
              count_document
            }
          }
        `,
        variables: {
          pagination,
          // sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllScholarSeasons']));
  }

  getAllScholarCheckbox(pagination): Observable<any[]> {
    // Previously there is exclude_company : true, now removed
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllScholarSeasons($page: PaginationInput) {
            GetAllScholarSeasons(pagination: $page) {
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
              is_published
              count_document
            }
          }
        `,
        variables: {
          page: pagination,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllScholarSeasons']));
  }

  GetAllScholarSeasonsPublished(sortValue?, pagination?, filter?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllScholarSeasons($pagination: PaginationInput, $sort: ScholarSeasonSortingInput) {
            GetAllScholarSeasons(pagination: $pagination, sorting: $sort, filter: { is_published: true }) {
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
      .valueChanges.pipe(map((resp) => resp.data['GetAllScholarSeasons']));
  }

  GetAllScholarSeasonsDropdown(pagination?, sortValue?, filter?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllScholarSeasons($pagination: PaginationInput) {
            GetAllScholarSeasons(pagination: $pagination) {
              _id
              scholar_season
              is_published
            }
          }
        `,
        variables: {
          pagination,
          // sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllScholarSeasons']));
  }

  getOneBilling(billing_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query {
          GetOneBilling(_id: "${billing_id}") {
            _id
            student_id {
              _id
              first_name
              last_name
              civility
            }
             candidate_id {
              _id
              last_name
              first_name
              civility
            }
            financial_profile
            student_type
            profil_rate
            payment_method
            amount_billed
            financial_supports
            amount_paid
            remaining_billed
            amount_late
            accumulated_late
            deposit
            count_document
            is_deposit_completed
            intake_channel
            overdue
            overdue_not_paid
            terms {
              term_pay_date {
                date
                time
              }
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
              term_amount
            }
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneBilling']));
  }

  getOneBillingDPRegulation(billing_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetOneBillingDPRegulation{
          GetOneBilling(_id: "${billing_id}") {
            terms {
              term_amount
              term_source
              term_status
              term_pay_amount
              is_regulation
              term_payment {
                time
                date
              }
            }
            candidate_id {
              payment
            }
            deposit_pay_date {
              date
              time
            }
            deposit
            deposit_pay_amount
            deposit_status
            is_deposit_completed
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
          }
        }
  `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneBilling']));
  }

  GetAllUsersByLegal(legal_entity): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllUsersByLegalEntity($legal_entity: String) {
            GetAllUsers(legal_entity: $legal_entity) {
              _id
              first_name
              last_name
              civility
              email
              full_name
              entities {
                entity_name
                type {
                  name
                }
              }
            }
          }
        `,
        variables: {
          legal_entity,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }

  GetOneCandidate(student_id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetOneCandidate{
          GetOneCandidate(_id: "${student_id}") {
              _id
              first_name
              last_name
              civility
              type_of_formation_id {
                _id
                type_of_formation
              }
              payment
              registration_profile {
                  is_down_payment
                  discount_on_full_rate
                  additional_cost_ids {
                    _id
                    additional_cost
                    amount
                  }
              }
              selected_payment_plan {
                    additional_expense
                }
              candidate_admission_status
              billing_id {
                _id
                amount_paid
                amount_late
                amount_billed
                remaining_billed
                accumulated_late
                overdue
                overdue_not_paid
                deposit
                deposit_pay_amount
                financial_profile
                is_deposit_completed
                terms {
                  _id
                  term_payment {
                    date
                    time
                  }
                  term_payment_deferment {
                    date
                    time
                  }
                  is_partial
                  is_term_paid
                  term_amount
                  term_pay_amount
                  term_pay_date {
                    date
                    time
                  }
                  term_status
                }
                candidate_id {
                  _id
                  civility
                  email
                  first_name
                  last_name
                }
                student_id {
                  _id
                  civility
                  email
                  first_name
                  last_name
                }
                financial_supports {
                  name
                  family_name
                  relation
                  civility
                  email
                }
                total_amount
              }
              type_of_formation_id {
                type_of_formation
              }
            }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidate']));
  }

  getAllDownPayment(school_id, scholar_season_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllDownPayment{
          GetAllDownPayment(school_id: "${school_id}", scholar_season_id: "${scholar_season_id}") {
            _id
            school_id {
              _id
              short_name
            }
            campus {
              _id
              name
            }
            scholar_season_id {
              _id
              scholar_season
            }
            level {
              _id
              name
            }
            speciality {
              _id
              name
            }
            sector {
              _id
              name
            }
            amount
            internal
            external
            is_internal_editable
            is_external_editable
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllDownPayment']));
  }

  getAllFullRate(school_id, scholar_season_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllFullRate{
          GetAllFullRate(school_id: "${school_id}", scholar_season_id: "${scholar_season_id}") {
            _id
            school_id {
              _id
              short_name
            }
            campus {
              _id
              name
            }
            scholar_season_id {
              _id
              scholar_season
            }
            level {
              _id
              name
            }
            sector {
              _id
              name
            }
            speciality {
              _id
              name
            }
            amount_internal
            amount_external
            is_internal_editable
            is_external_editable
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllFullRate']));
  }

  GetLegalEntityByStudent(student_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetLegalEntityByStudent{
          GetLegalEntityByStudent(student_id: "${student_id}") {
            _id
            legal_entity_name
            # accounting_account
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetLegalEntityByStudent']));
  }

  UpdateManyDownPayment(down_payment_inputs): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateManyDownPayment($down_payment_inputs: [DownPaymentInput]) {
            UpdateManyDownPayment(down_payment_inputs: $down_payment_inputs) {
              _id
              campus {
                _id
                name
              }
            }
          }
        `,
        variables: {
          down_payment_inputs,
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['UpdateManyDownPayment']));
  }

  UpdateManyFullRate(full_rate_inputs): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateManyFullRate($full_rate_inputs: [FullRateInput], $lang: String) {
            UpdateManyFullRate(full_rate_inputs: $full_rate_inputs, lang: $lang) {
              message
              programs
              isError
              full_rates {
                _id
              }
            }
          }
        `,
        variables: {
          full_rate_inputs,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['UpdateManyFullRate']));
  }

  ImportDownPayment(import_down_payment_input, file): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ImportDownPayment($import_down_payment_input: ImportDownPaymentInput, $file: Upload!, $lang: String) {
            ImportDownPayment(import_down_payment_input: $import_down_payment_input, file: $file, lang: $lang) {
              _id
              campus {
                _id
              }
            }
          }
        `,
        variables: {
          file,
          import_down_payment_input,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['ImportDownPayment']));
  }

  ImportFullRate(import_full_rate_input, file): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ImportFullRate($import_full_rate_input: ImportFullRateInput, $file: Upload!, $lang: String) {
            ImportFullRate(import_full_rate_input: $import_full_rate_input, file: $file, lang: $lang) {
              _id
              campus {
                _id
              }
            }
          }
        `,
        variables: {
          file,
          import_full_rate_input,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['ImportFullRate']));
  }

  ImportGeneralDashboardFinance(import_general_finance_dashboard_input, file): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ImportGeneralDashboardFinance(
            $import_general_finance_dashboard_input: ImportGeneralDashboardFinanceInput
            $file: Upload!
            $lang: String
          ) {
            ImportGeneralDashboardFinance(
              import_general_finance_dashboard_input: $import_general_finance_dashboard_input
              file: $file
              lang: $lang
            ) {
              _id
            }
          }
        `,
        variables: {
          file,
          import_general_finance_dashboard_input,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['ImportGeneralDashboardFinance']));
  }

  ImportGeneralDashboardFinanceN1(import_general_finance_dashboard_input, file): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ImportGeneralDashboardFinanceN1(
            $import_general_finance_dashboard_input: ImportGeneralDashboardFinanceInput
            $file: Upload!
            $lang: String
          ) {
            ImportGeneralDashboardFinanceN1(
              import_general_finance_dashboard_input: $import_general_finance_dashboard_input
              file: $file
              lang: $lang
            ) {
              _id
            }
          }
        `,
        variables: {
          file,
          import_general_finance_dashboard_input,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['ImportGeneralDashboardFinanceN1']));
  }

  CreatePaymentMode(payment_mode_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreatePaymentMode($payment_mode_input: PaymentModeInput) {
            CreatePaymentMode(payment_mode_input: $payment_mode_input) {
              name
              description
            }
          }
        `,
        variables: {
          payment_mode_input,
        },
      })
      .pipe(map((resp) => resp.data['CreatePaymentMode']));
  }

  UpdatePaymentMode(payment_mode_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdatePaymentMode($payment_mode_input: PaymentModeInput, $_id: ID!) {
            UpdatePaymentMode(payment_mode_input: $payment_mode_input, _id: $_id) {
              name
              description
            }
          }
        `,
        variables: {
          _id,
          payment_mode_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdatePaymentMode']));
  }

  UpdateTransactionHistory(transaction_history_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateTransactionHistory($transaction_history_input: TransactionHistoryInput, $_id: ID) {
            UpdateTransactionHistory(transaction_history_input: $transaction_history_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          transaction_history_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateTransactionHistory']));
  }

  ChangeLetterage(letterages, transaction_history_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ChangeLetterage($letterages: [ReconciliationAndLetterageTransactionInput], $transaction_history_id: ID) {
            ChangeLetterage(letterages: $letterages, transaction_history_id: $transaction_history_id)
          }
        `,
        variables: {
          transaction_history_id,
          letterages,
        },
      })
      .pipe(map((resp) => resp.data['ChangeLetterage']));
  }

  DeletePaymentMode(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeletePaymentMode($_id: ID!) {
            DeletePaymentMode(_id: $_id) {
              name
              description
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeletePaymentMode']));
  }

  DeleteAdditionalCost(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteAdditionalCost($_id: ID!) {
            DeleteAdditionalCost(_id: $_id) {
              description
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteAdditionalCost']));
  }

  CreateTimelineTemplate(timeline_template_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateTimelineTemplate($timeline_template_input: TimelineTemplateInput) {
            CreateTimelineTemplate(timeline_template_input: $timeline_template_input) {
              template_name
              description
              terms
              percentage_by_term {
                date
                percentage
              }
              status
            }
          }
        `,
        variables: {
          timeline_template_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateTimelineTemplate']));
  }

  UpdateTimelineTemplate(_id, timeline_template_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateTimelineTemplate($_id: ID!, $timeline_template_input: TimelineTemplateInput) {
            UpdateTimelineTemplate(_id: $_id, timeline_template_input: $timeline_template_input) {
              _id
              template_name
              description
              terms
              percentage_by_term {
                date
                percentage
              }
              status
              count_document
            }
          }
        `,
        variables: {
          _id,
          timeline_template_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateTimelineTemplate']));
  }

  CreateProfilRate(profil_rate_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateProfilRate($profil_rate_input: ProfilRateInput) {
            CreateProfilRate(profil_rate_input: $profil_rate_input) {
              name
              description
            }
          }
        `,
        variables: {
          profil_rate_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateProfilRate']));
  }

  UpdateProfilRate(profil_rate_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateProfilRate($profil_rate_input: ProfilRateInput, $_id: ID) {
            UpdateProfilRate(profil_rate_input: $profil_rate_input, _id: $_id) {
              name
              description
            }
          }
        `,
        variables: {
          _id,
          profil_rate_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateProfilRate']));
  }

  CreateAdditionalCost(additional_cost_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateAdditionalCost($additional_cost_input: AdditionalCostInput) {
            CreateAdditionalCost(additional_cost_input: $additional_cost_input) {
              description
            }
          }
        `,
        variables: {
          additional_cost_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateAdditionalCost']));
  }

  UpdateAdditionalCost(additional_cost_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateAdditionalCost($additional_cost_input: AdditionalCostInput, $_id: ID!) {
            UpdateAdditionalCost(additional_cost_input: $additional_cost_input, _id: $_id) {
              description
            }
          }
        `,
        variables: {
          _id,
          additional_cost_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateAdditionalCost']));
  }

  DeleteProfilRate(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteProfilRate($_id: ID) {
            DeleteProfilRate(_id: $_id) {
              description
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteProfilRate']));
  }

  CreateLegalEntity(legal_entity_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateLegalEntity($legal_entity_input: LegalEntityInput) {
            CreateLegalEntity(legal_entity_input: $legal_entity_input) {
              _id
              error {
                error_code
                error_description
                field
                field_name
              }
            }
          }
        `,
        variables: {
          legal_entity_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateLegalEntity']));
  }

  UpdateLegalEntity(legal_entity_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateLegalEntity($legal_entity_input: LegalEntityInput, $_id: ID) {
            UpdateLegalEntity(legal_entity_input: $legal_entity_input, _id: $_id) {
              _id
              error {
                error_code
                error_description
                field
                field_name
              }
            }
          }
        `,
        variables: {
          _id,
          legal_entity_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateLegalEntity']));
  }

  UploadStampLegalEntity(legal_entity_stamp, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UploadStampLegalEntity($legal_entity_stamp: String!, $_id: ID!) {
            UploadStampLegalEntity(legal_entity_stamp: $legal_entity_stamp, _id: $_id) {
              _id
              legal_entity_stamp
            }
          }
        `,
        variables: {
          _id,
          legal_entity_stamp,
        },
      })
      .pipe(map((resp) => resp.data['UploadStampLegalEntity']));
  }

  DeleteLegalEntity(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteLegalEntity($_id: ID) {
            DeleteLegalEntity(_id: $_id) {
              legal_entity_name
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteLegalEntity']));
  }

  GetPCIQuestionairUrl(input): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetPCIQuestionairUrl($input: PciQuestionairInput) {
            GetPCIQuestionairUrl(input: $input) {
              result_code
              psp_reference
              redirect_url
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          input,
        },
      })
      .pipe(map((resp) => resp.data['GetPCIQuestionairUrl']));
  }

  CreateAccountingAccount(input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateAccountingAccount($input: AccountingAccountInput) {
            CreateAccountingAccount(input: $input) {
              account_number
            }
          }
        `,
        variables: {
          input,
        },
      })
      .pipe(map((resp) => resp.data['CreateAccountingAccount']));
  }

  CreateAnalyticalCode(input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateAnalyticalCode($input: AnalyticalCodeInput) {
            CreateAnalyticalCode(input: $input) {
              analytical_code
            }
          }
        `,
        variables: {
          input,
        },
      })
      .pipe(map((resp) => resp.data['CreateAnalyticalCode']));
  }

  CreateScholarSeason(scholar_season_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateScholarSeason($scholar_season_input: ScholarSeasonInput) {
            CreateScholarSeason(scholar_season_input: $scholar_season_input) {
              scholar_season
            }
          }
        `,
        variables: {
          scholar_season_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateScholarSeason']));
  }

  UpdateScholarSeason(scholar_season_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateScholarSeason($scholar_season_input: ScholarSeasonInput, $_id: ID!) {
            UpdateScholarSeason(scholar_season_input: $scholar_season_input, _id: $_id) {
              scholar_season
            }
          }
        `,
        variables: {
          _id,
          scholar_season_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateScholarSeason']));
  }

  CreateSector(sector_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateSector($sector_input: SectorInput) {
            CreateSector(sector_input: $sector_input) {
              _id
              name
            }
          }
        `,
        variables: {
          sector_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateSector']));
  }

  UpdateSector(sector_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateSector($sector_input: SectorInput, $_id: ID!) {
            UpdateSector(sector_input: $sector_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          sector_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateSector']));
  }

  CreateSpecialization(specialization_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateSpecialization($specialization_input: SpecializationInput) {
            CreateSpecialization(specialization_input: $specialization_input) {
              name
            }
          }
        `,
        variables: {
          specialization_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateSpecialization']));
  }

  UpdateSpecialization(specialization_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateSpecialization($specialization_input: SpecializationInput, $_id: ID!) {
            UpdateSpecialization(specialization_input: $specialization_input, _id: $_id) {
              name
            }
          }
        `,
        variables: {
          _id,
          specialization_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateSpecialization']));
  }

  UpdateBilling(billing_input, _id): Observable<any> {
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

  UpdateBillingFromFinanceTable(billing_input, _id, sendNotif): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateBilling($billing_input: BillingInput, $_id: ID, $sendNotif: Boolean, $lang: String) {
            UpdateBilling(billing_input: $billing_input, _id: $_id, send_notif: $sendNotif, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          _id,
          billing_input,
          sendNotif,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['UpdateBilling']));
  }
  updateBillingDialog(billing_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateBilling($billing_input: BillingInput, $_id: ID, $lang: String) {
            UpdateBilling(billing_input: $billing_input, _id: $_id, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          _id,
          billing_input,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['UpdateBilling']));
  }
  UpdateFinanceOrganization(finance_organization_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateFinanceOrganization($finance_organization_input: FinanceOrganizationInput, $_id: ID) {
            UpdateFinanceOrganization(finance_organization_input: $finance_organization_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          finance_organization_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateFinanceOrganization']));
  }

  DeleteScholarSeason(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteScholarSeason($_id: ID!) {
            DeleteScholarSeason(_id: $_id) {
              scholar_season
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteScholarSeason']));
  }

  DeleteSector(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteSector($_id: ID!) {
            DeleteSector(_id: $_id) {
              name
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteSector']));
  }

  DeleteSpecialization(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteSpecialization($_id: ID!) {
            DeleteSpecialization(_id: $_id) {
              name
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteSpecialization']));
  }

  CreateCandidateSchool(candidate_school_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateCandidateSchool($candidate_school_input: CandidateSchoolInput) {
            CreateCandidateSchool(candidate_school_input: $candidate_school_input) {
              short_name
            }
          }
        `,
        variables: {
          candidate_school_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateCandidateSchool']));
  }

  UpdateCandidateSchool(candidate_school_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidateSchool($candidate_school_input: CandidateSchoolInput, $_id: ID) {
            UpdateCandidateSchool(candidate_school_input: $candidate_school_input, _id: $_id) {
              short_name
            }
          }
        `,
        variables: {
          _id,
          candidate_school_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateCandidateSchool']));
  }

  UpdateCandidateSchoolWithScholar(candidate_school_input, _id, scholar_season_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidateSchool($candidate_school_input: CandidateSchoolInput, $_id: ID, $scholar_season_id: ID) {
            UpdateCandidateSchool(candidate_school_input: $candidate_school_input, _id: $_id, scholar_season_id: $scholar_season_id) {
              short_name
            }
          }
        `,
        variables: {
          _id,
          candidate_school_input,
          scholar_season_id,
        },
      })
      .pipe(map((resp) => resp.data['UpdateCandidateSchool']));
  }

  AddPayment(payment_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AddPayment($payment_input: PaymentInput, $_id: ID) {
            AddPayment(payment_input: $payment_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          payment_input,
        },
      })
      .pipe(map((resp) => resp.data['AddPayment']));
  }

  AddPaymentAfterCalculation(payment_input, _id, affected_terms, billing_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AddPayment(
            $payment_input: PaymentInput
            $_id: ID
            $affected_terms: [AffectedTermBillingInput]
            $billing_input: BillingInput
          ) {
            AddPayment(payment_input: $payment_input, _id: $_id, affected_terms: $affected_terms, billing_input: $billing_input) {
              _id
            }
          }
        `,
        variables: {
          _id,
          payment_input,
          affected_terms,
          billing_input,
        },
      })
      .pipe(map((resp) => resp.data['AddPayment']));
  }

  AddPaymentFinanceOrganization(payment_input, _id, terms_affected, finance_organization_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AddPaymentFinanceOrganization(
            $payment_input: PaymentInputFinanceOrganization
            $_id: ID
            $terms_affected: [TermAffectedInput]
            $finance_organization_input: FinanceOrganizationInput
          ) {
            AddPaymentFinanceOrganization(
              payment_input: $payment_input
              _id: $_id
              terms_affected: $terms_affected
              finance_organization_input: $finance_organization_input
            ) {
              _id
            }
          }
        `,
        variables: {
          _id,
          payment_input,
          terms_affected,
          finance_organization_input,
        },
      })
      .pipe(map((resp) => resp.data['AddPaymentFinanceOrganization']));
  }

  DecaissementPayment(payment_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DecaissementPayment($payment_input: PaymentInput, $_id: ID) {
            DecaissementPayment(payment_input: $payment_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          payment_input,
        },
      })
      .pipe(map((resp) => resp.data['DecaissementPayment']));
  }

  RefundPaymentFinanceOrganization(payment_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation RefundPaymentFinanceOrganization($payment_input: PaymentInputFinanceOrganization, $_id: ID) {
            RefundPaymentFinanceOrganization(payment_input: $payment_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          payment_input,
        },
      })
      .pipe(map((resp) => resp.data['RefundPaymentFinanceOrganization']));
  }

  AvoirPayment(payment_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AvoirPayment($payment_input: PaymentInput, $_id: ID) {
            AvoirPayment(payment_input: $payment_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          payment_input,
        },
      })
      .pipe(map((resp) => resp.data['AvoirPayment']));
  }

  AvoirPaymentFinanceOrganization(payment_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AvoirPaymentFinanceOrganization($payment_input: PaymentInputFinanceOrganization, $_id: ID) {
            AvoirPaymentFinanceOrganization(payment_input: $payment_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          payment_input,
        },
      })
      .pipe(map((resp) => resp.data['AvoirPaymentFinanceOrganization']));
  }

  CreateManualAvoir(payment_line_input, billing_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateManualAvoir($payment_line_input: PaymentLineInput!, $billing_id: ID!) {
            CreateManualAvoir(payment_line_input: $payment_line_input, billing_id: $billing_id) {
              _id
            }
          }
        `,
        variables: {
          billing_id,
          payment_line_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateManualAvoir']));
  }

  CreateManualAvoirFinanceOrganization(payment_line_input, finance_organization_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateManualAvoirFinanceOrganization(
            $payment_line_input: PaymentInputFinanceOrganization
            $finance_organization_id: ID
          ) {
            CreateManualAvoirFinanceOrganization(
              payment_line_input: $payment_line_input
              finance_organization_id: $finance_organization_id
            ) {
              _id
            }
          }
        `,
        variables: {
          finance_organization_id,
          payment_line_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateManualAvoirFinanceOrganization']));
  }

  CreateCheque(cheque_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateCheque($cheque_input: ChequeInput) {
            CreateCheque(cheque_input: $cheque_input) {
              _id
            }
          }
        `,
        variables: {
          cheque_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateCheque']));
  }

  getAllLegalEntities(): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllLegalEntities{
            GetAllLegalEntities {
              _id
              legal_entity_name
              account_code
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllLegalEntities']));
  }

  getAllLegalEntitiesDropdownByActiveBilling(): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllLegalEntitiesDropdownByActiveBilling{
            GetLegalEntityDropdownByActiveBilling {
              _id
              legal_entity_name
              account_code
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetLegalEntityDropdownByActiveBilling']));
  }

  getAllLegalEntityByScholar(scholar): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllLegalEntityByScholar{
            GetAllLegalEntities {
              _id
              legal_entity_name
              account_code
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllLegalEntities']));
  }

  getAllLegalEntityPublishByScholar(scholar): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllLegalEntityPublishByScholar{
            GetAllLegalEntities(filter: { online_payment_status: publish }) {
              _id
              legal_entity_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllLegalEntities']));
  }

  DeleteCandidateSchool(_id, scholar): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteCandidateSchool($_id: ID) {
            DeleteCandidateSchool(_id: $_id, scholar_season_id: "${scholar}") {
              short_name
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteCandidateSchool']));
  }

  GetTermProfilRates(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetTermProfilRates{
            GetTermProfilRates
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetTermProfilRates']));
  }

  getAllPaymentModesDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllPaymentModes{
            GetAllPaymentModes {
              _id
              name
              description
              additional_cost
              currency
              payment_date {
                date
                amount
                percentage
              }
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllPaymentModes']));
  }

  getAllPaymentModesByScholar(scholar_season_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllPaymentModes(filter: {scholar_season_id: "${scholar_season_id}"}) {
              _id
              name
              description
              additional_cost
              currency
              payment_date {
                date
                amount
                percentage
              }
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllPaymentModes']));
  }

  GetAllSchool(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool{
            GetAllCandidateSchool {
              _id
              short_name
              long_name
              campuses {
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
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  GetAllSchoolFilter(filter, scholar_season_id, user_type_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($user_type_id: ID) {
            GetAllCandidateSchool(${filter}, scholar_season_id: "${scholar_season_id}", user_type_id: $user_type_id) {
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
                scholar_season_id {
                  _id
                }
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

  GetOneSchoolFilter(id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetOneCandidateSchool(_id: "${id}") {
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
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidateSchool']));
  }

  getOneLegalEntity(_id: string) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query getOneLegalEntity{
            GetOneLegalEntity(_id: "${_id}") {
                _id
                onboard_step
                legal_entity_name
                psp_reference
                account_code
                account_holder_code
                pci_expired_date {
                  date
                  time
                }
                documents {
                  is_success_upload_adyen
                  error
                  psp_reference
                  s3_file_name
                  owner
                  owner_code
                  document_name
                  document_type
                  is_latest
                }
                account_holder_details {
                  phone_number {
                    phone_country_code
                    phone_number
                    phone_type
                  }
                  account_holder_address {
                    country
                    city
                    postal_code
                    street
                    department
                    state_or_province
                    region_name
                    house_number_or_name
                  }
                  business_detail {
                    registration_number
                    legal_business_name
                    signatories {
                      nationality
                      department
                      signatory_address {
                        country
                        city
                        postal_code
                        street
                        state_or_province
                        region_name
                        house_number_or_name
                        email
                        full_phone_number
                      }
                      signatory_name {
                        first_name
                        gender
                        last_name
                      }
                      signatory_job_title
                      signatory_personal_data {
                        date_of_birth
                      }
                      signatory_code
                    }
                    shareholders {
                      first_name
                      email
                      gender
                      last_name
                      country
                      city
                      postal_code
                      street
                      house_number_or_name
                      shareholder_code
                      job_title
                      full_phone_number
                      shareholder_type
                      department
                      region
                      region_name
                      shareholder_personal_data {
                        date_of_birth
                        nationality
                        document_data {
                          expiration_date
                          issuer_country
                          number
                          type
                        }
                      }
                    }
                  }
                  bank_account_details {
                    bank_account_uuid
                    owner_gender
                    owner_name
                    bank_name
                    country_code
                    currency_code
                    iban
                    owner_country_code
                    bank_address
                    postal_code
                    city
                    department
                    region
                    region_name
                  }
                  email
                  merchant_categoy_code
                  web_address
                  phone_number {
                    phone_country_code
                    phone_number
                    phone_type
                  }
                  store_details {
                    full_phone_number
                    mechant_account
                    merchant_category_code
                    store_name
                    store_reference
                    web_address
                    shopper_interaction
                  }
                }
                account_holder_status {
                  status
                  processing_state {
                    disabled
                    processed_from {
                      currency
                      value
                    }
                    processed_to {
                      currency
                      value
                    }
                    tier_number
                  }
                  payout_state {
                    allow_payout
                    payout_limit {
                      currency
                      value
                    }
                    disabled
                    tier_number
                  }
                }
                error {
                  error_code
                  error_description
                  field
                  field_name
                }
                legal_entity
                verification {
                  account_holder {
                    checks {
                      type
                      status
                      requiredFields
                    }
                  }
                  share_holders {
                    checks {
                      type
                      status
                      requiredFields
                    }
                    shareholderCode
                  }
                }
                rib
                immatriculation
                urrsaf_number
                city
                tva_number
                online_payment_status
                urrsaf_city
                bic
                is_need_upload_live
              }
            }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneLegalEntity']));
  }

  checkStatusLegalEntity(_id: string) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query CheckStatusLegalEntity{
            GetOneLegalEntity(_id: "${_id}") {
                _id
                onboard_step
                legal_entity_name
                psp_reference
                account_code
                account_holder_code
                online_payment_status
                account_holder_details {
                  phone_number {
                    phone_country_code
                    phone_number
                    phone_type
                  }
                  business_detail {
                    registration_number
                    legal_business_name
                    signatories {
                      signatory_name {
                        first_name
                      }
                    }
                    shareholders {
                      first_name
                    }
                  }
                  bank_account_details {
                    owner_name
                  }
                }
                error {
                  error_code
                  error_description
                  field
                  field_name
                }
                legal_entity
              }
            }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneLegalEntity']));
  }

  getSchoolAddressBySiretNumber(siret) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetSchoolAddressBySiretNumber{
            GetSchoolAddressBySiretNumber(siret: "${siret}") {
              company_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetSchoolAddressBySiretNumber']));
  }

  getOneSpecialization(_id: string) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetOneSpecialization(
              _id: "${_id}") {
              _id
              name
              programs {
                _id
                program
              }
              description
              sectors {
                _id
                name
              }
              sigli
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneSpecialization']));
  }

  getOneSector(_id: string) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetOneSector(_id: "${_id}") {
                _id
                name
                programs {
                  _id
                  program
                }
                sigli
                description
                scholar_season_id {
                  _id
                }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneSector']));
  }

  getAllSectorsForExisting(name, scholar_season_id) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllSectors(filter: {scholar_season_id: "${scholar_season_id}", name: "${name}"}) {
                _id
                name
                programs {
                  _id
                  program
                }
                sigli
                description
                scholar_season_id {
                  _id
                }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSectors']));
  }

  getAllSpecialityForExisting(name, scholar_season_id) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllSpecializations(filter: {scholar_season_id: "${scholar_season_id}", name: "${name}"}) {
                _id
                name
                programs {
                  _id
                  program
                }
                sectors {
                  _id
                  name
                }
                sigli
                description
                scholar_season_id {
                  _id
                }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSpecializations']));
  }

  getOneScholarSeason(_id: string) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneScholarSeason{
            GetOneScholarSeason(_id: "${_id}") {
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
              is_published
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneScholarSeason']));
  }

  getAllSectorsDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSectors {
            GetAllSectors {
              _id
              name
              description
              sigli
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSectors']));
  }

  getAllSpecializationsDropdownDialog(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllSpecializations {
              name
              description
              sigli
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSpecializations']));
  }

  getAllLegalEntitiesDropdown(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllLegalEntities($filter: LegalEntityFilterInput) {
            GetAllLegalEntities(filter: $filter) {
              _id
              onboard_step
              legal_entity_name
              psp_reference
              account_code
              account_holder_code
              account_holder_details {
                phone_number {
                  phone_country_code
                  phone_number
                  phone_type
                }
                account_holder_address {
                  country
                  city
                  postal_code
                  street
                  department
                  state_or_province
                  house_number_or_name
                }
                business_detail {
                  registration_number
                  legal_business_name
                  signatories {
                    signatory_address {
                      country
                      city
                      postal_code
                      street
                      state_or_province
                      house_number_or_name
                      email
                      full_phone_number
                    }
                    signatory_name {
                      first_name
                      gender
                      last_name
                    }
                    signatory_job_title
                    signatory_personal_data {
                      date_of_birth
                    }
                    signatory_code
                  }
                  shareholders {
                    first_name
                    gender
                    last_name
                    country
                    city
                    postal_code
                    street
                    house_number_or_name
                    shareholder_code
                    shareholder_type
                    shareholder_personal_data {
                      date_of_birth
                      nationality
                      document_data {
                        expiration_date
                        issuer_country
                        number
                        type
                      }
                    }
                  }
                }
                bank_account_details {
                  bank_account_uuid
                  owner_name
                  country_code
                  currency_code
                  iban
                  owner_country_code
                }
                email
                merchant_categoy_code
                web_address
                phone_number {
                  phone_country_code
                  phone_number
                  phone_type
                }
                store_details {
                  full_phone_number
                  mechant_account
                  merchant_category_code
                  store_name
                  store_reference
                  web_address
                  shopper_interaction
                }
              }
              account_holder_status {
                status
                processing_state {
                  disabled
                  processed_from {
                    currency
                    value
                  }
                  processed_to {
                    currency
                    value
                  }
                  tier_number
                }
                payout_state {
                  allow_payout
                  payout_limit {
                    currency
                    value
                  }
                  disabled
                  tier_number
                }
              }
              error {
                error_code
                error_description
                field
                field_name
              }
              legal_entity
              verification {
                account_holder {
                  checks {
                    type
                    status
                    requiredFields
                  }
                }
                share_holders {
                  checks {
                    type
                    status
                    requiredFields
                  }
                  shareholderCode
                }
              }
              rib
              immatriculation
              urrsaf_number
              city
              tva_number
              online_payment_status
              urrsaf_city
              scholar_season_id {
                _id
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllLegalEntities']));
  }

  GetAllAnalyticalCodes(scholar_season_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAnalyticalCodes{
            GetAllAnalyticalCodes (filter: {scholar_season_id: "${scholar_season_id}"}) {
              _id
              analytical_code
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAnalyticalCodes']));
  }

  GetAllAccountingAccounts(scholar_season_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAccountingAccounts{
            GetAllAccountingAccounts (filter: {scholar_season_id: "${scholar_season_id}"}) {
              _id
              account_number
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAccountingAccounts']));
  }

  updateProgramAdmissionFlyer(_id: string, admission_flyer: { document_name: string; s3_file_name: string }) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateProgramAdmissionFlyer($_id: ID, $admission_flyer: ProgramAdmissionFlyerInput) {
            UpdateProgramAdmissionFlyer(_id: $_id, admission_flyer: $admission_flyer) {
              _id
            }
          }
        `,
        variables: {
          _id,
          admission_flyer,
        },
      })
      .pipe(map((resp) => resp.data['UpdateProgramAdmissionFlyer']));
  }

  GenerateBillingFinanceOrganization(select_all, filter, search, finance_organization_ids, user_type_ids?) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GenerateBillingFinanceOrganization(
            $select_all: Boolean
            $filter: FinanceOrganizationFilterInput
            $search: FinanceOrganizationSearchInput
            $finance_organization_ids: [ID]
            $user_type_ids: [ID]
          ) {
            GenerateBillingFinanceOrganization(
              select_all: $select_all
              filter: $filter
              search: $search
              finance_organization_ids: $finance_organization_ids
              user_type_ids: $user_type_ids
            ) {
              _id
            }
          }
        `,
        variables: {
          select_all,
          filter,
          search,
          finance_organization_ids,
          user_type_ids: user_type_ids ? user_type_ids : null,
        },
      })
      .pipe(map((resp) => resp.data['GenerateBillingFinanceOrganization']));
  }

  updateProgram(_id: string, program_input) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateProgram($_id: ID!, $program_input: ProgramInput) {
            UpdateProgram(_id: $_id, program_input: $program_input) {
              _id
            }
          }
        `,
        variables: {
          _id,
          program_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateProgram']));
  }

  UpdateLegalEntityNotPublish(legal_entity_input, _id, is_publish): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateLegalEntity($legal_entity_input: LegalEntityInput, $_id: ID, $is_publish: Boolean) {
            UpdateLegalEntity(legal_entity_input: $legal_entity_input, _id: $_id, is_publish: $is_publish) {
              _id
              error {
                error_code
                error_description
                field
                field_name
              }
            }
          }
        `,
        variables: {
          _id,
          legal_entity_input,
          is_publish,
        },
      })
      .pipe(map((resp) => resp.data['UpdateLegalEntity']));
  }

  UpdateCandidateAnnouncementCall(candidate_ids): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidateAnnouncementCall($candidate_ids: [ID]) {
            UpdateCandidateAnnouncementCall(candidate_ids: $candidate_ids)
          }
        `,
        variables: {
          candidate_ids,
        },
      })
      .pipe(map((resp) => resp.data['UpdateCandidateAnnouncementCall']));
  }

  GetLegalEntityByCandidate(candidate_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetLegalEntityByCandidate($candidate_id: ID!) {
            GetLegalEntityByCandidate(candidate_id: $candidate_id) {
              _id
              legal_entity_name
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

  ImportCandidateData(file_delimiter, file): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ImportCandidateData($file_delimiter: String, $file: Upload!, $lang: String) {
            ImportCandidateData(file_delimiter: $file_delimiter, file: $file, lang: $lang) {
              is_error
              total_imported_candidates
            }
          }
        `,
        variables: {
          file,
          file_delimiter,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['ImportCandidateData']));
  }

  GetAllSectorsDropdownWithoutFilter(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSectors {
            GetAllSectors {
              _id
              name
              programs {
                speciality_id {
                  _id
                  name
                }
              }
              scholar_season_id {
                _id
              }
              school_id {
                _id
              }
              campus_id {
                _id
              }
              level_id {
                _id
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSectors']));
  }
  getAllProgram(filter?) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllPrograms($filter: ProgramFilterInput) {
            GetAllPrograms(filter: $filter) {
              _id
              program
            }
          }
        `,
        variables: {
          filter: filter ? filter : null,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllPrograms']));
  }
  GetListProfileRatesForSameData(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetListProfileRatesForSameData{
            GetAllProfilRates {
              _id
              programs {
                _id
                program
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllProfilRates']));
  }

  downloadDownPaymentTemplateCSV(delimiter, scholarSeasons, schools) {
    const lang = localStorage.getItem('currentLang');
    const API_URL = environment.apiUrl.replace('graphql', '');
    const element = document.createElement('a');
    element.href = `${API_URL}downloadDownPaymentTemplateCSV/${scholarSeasons}/${schools}/${delimiter}/${lang}`;
    element.target = '_blank';
    element.download = 'Student Import CSV';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  downloadTemplateOscarCSV(delimiter) {
    const lang = localStorage.getItem('currentLang');
    const API_URL = environment.apiUrl.replace('graphql', '');
    const element = document.createElement('a');
    element.href = `${API_URL}downloadImportCandidateTemplate/${delimiter}/${lang}`;
    element.target = '_blank';
    element.download = 'Template Oscar CSV';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  downloadFullRateTemplateCSV(delimiter, scholarSeasons, schools) {
    const lang = localStorage.getItem('currentLang');
    const API_URL = environment.apiUrl.replace('graphql', '');
    const element = document.createElement('a');
    element.href = `${API_URL}downloadFullRateTemplateCSV/${scholarSeasons}/${schools}/${delimiter}/${lang}`;
    element.target = '_blank';
    element.download = 'Student Import CSV';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  downloadImportReconciliationCSV(delimiter, date) {
    const lang = localStorage.getItem('currentLang');
    const API_URL = environment.apiUrl.replace('graphql', '');
    const element = document.createElement('a');
    element.href = `${API_URL}downloadImportReconciliationCSV/${date}/${delimiter}/${lang}`;
    element.target = '_blank';
    element.download = 'Student Import CSV';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  downloadGeneralFinanceTemplateCSV(openingDate, closingDate, delimiter, scholarSeasons, schools, campuses, levels) {
    const lang = localStorage.getItem('currentLang');
    const API_URL = environment.apiUrl.replace('graphql', '');
    const element = document.createElement('a');
    element.href = `${API_URL}downloadGeneralFinanceTemplateCSV/${openingDate}/${closingDate}/${delimiter}/${lang}/${scholarSeasons}/${schools}/${campuses}/${levels}`;
    element.target = '_blank';
    element.download = 'Student Import CSV';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  downloadGeneralFinanceN1TemplateCSV(openingDate, closingDate, delimiter, scholarSeasons, schools, campuses, levels) {
    const lang = localStorage.getItem('currentLang');
    const API_URL = environment.apiUrl.replace('graphql', '');
    const element = document.createElement('a');
    element.href = `${API_URL}downloadGeneralFinanceN1TemplateCSV/${openingDate}/${closingDate}/${delimiter}/${lang}/${scholarSeasons}/${schools}/${campuses}/${levels}`;
    element.target = '_blank';
    element.download = 'Student Import CSV';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  // @Cacheable()
  getAlumni(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/alumni.json');
  }
  getAlumniMembers(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/alumni-members.json');
  }
  getAlumniCards(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/alumni-cards.json');
  }
  getDialCodeNumber(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/dial-code.json');
  }

  // GetListProfileRatesForSameData(): Observable<any[]> {
  //   return this.apollo
  //     .watchQuery<any[]>({
  //       query: gql`
  //         query {
  //           GetAllProfilRates {
  //             _id
  //             programs {
  //               _id
  //               program
  //             }
  //           }
  //         }
  //       `,
  //       fetchPolicy: 'network-only',
  //     })
  //     .valueChanges.pipe(map((resp) => resp.data['GetAllProfilRates']));
  // }

  getAllTimelineTemplate(filter, sorting, pagination): Observable<any> {
    return this.apollo
      .watchQuery({
        query: gql`
          query GetAllTimelineTemplate($filter: TimelineTemplateFilter, $sorting: TimelineTemplateSorting, $pagination: PaginationInput) {
            GetAllTimelineTemplate(filter: $filter, sorting: $sorting, pagination: $pagination) {
              _id
              template_name
              description
              terms
              percentage_by_term {
                date
                percentage
              }
              status
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
          sorting,
          pagination,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTimelineTemplate']));
  }

  getAllTimelineName(filter = { template_name: '' }): Observable<any[]> {
    return this.apollo
      .watchQuery<[]>({
        query: gql`
          query GetAllTimelineTemplate($filter: TimelineTemplateFilter) {
            GetAllTimelineTemplate(filter: $filter) {
              _id
              template_name
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTimelineTemplate']));
  }

  // getAllTimelineTemplateList(filter = { template_name: '' }): Observable<any[]> {
  //   return this.apollo
  //     .watchQuery<[]>({
  //       query: gql`
  //         query GetAllTimelineTemplate($filter: TimelineTemplateFilter) {
  //           GetAllTimelineTemplate(filter: $filter) {
  //             _id
  //             template_name
  //             description
  //             terms
  //             percentage_by_term {
  //               date
  //               percentage
  //             }
  //             status
  //             count_document
  //           }
  //         }
  //       `,
  //       fetchPolicy: 'network-only',
  //       variables: {
  //         filter,
  //       },
  //     })
  //     .valueChanges.pipe(map((resp) => resp.data['GetAllTimelineTemplate']));
  // }

  getOneTimelineTemplate(id): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneTimelineTemplate($id: ID) {
            GetOneTimelineTemplate(_id: $id) {
              _id
              template_name
              description
              terms
              percentage_by_term {
                date
                percentage
              }
              status
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          id,
        },
      })
      .pipe(map((resp) => resp.data['GetOneTimelineTemplate']));
  }

  GetAllFinanceTypeOfFormationDropdown(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllFinanceTypeOfFormationDropdown {
            GetAllFinanceTypeOfFormationDropdown {
              _id
              type_of_information
              type_of_formation
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllFinanceTypeOfFormationDropdown']));
  }

  GetAllFinanceIntakeChannelDropdown(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllFinanceIntakeChannelDropdown {
            GetAllFinanceIntakeChannelDropdown {
              _id
              program
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllFinanceIntakeChannelDropdown']));
  }

  GetAllTimelineTemplateNameDropdown(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllTimelineTemplateNameDropdown {
            GetAllTimelineTemplateNameDropdown
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTimelineTemplateNameDropdown']));
  }

  // deleteTimelineTemplate(_id): Observable<any> {
  //   return this.apollo
  //     .mutate({
  //       mutation: gql`
  //         mutation DeleteTimelineTemplate($_id: ID!) {
  //           DeleteTimelineTemplate(_id: $_id)
  //         }
  //         _id
  //         template_name
  //       `,
  //       variables: {
  //         _id,
  //       },
  //     })
  //     .pipe(map((resp) => resp.data['DeleteTimelineTemplate']));
  // }

  deleteTimelineTemplate(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteTimelineTemplate($_id: ID!) {
            DeleteTimelineTemplate(_id: $_id) {
              template_name
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteTimelineTemplate']));
  }

  assignTimelineTemplateData(term_times, terms, select_all, filter, search, finance_organization_ids, user_type_ids?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AssignTimelineTemplateData(
            $term_times: Int
            $terms: [TermInputForFinancialOrganization]
            $select_all: Boolean
            $filter: FinanceOrganizationFilterInput
            $search: FinanceOrganizationSearchInput
            $finance_organization_ids: [ID]
            $user_type_ids: [ID]
          ) {
            AssignTimelineTemplateData(
              term_times: $term_times
              terms: $terms
              select_all: $select_all
              filter: $filter
              search: $search
              finance_organization_ids: $finance_organization_ids
              user_type_ids: $user_type_ids
            ) {
              _id
            }
          }
        `,
        variables: {
          term_times,
          terms,
          select_all,
          filter,
          search,
          finance_organization_ids,
          user_type_ids: user_type_ids ? user_type_ids : null,
        },
      })
      .pipe(map((resp) => resp.data['AssignTimelineTemplateData']));
  }
  getAllBillingDeducationDialog(filter): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllBilling($filter: BillingFilterInput) {
            GetAllBilling(filter: $filter) {
              _id
              candidate_id {
                _id
                civility
                first_name
                last_name
                cost
              }
              terms {
                term_pay_amount
                term_amount_pending
                term_amount
                term_status
              }
              student_type {
                type_of_formation
              }
              deposit
              is_financial_support
              total_amount
              financial_support_info {
                _id
                civility
                family_name
                name
                cost
              }
              student_id {
                _id
                first_name
                last_name
                civility
              }
              financial_supports {
                _id
                civility
                name
                family_name
                cost
              }
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllBilling']));
  }
  updateAdmissionFinancementDialog(_id, admission_financement_input, lang): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateAdmissionFinancement($_id: ID!, $admission_financement_input: AdmissionFinancementInput, $lang: String) {
            UpdateAdmissionFinancement(_id: $_id, admission_financement_input: $admission_financement_input, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          _id,
          admission_financement_input,
          lang,
        },
      })
      .pipe(map((resp) => resp.data['UpdateAdmissionFinancement']));
  }

  CreateAdmissionFinancement(admission_financement_input): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateAdmissionFinancement($admission_financement_input: AdmissionFinancementInput) {
            CreateAdmissionFinancement(admission_financement_input: $admission_financement_input) {
              _id
            }
          }
        `,
        variables: {
          admission_financement_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateAdmissionFinancement']));
  }

  getAllContacts(orgId, filter, sorting, pagination, searching) {
    return this.apollo
      .query({
        query: gql`
          query GetAllContacts(
            $organization_ids: [ID]
            $filter: ContactFilterInput
            $sorting: ContactSortingInput
            $pagination: PaginationInput
            $searching: ContactSearchInput
          ) {
            GetAllContacts(
              organization_ids: $organization_ids
              filter: $filter
              sorting: $sorting
              pagination: $pagination
              searching: $searching
            ) {
              _id
              civility
              first_name
              last_name
              email
              telephone
              status
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          organization_ids: orgId,
          filter,
          sorting,
          pagination,
          searching,
        },
      })
      .pipe(
        map((resp) => {
          return resp.data['GetAllContacts'];
        }),
      );
  }

  getAllOperationLinesNonExportTable(pagination, user_type_ids, sorting, filter) {
    return this.apollo
      .query({
        query: gql`
          query GetAllMasterTableTransactionNonExported(
            $pagination: PaginationInput
            $user_type_ids: [ID]
            $sorting: MasterTransactionSortingInput
            $filter: MasterTransactionFilterInput
            $lang: String
          ) {
            GetAllMasterTableTransaction(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sorting, filter: $filter, lang: $lang) {
              _id
              candidate_id {
                _id
                candidate_unique_number
                first_name
                last_name
                civility
              }
              program_id {
                _id
                program
                scholar_season_id {
                  _id
                  scholar_season
                }
              }
              payment_date
              payment_time
              transaction_id {
                _id
                legal_entity {
                  _id
                  legal_entity_name
                }
              }
              legal_entity_id {
                _id
                legal_entity_name
              }
              term_id
              term_index
              billing_id {
                _id
                terms {
                  _id
                  term_status
                  term_pay_date {
                    date
                    time
                  }
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
              operation_name
              flux
              nature
              debit
              credit
              accounting_document
              balance_date
              balance_time
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
              }
              date_action {
                date
                time
              }
              count_document
              transaction_type
              is_manual_action
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          user_type_ids,
          sorting,
          filter,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['GetAllMasterTableTransaction']));
  }

  getAllOperationLines(pagination, user_type_ids, sorting, filter) {
    return this.apollo
      .query({
        query: gql`
          query GetAllOperationLines(
            $pagination: PaginationInput
            $user_type_ids: [ID]
            $sorting: OperationLineSortingInput
            $filter: OperationLineFilterInput
            $lang: String
          ) {
            GetAllOperationLines(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sorting, filter: $filter, lang: $lang) {
              _id
              candidate_id {
                _id
                candidate_unique_number
                first_name
                last_name
                civility
              }
              initial_program {
                _id
                scholar_season_id {
                  _id
                  scholar_season
                }
                program
              }
              transaction_date
              transaction_time
              transaction_id {
                _id
                legal_entity {
                  _id
                  legal_entity_name
                }
              }
              legal_entity_id {
                _id
                legal_entity_name
              }
              term_id
              term_index
              billing_id {
                _id
                terms {
                  _id
                  term_status
                  term_pay_date {
                    date
                    time
                  }
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
              from
              to
              operation_name
              flux
              nature
              debit
              credit
              account_document
              balance_date {
                date
                time
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
              }
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          user_type_ids,
          sorting,
          filter,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['GetAllOperationLines']));
  }

  GetAllDataForExportSage(pagination, user_type_ids, sorting, filter) {
    return this.apollo
      .query({
        query: gql`
          query GetAllDataForExportSage(
            $pagination: PaginationInput
            $user_type_ids: [ID]
            $sorting: OperationLineSortingInput
            $filter: OperationLineFilterInput
          ) {
            GetAllOperationLines(pagination: $pagination, user_type_ids: $user_type_ids, sorting: $sorting, filter: $filter) {
              _id
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          user_type_ids,
          sorting,
          filter,
        },
      })
      .pipe(map((resp) => resp.data['GetAllOperationLines']));
  }

  GetAllDataForExportLinesToExport(pagination, user_type_ids, sorting, filter) {
    return this.apollo
      .query({
        query: gql`
          query GetAllDataForExportLinesToExport(
            $pagination: PaginationInput
            $user_type_ids: [ID]
            $sorting: OperationLineSortingInput
            $filter: OperationLineFilterInput
          ) {
            GetAllOperationLines(pagination: $pagination, user_type_ids: $user_type_ids, sorting: $sorting, filter: $filter) {
              _id
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          user_type_ids,
          sorting,
          filter,
        },
      })
      .pipe(map((resp) => resp.data['GetAllOperationLines']));
  }

  getAllLegalEntitiesOfOperationLine(export_status) {
    return this.apollo
      .query({
        query: gql`
          query getAllLegalEntitiesOfOperationLine($export_status: EnumExportStatus) {
            GetAllLegalEntitiesOfOperationLine(export_status: $export_status) {
              _id
              legal_entity_name
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          export_status,
        },
      })
      .pipe(map((resp) => resp.data['GetAllLegalEntitiesOfOperationLine']));
  }
  getAllLegalEntitiesOfUnbalancedBalance() {
    return this.apollo
      .query({
        query: gql`
          query getAllLegalEntitiesOfUnbalancedBalance {
            GetAllLegalEntitiesOfUnbalancedBalance {
              _id
              legal_entity_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllLegalEntitiesOfUnbalancedBalance']));
  }
  getAllProgramOfOperationLineUnbalance() {
    return this.apollo
      .query({
        query: gql`
          query getAllProgramOfOperationLine {
            GetAllProgramOfOperationLine {
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetAllProgramOfOperationLine']));
  }
  getAllProgramOfOperationLine(export_status) {
    return this.apollo
      .query({
        query: gql`
          query getAllProgramOfOperationLine($export_status: EnumExportStatus) {
            GetAllProgramOfOperationLine(export_status: $export_status) {
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          export_status,
        },
      })
      .pipe(map((res) => res.data['GetAllProgramOfOperationLine']));
  }

  getAllProgramOfOperationLines() {
    return this.apollo
      .query({
        query: gql`
          query {
            GetAllProgramOfOperationLine {
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetAllProgramOfOperationLine']));
  }

  getAllOperationNameOfOperationLine(export_status) {
    return this.apollo
      .query({
        query: gql`
          query getAllOperationNameOfOperationLine($export_status: EnumExportStatus) {
            GetAllOperationNameOfOperationLine(export_status: $export_status)
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          export_status,
        },
      })
      .pipe(map((res) => res.data['GetAllOperationNameOfOperationLine']));
  }

  getAllUnbalancedBalances(user_type_ids, pagination, filter, sorting, lang) {
    return this.apollo
      .query({
        query: gql`
          query getAllUnbalancedBalances(
            $user_type_ids: [ID]
            $pagination: PaginationInput
            $filter: StudentUnbalanceBalanceFilterInput
            $sorting: StudentUnbalanceBalanceSortingInput
            $lang: String
          ) {
            GetAllUnbalancedBalances(user_type_ids: $user_type_ids, pagination: $pagination, filter: $filter, sorting: $sorting, lang: $lang) {
              _id
              candidate_id {
                _id
                candidate_admission_status
                candidate_unique_number #student number column
                last_name #student name column
                first_name #student name column
                civility #student name column
                intake_channel {
                  _id
                  scholar_season_id {
                    _id
                    scholar_season #program column
                  }
                  program #program column
                }
              }
              legal_entity_id {
                _id
                legal_entity_name #legal entity column
              }
              credit #credit column
              debit #debit column
              balance #balance column
              reason #reason column
              status_table #FLAG
              history_reason {
                reason
                date
              }
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          user_type_ids,
          pagination,
          filter,
          sorting,
          lang
        },
      })
      .pipe(map((resp) => resp.data['GetAllUnbalancedBalances']));
  }

  getAllDataExportUnbalancedBalances(user_type_ids, pagination, filter, sorting) {
    return this.apollo
      .query({
        query: gql`
          query getAllDataExportUnbalancedBalances(
            $user_type_ids: [ID]
            $pagination: PaginationInput
            $filter: StudentUnbalanceBalanceFilterInput
            $sorting: StudentUnbalanceBalanceSortingInput
          ) {
            GetAllUnbalancedBalances(user_type_ids: $user_type_ids, pagination: $pagination, filter: $filter, sorting: $sorting) {
              _id
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          user_type_ids,
          pagination,
          filter,
          sorting,
        },
      })
      .pipe(map((resp) => resp.data['GetAllUnbalancedBalances']));
  }

  createManualBilling(manualBillingInput): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation createManualBilling(
            $billing_id: ID
            $amount: Float
            $payer: String
            $operation_name: String
            $date: DateTimeInput
            $reference: String
            $note: String
          ) {
            CreateManualBilling(
              billing_id: $billing_id
              amount: $amount
              payer: $payer
              operation_name: $operation_name
              date: $date
              reference: $reference
              note: $note
            ) {
              _id
            }
          }
        `,
        variables: {
          billing_id: manualBillingInput?.billing_id,
          amount: manualBillingInput?.amount,
          payer: manualBillingInput?.payer,
          operation_name: manualBillingInput?.operation_name,
          date: {
            date: manualBillingInput?.date,
            time: '15:59',
          },
          reference: manualBillingInput?.reference,
          note: manualBillingInput?.note,
        },
      })
      .pipe(map((resp) => resp.data['CreateManualBilling']));
  }

  createManualBillingFinanceOrganization(manualBillingInput): Observable<any[]> {
    console.log('BILL INPUT: ', manualBillingInput);
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateManualBillingFinanceOrganization(
            $finance_organization_id: ID
            $amount: Float
            $payer: String
            $operation_name: String
            $date: DateTimeInput
            $reference: String
            $note: String
          ) {
            CreateManualBillingFinanceOrganization(
              finance_organization_id: $finance_organization_id
              amount: $amount
              payer: $payer
              operation_name: $operation_name
              date: $date
              reference: $reference
              note: $note
            ) {
              _id
            }
          }
        `,
        variables: {
          finance_organization_id: manualBillingInput?.finance_organization_id,
          amount: manualBillingInput?.amount,
          payer: manualBillingInput?.payer,
          operation_name: manualBillingInput?.operation_name,
          date: {
            date: manualBillingInput?.date,
            time: '15:59',
          },
          reference: manualBillingInput?.reference,
          note: manualBillingInput?.note,
        },
      })
      .pipe(map((resp) => resp.data['CreateManualBillingFinanceOrganization']));
  }

  createManualBillingImprovement(manualBillingInput): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation createManualBillingImprovement(
            $billing_id: ID
            $amount: Float
            $operation_name: String
            $date: DateTimeInput
            $reference: String
            $note: String
            $payers: [PayersInput]
          ) {
            CreateManualBilling(
              billing_id: $billing_id
              amount: $amount
              operation_name: $operation_name
              date: $date
              payers: $payers
              reference: $reference
              note: $note
            ) {
              _id
            }
          }
        `,
        variables: {
          billing_id: manualBillingInput?.billing_id,
          amount: manualBillingInput?.amount,
          operation_name: manualBillingInput?.operation_name,
          date: {
            date: manualBillingInput?.date,
            time: '15:59',
          },
          payers: manualBillingInput?.payers,
          note: manualBillingInput?.note,
          reference: manualBillingInput?.reference,
        },
      })
      .pipe(map((resp) => resp.data['CreateManualBilling']));
  }

  updateManualBillingFinanceOrganization(manualBillingInput): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateManualBillingFinanceOrganization($id: ID, $amount: Float, $operation_name: String, $date: DateTimeInput) {
            UpdateManualBillingFinanceOrganization(_id: $id, amount: $amount, operation_name: $operation_name, date: $date) {
              _id
              note
              reference
            }
          }
        `,
        variables: {
          billing_id: manualBillingInput?.billing_id,
          amount: manualBillingInput?.amount,
          operation_name: manualBillingInput?.operation_name,
          date: {
            date: manualBillingInput?.date,
            time: '15:59',
          },
          payers: manualBillingInput?.payers,
          note: manualBillingInput?.note,
          reference: manualBillingInput?.reference,
        },
      })
      .pipe(map((resp) => resp.data['CreateManualBilling']));
  }

  updateManualBilling(manualBillingInput): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation updateManualBilling($id: ID, $amount: Float, $operation_name: String, $date: DateTimeInput, $payers: [PayersInput]) {
            UpdateManualBilling(_id: $id, amount: $amount, operation_name: $operation_name, date: $date, payers: $payers) {
              _id
            }
          }
        `,
        variables: {
          id: manualBillingInput?.billing_id,
          amount: manualBillingInput?.amount,
          operation_name: manualBillingInput?.operation_name,
          date: {
            date: manualBillingInput?.date,
            time: '15:59',
          },
          payers: manualBillingInput?.payers,
        },
      })
      .pipe(map((resp) => resp.data['UpdateManualBillingFinanceOrganization']));
  }

  deleteManualBilling(id): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation deleteManualBilling($id: ID) {
            DeleteManualBilling(_id: $id) {
              _id
            }
          }
        `,
        variables: {
          id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteManualBilling']));
  }

  deleteManualBillingFinanceOrganization(id): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation deleteManualBillingFinanceOrganization($id: ID) {
            DeleteManualBillingFinanceOrganization(_id: $id) {
              _id
            }
          }
        `,
        variables: {
          id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteManualBillingFinanceOrganization']));
  }

  deletePayment(id): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation deletePayment($id: ID!) {
            RemovePayment(_id: $id) {
              _id
            }
          }
        `,
        variables: {
          id,
        },
      })
      .pipe(map((resp) => resp.data['RemovePayment']));
  }

  sendSchoolContractAmendment(id): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation sendSchoolContractAmendment($id: ID) {
            SendSchoolContractAmendment(balance_id: $id) {
              _id
            }
          }
        `,
        variables: {
          id,
        },
      })
      .pipe(map((resp) => resp.data['SendSchoolContractAmendment']));
  }

  getSchoolContractAmendmentImprovement(candidate_id) {
    return this.apollo
      .query({
        query: gql`
          query getSchoolContractAmendmentImprovement($candidate_id: ID, $lang: String) {
            SendSchoolContractAmendment(candidate_id: $candidate_id, lang: $lang)
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          candidate_id,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['SendSchoolContractAmendment']));
  }

  getInitialLegalEntitas(): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllLegalEntities{
            GetAllLegalEntities {
              _id
              legal_entity_name
              account_code
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllLegalEntities']));
  }

  createManualPaymentLine(manualPaymentInput): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation createManualPaymentLine(
            $billing_id: ID!
            $amount: Float
            $payer: String
            $operation_name: String
            $method_of_payment: String
            $payment_line_inputs: [PaymentLineInput]!
            $reference: String
            $note: String
          ) {
            CreateManualPaymentLine(
              billing_id: $billing_id
              amount: $amount
              payer: $payer
              operation_name: $operation_name
              method_of_payment: $method_of_payment
              payment_line_inputs: $payment_line_inputs
              reference: $reference
              note: $note
            ) {
              _id
            }
          }
        `,
        variables: {
          billing_id: manualPaymentInput?.billing_id,
          operation_name: manualPaymentInput?.operation_name,
          amount: manualPaymentInput?.amount,
          payer: manualPaymentInput?.payer,
          method_of_payment: manualPaymentInput?.method_of_payment,
          payment_line_inputs: manualPaymentInput?.payment_line_inputs,
          reference: manualPaymentInput?.reference,
          note: manualPaymentInput?.note,
        },
      })
      .pipe(map((resp) => resp.data['CreateManualPaymentLine']));
  }

  createManualPaymentLineFinanceOrganization(manualPaymentInput): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateManualPaymentLineFinanceOrganization(
            $finance_organization_id: ID
            $amount: Float
            $payer: String
            $operation_name: String
            $method_of_payment: String
            $payment_line_inputs: [PaymentLineInput]
            $reference: String
            $note: String
          ) {
            CreateManualPaymentLineFinanceOrganization(
              finance_organization_id: $finance_organization_id
              amount: $amount
              payer: $payer
              operation_name: $operation_name
              method_of_payment: $method_of_payment
              payment_line_inputs: $payment_line_inputs
              reference: $reference
              note: $note
            ) {
              _id
            }
          }
        `,
        variables: {
          finance_organization_id: manualPaymentInput?.billing_id,
          operation_name: manualPaymentInput?.operation_name,
          amount: manualPaymentInput?.amount,
          payer: manualPaymentInput?.payer,
          method_of_payment: manualPaymentInput?.method_of_payment,
          payment_line_inputs: manualPaymentInput?.payment_line_inputs,
          reference: manualPaymentInput?.reference,
          note: manualPaymentInput?.note,
        },
      })
      .pipe(map((resp) => resp.data['CreateManualPaymentLineFinanceOrganization']));
  }

  updateManualPaymentLine(updateManualPaymentLine): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation updateManualPaymentLine($master_transaction_id: ID!, $new_amount: Float) {
            UpdateManualPayment(master_transaction_id: $master_transaction_id, new_amount: $new_amount) {
              _id
            }
          }
        `,
        variables: {
          master_transaction_id: updateManualPaymentLine?.master_transaction_id,
          new_amount: updateManualPaymentLine?.new_amount,
        },
      })
      .pipe(map((resp) => resp.data['UpdateManualPayment']));
  }

  removePayment(master_transaction_id): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation deleteManualPayment($master_transaction_id: ID!) {
            DeleteManualPayment(master_transaction_id: $master_transaction_id) {
              _id
            }
          }
        `,
        variables: {
          master_transaction_id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteManualPayment']));
  }
  updateManualPaymentFinanceOrganization(updateManualPaymentLine): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateManualPaymentFinanceOrganization($master_transaction_id: ID, $new_amount: Float) {
            UpdateManualPaymentFinanceOrganization(master_transaction_id: $master_transaction_id, new_amount: $new_amount) {
              _id
            }
          }
        `,
        variables: {
          master_transaction_id: updateManualPaymentLine?.master_transaction_id,
          new_amount: updateManualPaymentLine?.new_amount,
        },
      })
      .pipe(map((resp) => resp.data['UpdateManualPaymentFinanceOrganization']));
  }

  deleteManualPayment(master_transaction_id): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation deleteManualPayment($master_transaction_id: ID!) {
            DeleteManualPayment(master_transaction_id: $master_transaction_id) {
              _id
            }
          }
        `,
        variables: {
          master_transaction_id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteManualPayment']));
  }

  deleteAutomaticPayment(_id): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation RemovePayment($_id: ID!) {
            RemovePayment(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['RemovePayment']));
  }

  deleteManualPaymentFinanceOrganization(master_transaction_id): Observable<any[]> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteManualPaymentFinanceOrganization($master_transaction_id: ID) {
            DeleteManualPaymentFinanceOrganization(master_transaction_id: $master_transaction_id) {
              _id
            }
          }
        `,
        variables: {
          master_transaction_id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteManualPaymentFinanceOrganization']));
  }

  createManualRefund(manual_refund_input) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation createManualRefund($manual_refund_input: ManualRefundInput) {
            CreateManualRefund(manual_refund_input: $manual_refund_input) {
              _id
            }
          }
        `,
        variables: {
          manual_refund_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateManualRefund']));
  }

  createManualRefundFinanceOrganization(manual_refund_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation createManualRefundFinanceOrganization($manual_refund_input: ManualRefundInput) {
            CreateManualRefundFinanceOrganization(manual_refund_input: $manual_refund_input) {
              _id
            }
          }
        `,
        variables: {
          manual_refund_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateManualRefundFinanceOrganization']));
  }

  updateManualRefund(refund) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation updateManualRefund($master_transaction_id: ID!, $new_amount: Float) {
            UpdateManualRefund(master_transaction_id: $master_transaction_id, new_amount: $new_amount) {
              _id
            }
          }
        `,
        variables: {
          master_transaction_id: refund?.master_transaction_id,
          new_amount: refund?.new_amount,
        },
      })
      .pipe(map((resp) => resp.data['UpdateManualRefund']));
  }

  updateManualRefundFinanceOrganization(refund) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation updateManualRefundFinanceOrganization($master_transaction_id: ID!, $new_amount: Float) {
            UpdateManualRefundFinanceOrganization(master_transaction_id: $master_transaction_id, new_amount: $new_amount) {
              _id
            }
          }
        `,
        variables: {
          master_transaction_id: refund?.master_transaction_id,
          new_amount: refund?.new_amount,
        },
      })
      .pipe(map((resp) => resp.data['UpdateManualRefundFinanceOrganization']));
  }

  deleteManualRefund(refund) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation deleteManualRefund($master_transaction_id: ID!, $new_amount: Float) {
            DeleteManualRefund(master_transaction_id: $master_transaction_id, new_amount: $new_amount) {
              _id
            }
          }
        `,
        variables: {
          master_transaction_id: refund?.master_transaction_id,
          new_amount: refund?.new_amount,
        },
      })
      .pipe(map((resp) => resp.data['DeleteManualRefund']));
  }

  deleteManualRefundFinanceOrganization(refund) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation deleteManualRefundFinanceOrganization($master_transaction_id: ID!, $new_amount: Float) {
            DeleteManualRefundFinanceOrganization(master_transaction_id: $master_transaction_id, new_amount: $new_amount) {
              _id
            }
          }
        `,
        variables: {
          master_transaction_id: refund?.master_transaction_id,
          new_amount: refund?.new_amount,
        },
      })
      .pipe(map((resp) => resp.data['DeleteManualRefundFinanceOrganization']));
  }

  createManualAvoir(Billing_id, payment_line_input) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation createManualAvoir($billing_id: ID!, $payment_line_input: PaymentLineInput!) {
            CreateManualAvoir(billing_id: $billing_id, payment_line_input: $payment_line_input) {
              _id
            }
          }
        `,
        variables: {
          billing_id: Billing_id,
          payment_line_input: payment_line_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateManualAvoir']));
  }

  deleteManualAvoir(_id) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation deleteManualAvoir($_id: ID!) {
            DeleteManualAvoir(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteManualAvoir']));
  }

  deleteManualAvoirFinanceOrganization(_id) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteManualAvoirFinanceOrganization($_id: ID) {
            DeleteManualAvoirFinanceOrganization(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteManualAvoirFinanceOrganization']));
  }

  addODCashTransfer(od_input) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation addODCashTransfer($od_input: AddODCashTransferInput) {
            AddODCashTransfer(od_input: $od_input) {
              _id
            }
          }
        `,
        variables: {
          od_input,
        },
      })
      .pipe(map((resp) => resp.data['AddODCashTransfer']));
  }

  editODCashTransfer(id, od_input) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation editODCashTransfer($id: ID!, $od_input: AddODCashTransferInput) {
            EditODCashTransfer(master_transaction_id: $id, od_input: $od_input) {
              _id
            }
          }
        `,
        variables: {
          id,
          od_input,
        },
      })
      .pipe(map((resp) => resp.data['EditODCashTransfer']));
  }

  removeODCashTransfer(id) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation removeODCashTransfer($id: ID!) {
            RemoveODCashTransfer(master_transaction_id: $id) {
              _id
            }
          }
        `,
        variables: {
          id,
        },
      })
      .pipe(map((resp) => resp.data['RemoveODCashTransfer']));
  }

  addODStudentBalanceAdjustement(od_input) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation addODStudentBalanceAdjustement($od_input: CreateOdStudentBalanceAdjustmentInput) {
            AddODStudentBalanceAdjustement(od_student_adjustment_input: $od_input) {
              _id
            }
          }
        `,
        variables: {
          od_input,
        },
      })
      .pipe(map((resp) => resp.data['AddODStudentBalanceAdjustement']));
  }

  addODStudentBalanceAdjustementFinanceOrganization(od_student_adjustment_input) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation addODStudentBalanceAdjustementFinanceOrganization(
            $od_student_adjustment_input: CreateOdStudentBalanceAdjustmentFinanceOrganizationInput
          ) {
            AddODStudentBalanceAdjustementFinanceOrganization(od_student_adjustment_input: $od_student_adjustment_input) {
              _id
            }
          }
        `,
        variables: {
          od_student_adjustment_input,
        },
      })
      .pipe(map((resp) => resp.data['AddODStudentBalanceAdjustementFinanceOrganization']));
  }

  editODStudentBalanceAdjustement(id, od_input) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation editODStudentBalanceAdjustement($id: ID!, $od_input: CreateOdStudentBalanceAdjustmentInput) {
            EditODStudentBalanceAdjustement(master_transaction_id: $id, od_student_adjustment_input: $od_input) {
              _id
            }
          }
        `,
        variables: {
          id,
          od_input,
        },
      })
      .pipe(map((resp) => resp.data['EditODStudentBalanceAdjustement']));
  }

  editODStudentBalanceAdjustementFinanceOrganization(master_transaction_id, od_student_adjustment_input) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation editODStudentBalanceAdjustementFinanceOrganization(
            $master_transaction_id: ID!
            $od_student_adjustment_input: CreateOdStudentBalanceAdjustmentFinanceOrganizationInput
          ) {
            EditODStudentBalanceAdjustementFinanceOrganization(
              master_transaction_id: $master_transaction_id
              od_student_adjustment_input: $od_student_adjustment_input
            ) {
              _id
            }
          }
        `,
        variables: {
          master_transaction_id,
          od_student_adjustment_input,
        },
      })
      .pipe(map((resp) => resp.data['EditODStudentBalanceAdjustementFinanceOrganization']));
  }

  removeStudentBalanceAdjustement(id) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation removeStudentBalanceAdjustement($id: ID!) {
            RemoveStudentBalanceAdjustement(master_transaction_id: $id) {
              _id
            }
          }
        `,
        variables: {
          id,
        },
      })
      .pipe(map((resp) => resp.data['RemoveStudentBalanceAdjustement']));
  }
  GetAllFinanceOrganizationCandidateId(filter): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllFinanceOrganization($filter: FinanceOrganizationFilterInput) {
            GetAllFinanceOrganization(filter: $filter) {
              _id
              candidate_id {
                _id
                last_name
                first_name
                civility
                email
                candidate_admission_status
                registration_profile {
                  is_down_payment
                  discount_on_full_rate
                  additional_cost_ids {
                    _id
                    additional_cost
                    amount
                  }
                }
                selected_payment_plan {
                  additional_expense
                }
                payment_supports {
                  name
                  family_name
                  civility
                  email
                }
              }
              account_number
              company_branch_id {
                _id
                company_name
              }
              organization_id {
                _id
                name
                organization_type
              }
              intake_channel {
                program
              }
              financial_profile
              student_type {
                type_of_information
                type_of_formation
              }
              profil_rate
              is_profil_rate_updated
              payment_method
              financial_supports {
                relation
                family_name
                name
              }
              amount_billed
              amount_paid
              remaining_billed
              amount_late
              accumulated_late
              deposit
              deposit_pay_amount
              deposit_pay_date {
                date
                time
              }
              is_deposit_completed
              overdue
              overdue_not_paid
              is_student_blocked
              terms {
                _id
                term_payment {
                  date
                  time
                }
                term_payment_deferment {
                  date
                  time
                }
                is_term_paid
                term_amount
                term_pay_amount
                term_status
                term_pay_date {
                  date
                  time
                }
                is_partial
                is_locked
              }
              count_document
              term_times
              deposit_status
              organization_name
              organization_type
              total_amount
              admission_financement_id {
                _id
              }
            }
          }
        `,
        variables: { filter },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllFinanceOrganization']));
  }

  checkDisableAddFinancementCadidate(filter): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllBilling($filter: BillingFilterInput) {
            GetAllBilling(filter: $filter) {
              _id
              terms {
                _id
                term_status
              }
              total_amount
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllBilling']));
  }

  checkDisableAddFinancementOrganization(filter): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllFinanceOrganization($filter: FinanceOrganizationFilterInput) {
            GetAllFinanceOrganization(filter: $filter) {
              _id
              terms {
                _id
                term_status
              }
              total_amount
            }
          }
        `,
        variables: { filter },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllFinanceOrganization']));
  }

  getAllProgramOfMasterTransaction() {
    return this.apollo
      .query({
        query: gql`
          query GetProgramDropdownMasterTransaction {
            GetProgramDropdownMasterTransaction {
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetProgramDropdownMasterTransaction']));
  }

  getAllLegalEntitiesOfMasterTransaction() {
    return this.apollo
      .query({
        query: gql`
          query GetLegalEntityDropdownMasterTransaction {
            GetLegalEntityDropdownMasterTransaction {
              _id
              legal_entity_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetLegalEntityDropdownMasterTransaction']));
  }

  getAllOperationNameDropDownMasterTransaction() {
    return this.apollo
      .query({
        query: gql`
          query GetAllOperationNameDropDownMasterTransaction{
            GetOperationNameDropDownMasterTransaction
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetOperationNameDropDownMasterTransaction']));
  }

  getAllMasterTransaction(pagination, user_type_ids, sorting, filter) {
    return this.apollo
      .query({
        query: gql`
          query GetAllMasterTableTransaction(
            $pagination: PaginationInput
            $user_type_ids: [ID]
            $sorting: MasterTransactionSortingInput
            $filter: MasterTransactionFilterInput
            $lang: String
          ) {
            GetAllMasterTableTransaction(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sorting, filter: $filter, lang: $lang) {
              _id
              date_action {
                date
                time
              }
              term_index
              candidate_id {
                _id
                candidate_unique_number
                last_name
                first_name
                civility
                type_of_formation_id {
                  type_of_information
                  type_of_formation
                }
              }
              program_id {
                _id
                program
                scholar_season_id {
                  scholar_season
                }
              }
              legal_entity_id {
                legal_entity_name
              }
              transaction_type
              operation_name
              nature
              flux
              debit
              reference
              note
              credit
              term_index
              user_id {
                last_name
                first_name
                civility
              }
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
                terms {
                  _id
                  is_regulation
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
              transaction_id {
                psp_reference
              }
              transaction_id {
                latest_status
                latest_response
              }
              count_document
              payment_date
              term_affected {
                term_index
                term_id
                amount
                term_payment {
                  date
                  time
                }
                term_pay_date {
                  date
                  time
                }
                payment_source
                term_pay_amount
                is_regulation
              }
              created_at {
                date
                time
              }
              is_manual_action
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          user_type_ids,
          sorting,
          filter,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['GetAllMasterTableTransaction']));
  }

  getAllDataForExportMasterTransaction(pagination, user_type_ids, sorting, filter) {
    return this.apollo
      .query({
        query: gql`
          query GetAllDataForExportMasterTransaction(
            $pagination: PaginationInput
            $user_type_ids: [ID]
            $sorting: MasterTransactionSortingInput
            $filter: MasterTransactionFilterInput
          ) {
            GetAllMasterTableTransaction(pagination: $pagination, user_type_ids: $user_type_ids, sorting: $sorting, filter: $filter) {
              _id
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          user_type_ids,
          sorting,
          filter,
        },
      })
      .pipe(map((resp) => resp.data['GetAllMasterTableTransaction']));
  }
  removeStudentBalanceAdjustementFinanceOrganization(master_transaction_id) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation removeStudentBalanceAdjustementFinanceOrganization($master_transaction_id: ID!) {
            RemoveStudentBalanceAdjustementFinanceOrganization(master_transaction_id: $master_transaction_id) {
              _id
            }
          }
        `,
        variables: {
          master_transaction_id,
        },
      })
      .pipe(map((resp) => resp.data['RemoveStudentBalanceAdjustementFinanceOrganization']));
  }
  getAllBillingContract(filter, sorting?) {
    return this.apollo
      .query({
        query: gql`
          query GetAllBilling($filter: BillingFilterInput, $sorting:BillingSortingInput) {
            GetAllBilling(filter: $filter, sorting: $sorting) {
              _id
              candidate_id {
                _id
                civility
                first_name
                last_name
                candidate_admission_status
                payment
              }
              total_amount
              amount_billed
              amount_paid
              remaining_billed
              deposit
              terms {
                _id
                term_pay_date {
                  date
                  time
                }
                is_term_paid
                term_status
                term_pay_amount
                term_payment {
                  date
                  time
                }
                term_payment_deferment {
                  date
                  time
                }
                term_amount
              }
              is_financial_support
              financial_support_info {
                _id
                civility
                family_name
                name
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
          sorting
        },
      })
      .pipe(map((resp) => resp.data['GetAllBilling']));
  }
}
