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
export class AdmissionDashboardService {
  public resetData: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public scholarSeason: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  setResetStatus(value: boolean) {
    this.resetData.next(value);
  }

  setScholar(value: any) {
    this.scholarSeason.next(value);
  }

  constructor(public httpClient: HttpClient, private apollo: Apollo, private translate: TranslateService) {}

  GetAllGeneralDashboardAdmissionDashboards(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllGeneralDashboardAdmissionDashboards {
              school
              total_registered
              total_target
              percentage_total
              percentage_latest_week
              levels {
                name
                campuses {
                  name
                  total_registered
                  total_target
                  percentage
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllGeneralDashboardAdmissionDashboards']));
  }

  getAllGeneralDashboardFinanceCashIn(financialProfile: string, scholarId?: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
      query GetAllGeneralDashboardFinanceCashIn {
        GetAllGeneralDashboardFinanceCashIn(filter: {
          financial_profile: ${financialProfile}
          ${scholarId ? `scholar_season_id: "${scholarId}"` : ''}
        }) {
          school
          months {
            month
            amount
            paid_amount
          }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllGeneralDashboardFinanceCashIn']));
  }

  GetBillingSummaries(scholarSeason?: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
      query GetBillingSummaries {
        GetBillingSummaries(filter: {
          ${scholarSeason ? `scholar_season: "${scholarSeason}"` : ''}
        }) {
          school_name
          billing
          already_paid
          payment_due
          over_due
          over_due_not_scheduled
          terms_to_come
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetBillingSummaries']));
  }

  GetBillingSummariesTable(schoolId: string, campus: string, scholar?: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
      query GetBillingSummariesTable {
        GetBillingSummariesTable(filter: {
          school_id: "${schoolId}",
          campus: "${campus}"
          ${scholar ? `scholar_season: "${scholar}"` : ''}
        }) {
          level
          billing
          already_paid
          payment_due
          over_due
          over_due_not_scheduled
          terms_to_come
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetBillingSummariesTable']));
  }

  GetAllGeneralDashboardForChart(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllGeneralDashboardForChart {
            GetAllGeneralDashboardAdmissionDashboards(${filter}) {
              school
              total_registered
              total_target
              percentage_total
              percentage_latest_week
              levels {
                name
                campuses {
                  name
                  total_registered
                  total_target
                  percentage
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllGeneralDashboardAdmissionDashboards']));
  }

  GetAllGeneralDashboardFinanceDashboardsN1(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllGeneralDashboardFinanceDashboardsN1 {
              school
              total_paid
              total_target
              percentage_total
              percentage_latest_week
              levels {
                name
                campuses {
                  name
                  total_paid
                  total_target
                  percentage
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllGeneralDashboardFinanceDashboardsN1']));
  }

  GetAllGeneralDashboardFinanceDashboards(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllGeneralDashboardFinanceDashboards {
            GetAllGeneralDashboardFinanceDashboards(${filter}) {
              school
              total_paid
              total_target
              percentage_total
              percentage_latest_week
              levels {
                name
                campuses {
                  name
                  total_paid
                  total_target
                  percentage
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllGeneralDashboardFinanceDashboards']));
  }

  GetAllGeneralDashboardFinanceDashboardsN1Filter(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllGeneralDashboardFinanceDashboardsN1(${filter}) {
              school
              total_paid
              total_target
              percentage_total
              percentage_latest_week
              levels {
                name
                campuses {
                  name
                  total_paid
                  total_target
                  percentage
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllGeneralDashboardFinanceDashboardsN1']));
  }

  GetAllGeneralDashboardFinanceDashboardsFilter(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllGeneralDashboardFinanceDashboards(${filter}) {
              school
              total_paid
              total_target
              percentage_total
              percentage_latest_week
              levels {
                name
                campuses {
                  name
                  total_paid
                  total_target
                  percentage
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllGeneralDashboardFinanceDashboards']));
  }

  GetAllEngagementLevelCalculations(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllEngagementLevelCalculations {
            GetAllEngagementLevelCalculations(${filter}) {
              engagement_level
              total_count
            }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllEngagementLevelCalculations']));
  }

  GetAllGeneralDashboardAdmissions(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllGeneralDashboardAdmissions {
          GetAllGeneralDashboardAdmissions(${filter}) {
            _id
            is_for_all_admission_member
            opening_date
            opening_time
            closing_date
            closing_time
            total_target
            total_registered
            percentage_registered_target
            weekly_progresses {
              week_number
              first_date_of_week
              first_time_of_week
              last_date_of_week
              last_time_of_week
              target_total_accumulated_by_end_of_week
              registration_accumulated_before_week
              registration_this_week
              registration_accumulated_up_today
              percentage_registration_target_accumulated
              percentage_progress_previous_week
            }
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllGeneralDashboardAdmissions']));
  }

  GeneralDashboardFinance(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GeneralDashboardFinance {
          GetAllGeneralDashboardFinances(${filter}) {
            _id
            campus
            school
            level
            intake_channel
            opening_date
            opening_time
            closing_date
            closing_time
            total_target
            total_paid
            percentage_paid_target
            weekly_progresses {
              week_number
              first_date_of_week
              first_time_of_week
              last_date_of_week
              last_time_of_week
              target_total_accumulated_by_end_of_week
              payment_this_week
              payment_accumulated_up_today
              payment_accumulated_before_week
              percentage_payment_target_accumulated
              percentage_progress_previous_week
            }
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllGeneralDashboardFinances']));
  }

  GetAllGeneralDashboardFinancesN1(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query {
          GetAllGeneralDashboardFinancesN1(${filter}) {
            _id
            campus
            school
            level
            intake_channel
            opening_date
            opening_time
            closing_date
            closing_time
            total_target
            total_paid
            percentage_paid_target
            weekly_progresses {
              week_number
              first_date_of_week
              first_time_of_week
              last_date_of_week
              last_time_of_week
              target_total_accumulated_by_end_of_week
              payment_this_week
              payment_accumulated_up_today
              payment_accumulated_before_week
              percentage_payment_target_accumulated
              percentage_progress_previous_week
            }
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllGeneralDashboardFinancesN1 ']));
  }

  GeneralDashboardFinanceCashIn(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query {
          GeneralDashboardFinanceCashIn(${filter}) {
            payment_date
            amount_total
            amount_need_payed
            amount_already_payed
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GeneralDashboardFinanceCashIn ']));
  }

  GetAllGeneralForDP(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query {
          GetAllGeneralDashboardAdmissions(${filter}) {
            _id
            campus
            school
            level
            intake_channel
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllGeneralDashboardAdmissions']));
  }

  GetDataGeneral(admission_member_id, scholarSeason): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetDataGeneral {
            GetAllGeneralDashboardAdmissionDashboards(filter: { admission_member_id: "${admission_member_id}", scholar_season: "${scholarSeason}" }) {
              school
              total_registered
              total_target
              percentage_total
              percentage_latest_week
              levels {
                name
                campuses {
                  name
                  total_registered
                  total_target
                  percentage
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllGeneralDashboardAdmissionDashboards']));
  }

  getCashInTableData(schoolId: string, campus: string, financialProfile?: string, scholarId?: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
      query GetCashInTableData {
        GetAllGeneralDashboardFinanceCashInSchoolTable(filter: {
          school_id: "${schoolId}",
          campus: "${campus}"
          ${financialProfile ? `financial_profile: ${financialProfile}` : ''}
          ${scholarId ? `scholar_season_id: "${scholarId}"` : ''}
        }) {
          level
          months {
            month
            amount
          }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllGeneralDashboardFinanceCashInSchoolTable']));
  }

  GetDataGeneralFinance(scholar_season): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllGeneralDashboardFinanceDashboards {
            GetAllGeneralDashboardFinanceDashboards(filter: { scholar_season: "${scholar_season}" }) {
              school
              total_paid
              total_target
              percentage_total
              percentage_latest_week
              levels {
                name
                campuses {
                  name
                  total_paid
                  total_target
                  percentage
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllGeneralDashboardFinanceDashboards']));
  }

  getEvolutionOverMonths(filter): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
        query GetEvolutionOverMonths {
          GetEvolutionOverMonths(${filter}) {
            date
            amount
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetEvolutionOverMonths']));
  }

  GetDataGeneralFinanceComparatif(scholar_season): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetDataGeneralFinanceComparatif {
            GetAllGeneralDashboardFinances(filter: { scholar_season: "${scholar_season}" }) {
              school
              level
              campus
              total_paid
              total_target
              weekly_progresses{
                payment_this_week
                payment_accumulated_up_today
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllGeneralDashboardFinances']));
  }

  getSummaryPaymentPerYear(): Observable<any[]> {
    return this.apollo
      .query<any[]>({
        query: gql`
          query GetSummaryPaymentPerYear {
            GetSummaryPaymentPerYear {
              scholar_season
              schools {
                school
                total_target
                total_paid
                percentage_paid_target
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetSummaryPaymentPerYear']));
  }

  GetAllSchoolCandidate(short_names, scholar_season_id?, user_type_id?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($short_names: [String], $scholar_season_id: ID, $user_type_id: ID) {
            GetAllCandidateSchool(
              filter: { short_names: $short_names }
              scholar_season_id: $scholar_season_id
              user_type_id: $user_type_id
            ) {
              _id
              short_name
              long_name
              campuses {
                _id
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
                name
                address
                bank {
                  name
                }
              }
              levels {
                _id
                name
                code
              }
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,
        variables: {
          short_names,
          scholar_season_id,
          user_type_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  GetAllSchool(short_names, user_type_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($short_names: [String], $user_type_id: ID) {
            GetAllCandidateSchool(filter: { short_names: $short_names }, user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              campuses {
                levels {
                  name
                  code
                }
                name
              }
              levels {
                name
                code
              }
            }
          }
        `,
        variables: {
          short_names,
          user_type_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  GetAllSchoolSchoolarDropdown(scholar_season_id, user_type_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($scholar_season_id: ID, $user_type_id: ID) {
            GetAllCandidateSchool(filter: { scholar_season_id: $scholar_season_id }, scholar_season_id: "${scholar_season_id}", user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              campuses {
                levels {
                  name
                  code
                }
                name
              }
              levels {
                name
                code
              }
            }
          }
        `,
        variables: {
          scholar_season_id,
          user_type_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  GetAllSchoolScholar(short_names, scholar_season_id, user_type_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($short_names: [String], $user_type_id: ID) {
            GetAllCandidateSchool(filter: { short_names: $short_names, scholar_season_id: "${scholar_season_id}"}, scholar_season_id: "${scholar_season_id}", user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              scholar_season_id {
                _id
                scholar_season
              }
              campuses {
                levels {
                  _id
                  name
                  code
                  specialities {
                    _id
                    name
                    sectors {
                      _id
                      name
                    }
                  }
                }
                _id
                name
              }
              levels {
                _id
                name
                code
              }
            }
          }
        `,
        variables: {
          short_names,
          user_type_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  GetSchoolCampusLevelSectorSpecialityForTable(
    school_id,
    scholar_season_id,
    level_id?,
    sector_id?,
    user_type_id?,
    speciality_id?,
  ): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetSchoolCampusLevelSectorSpecialityForTable(
            $school_id: ID
            $scholar_season_id: ID
            $level_id: ID
            $sector_id: ID
            $speciality_id: ID
            $user_type_id: ID
          ) {
            GetSchoolCampusLevelSectorSpecialityForTable(
              school_id: $school_id
              scholar_season_id: $scholar_season_id
              level_id: $level_id
              sector_id: $sector_id
              speciality_id: $speciality_id
              user_type_id: $user_type_id
            ) {
              school_id {
                _id
                short_name
              }
              campus {
                _id
                name
              }
              level {
                _id
                name
              }
              sector_id {
                _id
                name
              }
              speciality_id {
                _id
                name
                sigli
              }
            }
          }
        `,
        variables: {
          scholar_season_id,
          school_id,
          level_id,
          sector_id,
          speciality_id,
          user_type_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetSchoolCampusLevelSectorSpecialityForTable']));
  }

  GetAllSchoolCandidates(short_name, user_type_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($user_type_id: ID) {
            GetAllCandidateSchool(filter: { short_name: "${short_name}"}, user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              tele_phone
              school_logo
              scholar_season_id {
                _id
                scholar_season
              }
              school_addresses {
                address
                postal_code
                city
                region
                department
                country
              }
              campuses {
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
                _id
                name
                address
                bank {
                  name
                }
              }
              levels {
                _id
                name
                code
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

  GetOneCandidateSchool(id, scholar_season_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneCandidateSchool {
            GetOneCandidateSchool(_id: "${id}", scholar_season_id: "${scholar_season_id}") {
              _id
              short_name
              long_name
              tele_phone
              school_logo
              scholar_season_id {
                _id
                scholar_season
              }
              school_addresses {
                address
                postal_code
                city
                region
                department
                country
              }
              campuses (scholar_season_id: "${scholar_season_id}") {
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
                _id
                name
                address
                bank {
                  name
                }
              }
              levels {
                _id
                name
                code
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidateSchool']));
  }

  GetAllSchoolCandidatesWithScholar(short_name, scholar_season_id, user_type_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($user_type_id: ID){
            GetAllCandidateSchool(filter: { short_name: "${short_name}" }, scholar_season_id: "${scholar_season_id}", user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              tele_phone
              school_logo
              scholar_season_id {
                _id
                scholar_season
              }
              school_addresses {
                address
                postal_code
                city
                region
                department
                country
              }
              campuses {
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
                _id
                name
                address
                bank {
                  name
                }
              }
              levels {
                _id
                name
                code
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

  GetAllEngagementLevelProgresses(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllEngagementLevelProgresses {
            GetAllEngagementLevelProgresses {
              school
              engagement_levels {
                status
                total
                target
                percentage
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllEngagementLevelProgresses']));
  }

  GetAllCandidateSchool(user_type_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($user_type_id: ID) {
            GetAllCandidateSchool(filter: { short_name: "" }, user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              campuses {
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
                name
                address
                bank {
                  name
                }
              }
              levels {
                name
                code
                description
                extra_fees {
                  name
                  amount
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

  createVolumeHour(volume_hour_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateVolumeHour($volume_hour_input: VolumeHourInput) {
            CreateVolumeHour(volume_hour_input: $volume_hour_input) {
              _id
            }
          }
        `,
        variables: {
          volume_hour_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateVolumeHour']));
  }

  getAllTypeOfInformationDropdown(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllTypeOfInformation($filter: TypeOfInformationFilterInput) {
            GetAllTypeOfInformation(filter: $filter) {
              _id
              type_of_information
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTypeOfInformation']));
  }

  getAllAdditionalCostsDropdown(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAdditionalCosts($filter: AdditionalCostFilterInput) {
            GetAllAdditionalCosts(filter: $filter) {
              additional_cost
              _id
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAdditionalCosts']));
  }

  getAllAdditionalCostsByScholar(scholar_season_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllAdditionalCosts(filter: {scholar_season_id: "${scholar_season_id}"}) {
              additional_cost
              _id
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAdditionalCosts']));
  }

  getAllProfilRatesDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllProfilRates {
            GetAllProfilRates {
              _id
              name
              description
              is_down_payment
              discount_on_full_rate
              other_currency
              other_amount
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
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllProfilRates']));
  }

  getAllProfilRatesByScholar(scholar_season_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllProfilRates {
            GetAllProfilRates(filter: {scholar_season_id: "${scholar_season_id}"}) {
              _id
              name
              description
              is_down_payment
              discount_on_full_rate
              other_currency
              other_amount
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
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllProfilRates']));
  }

  GetAllAccountingAccountsDropdown(filter): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAccountingAccounts($filter: AccountingAccountFilterInput) {
            GetAllAccountingAccounts(filter: $filter) {
              _id
              account_number
              candidate_schools {
                _id
                short_name
              }
              levels {
                _id
                name
              }
              sectors {
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
      .valueChanges.pipe(map((resp) => resp.data['GetAllAccountingAccounts']));
  }

  GetAllAccountingAccounts(): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAccountingAccounts {
            GetAllAccountingAccounts {
              _id
              account_number
              candidate_schools {
                _id
                short_name
              }
              levels {
                _id
                name
              }
              sectors {
                _id
                name
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAccountingAccounts']));
  }

  createProfilRate(profil_rate_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateProfilRate($profil_rate_input: ProfilRateInput) {
            CreateProfilRate(profil_rate_input: $profil_rate_input) {
              _id
            }
          }
        `,
        variables: {
          profil_rate_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateProfilRate']));
  }

  updateProfilRate(_id, profil_rate_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateProfilRate($_id: ID!, $profil_rate_input: ProfilRateInput) {
            UpdateProfilRate(_id: $_id, profil_rate_input: $profil_rate_input) {
              _id
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

  UpdateManyLegalEntity(_ids, input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateManyLegalEntity($_ids: [ID], $input: LegalEntityInput) {
            UpdateManyLegalEntity(_ids: $_ids, input: $input) {
              _id
            }
          }
        `,
        variables: {
          _ids,
          input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateManyLegalEntity']));
  }

  UpdateLegalEntityPublish(_id, input, is_publish): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateLegalEntity($_id: ID, $input: LegalEntityInput, $is_publish: Boolean) {
            UpdateLegalEntity(_id: $_id, legal_entity_input: $input, is_publish: $is_publish) {
              _id
            }
          }
        `,
        variables: {
          _id,
          input,
          is_publish,
        },
      })
      .pipe(map((resp) => resp.data['UpdateLegalEntity']));
  }

  GetAllEngagementLevel(filter, user_type_id?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllEngagement($user_type_id: ID) {
            GetAllEngagementLevelProgresses(${filter}, user_type_id: $user_type_id) {
              _id
              school
              count
              percentage
              total_objective
              candidate_admission_statuses {
                candidate_admission_status
                count
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          user_type_id,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllEngagementLevelProgresses']));
  }

  GetGeneralData(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetGeneralData($filter: GeneralDashboardAdmissionDashboardFilterInput) {
            GetAllGeneralDashboardAdmissionDashboards(filter: $filter) {
              school {
                _id
                short_name
              }
              total_registered
              total_target
              percentage_total
              percentage_latest_week
              levels {
                name
                sector {
                  _id
                  name
                }
                speciality {
                  _id
                  name
                }
                campuses {
                  name
                  total_registered
                  total_target
                  percentage
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllGeneralDashboardAdmissionDashboards']));
  }

  GetAllAdmissionChart(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAdmissionChart {
            GetAllGeneralDashboardAdmissionDashboards(${filter}) {
              school {
                _id
                short_name
              }
              total_registered
              total_target
              percentage_total
              percentage_latest_week
              levels {
                name
                campuses {
                  name
                  total_registered
                  total_target
                  percentage
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllGeneralDashboardAdmissionDashboards']));
  }

  GetCountCandidatePerNationality(
    scholar_season_id,
    school_id,
    campus_id,
    level_id,
    sector_id,
    speciality_id,
    user_type_id,
    is_speciality?,
  ): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetCountCandidatePerNationality(
            $scholar_season_id: ID
            $school_id: ID
            $campus_id: ID
            $level_id: ID
            $sector_id: ID
            $speciality_id: ID
            $user_type_id: ID
            $is_speciality: Boolean
          ) {
            GetCountCandidatePerNationality(
              scholar_season_id: $scholar_season_id
              school_id: $school_id
              campus_id: $campus_id
              level_id: $level_id
              sector_id: $sector_id
              speciality_id: $speciality_id
              user_type_id: $user_type_id
              is_speciality: $is_speciality
            ) {
              nationality
              candidate_counter
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          scholar_season_id,
          school_id,
          campus_id,
          level_id,
          sector_id,
          speciality_id,
          user_type_id,
          is_speciality,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetCountCandidatePerNationality']));
  }

  getRegisteredCandidatePerWeek(
    scholar_season_id,
    school_id,
    campus_id,
    level_id,
    sector_id,
    speciality_id,
    user_type_id,
    is_speciality?,
  ): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetRegisteredCandidatePerWeek(
            $scholar_season_id: ID
            $school_id: ID
            $campus_id: ID
            $level_id: ID
            $sector_id: ID
            $speciality_id: ID
            $user_type_id: ID
            $is_speciality: Boolean
          ) {
            GetRegisteredCandidatePerWeek(
              scholar_season_id: $scholar_season_id
              school_id: $school_id
              campus_id: $campus_id
              level_id: $level_id
              sector_id: $sector_id
              speciality_id: $speciality_id
              is_speciality: $is_speciality
              user_type_id: $user_type_id
            ) {
              start_date
              percentage
              real_count
              objective
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          scholar_season_id,
          school_id,
          campus_id,
          level_id,
          sector_id,
          speciality_id,
          user_type_id,
          is_speciality,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetRegisteredCandidatePerWeek']));
  }

  getTotalRegisteredCandidate(
    scholar_season_id,
    school_id,
    campus_id,
    level_id,
    sector_id,
    speciality_id,
    user_type_id,
    is_speciality?,
  ): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetTotalRegisteredCandidate(
            $scholar_season_id: ID
            $school_id: ID
            $campus_id: ID
            $level_id: ID
            $sector_id: ID
            $speciality_id: ID
            $user_type_id: ID
            $is_speciality: Boolean
          ) {
            GetTotalRegisteredCandidate(
              scholar_season_id: $scholar_season_id
              school_id: $school_id
              campus_id: $campus_id
              level_id: $level_id
              sector_id: $sector_id
              speciality_id: $speciality_id
              user_type_id: $user_type_id
              is_speciality: $is_speciality
            ) {
              name
              counter
              objective
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          scholar_season_id,
          school_id,
          campus_id,
          level_id,
          sector_id,
          speciality_id,
          user_type_id,
          is_speciality,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetTotalRegisteredCandidate']));
  }

  GetRegisteredCandidatePerDay(
    scholar_season_id,
    school_id,
    campus_id,
    level_id,
    sector_id,
    speciality_id,
    period_start,
    period_end,
    user_type_id,
    is_speciality?,
  ): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetRegisteredCandidatePerDay(
            $scholar_season_id: ID
            $school_id: ID
            $campus_id: ID
            $level_id: ID
            $sector_id: ID
            $speciality_id: ID
            $user_type_id: ID
            $period_start: String
            $period_end: String
            $is_speciality: Boolean
          ) {
            GetRegisteredCandidatePerDay(
              scholar_season_id: $scholar_season_id
              school_id: $school_id
              campus_id: $campus_id
              level_id: $level_id
              sector_id: $sector_id
              speciality_id: $speciality_id
              period_start: $period_start
              period_end: $period_end
              user_type_id: $user_type_id
              is_speciality: $is_speciality
            ) {
              date
              candidate_counter
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          scholar_season_id,
          school_id,
          campus_id,
          level_id,
          sector_id,
          speciality_id,
          period_start,
          period_end,
          user_type_id,
          is_speciality,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetRegisteredCandidatePerDay']));
  }

  GetAllAdmissionGeneralDashboard(filter, scholarSeason): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllAdmissionGeneralDashboard {
          GetAllGeneralDashboardAdmissions(${filter}) {
            _id
            is_for_all_admission_member
            opening_date
            opening_time
            closing_date
            closing_time
            total_target
            total_registered
            percentage_registered_target
            weekly_progresses {
              week_number
              first_date_of_week
              first_time_of_week
              last_date_of_week
              last_time_of_week
              target_total_accumulated_by_end_of_week
              registration_accumulated_before_week
              registration_this_week
              registration_accumulated_up_today
              percentage_registration_target_accumulated
            }
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllGeneralDashboardAdmissions']));
  }

  GetTotalRegisteredPerProgram(scholar_season_id, school_id, level_id?, sector_id?, user_type_id?, speciality_id?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetTotalRegisteredPerProgram(
            $scholar_season_id: ID
            $school_id: ID
            $level_id: ID
            $sector_id: ID
            $speciality_id: ID
            $user_type_id: ID
          ) {
            GetTotalRegisteredPerProgram(
              scholar_season_id: $scholar_season_id
              school_id: $school_id
              level_id: $level_id
              sector_id: $sector_id
              speciality_id: $speciality_id
              user_type_id: $user_type_id
            ) {
              school_id {
                _id
                short_name
              }
              scholar_season_id {
                _id
                scholar_season
              }
              campus {
                _id
                name
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
                sigli
              }
              counter
              objective
              percentage
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          scholar_season_id,
          school_id,
          level_id,
          sector_id,
          speciality_id,
          user_type_id,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetTotalRegisteredPerProgram']));
  }

  GetAllSchoolCandidatesUserType(user_type_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($user_type_id: ID) {
            GetAllCandidateSchool(user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              tele_phone
              school_logo
              scholar_season_id {
                _id
                scholar_season
              }
              school_addresses {
                address
                postal_code
                city
                region
                department
                country
              }
              campuses {
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
                _id
                name
                address
                bank {
                  name
                }
              }
              levels {
                _id
                name
                code
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
}
