"use strict";(self.webpackChunkGene=self.webpackChunkGene||[]).push([[8739],{8739:(v,m,_)=>{_.d(m,{Q:()=>$});var h=_(591),t=_(13125),l=_(24850),p=_(94650),y=_(80529),g=_(18497),G=_(89383);let $=(()=>{class u{constructor(e,a,o){this.httpClient=e,this.apollo=a,this.translate=o,this.resetData=new h.X(!1),this.scholarSeason=new h.X(null)}setResetStatus(e){this.resetData.next(e)}setScholar(e){this.scholarSeason.next(e)}GetAllGeneralDashboardAdmissionDashboards(){return this.apollo.watchQuery({query:t.ZP`
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(e=>e.data.GetAllGeneralDashboardAdmissionDashboards))}getAllGeneralDashboardFinanceCashIn(e,a){return this.apollo.query({query:t.ZP`
      query GetAllGeneralDashboardFinanceCashIn {
        GetAllGeneralDashboardFinanceCashIn(filter: {
          financial_profile: ${e}
          ${a?`scholar_season_id: "${a}"`:""}
        }) {
          school
          months {
            month
            amount
            paid_amount
          }
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(o=>o.data.GetAllGeneralDashboardFinanceCashIn))}GetBillingSummaries(e){return this.apollo.query({query:t.ZP`
      query GetBillingSummaries {
        GetBillingSummaries(filter: {
          ${e?`scholar_season: "${e}"`:""}
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
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetBillingSummaries))}GetBillingSummariesTable(e,a,o){return this.apollo.query({query:t.ZP`
      query GetBillingSummariesTable {
        GetBillingSummariesTable(filter: {
          school_id: "${e}",
          campus: "${a}"
          ${o?`scholar_season: "${o}"`:""}
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
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(i=>i.data.GetBillingSummariesTable))}GetAllGeneralDashboardForChart(e){return this.apollo.watchQuery({query:t.ZP`
          query GetAllGeneralDashboardForChart {
            GetAllGeneralDashboardAdmissionDashboards(${e}) {
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(a=>a.data.GetAllGeneralDashboardAdmissionDashboards))}GetAllGeneralDashboardFinanceDashboardsN1(){return this.apollo.watchQuery({query:t.ZP`
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(e=>e.data.GetAllGeneralDashboardFinanceDashboardsN1))}GetAllGeneralDashboardFinanceDashboards(e){return this.apollo.watchQuery({query:t.ZP`
          query GetAllGeneralDashboardFinanceDashboards {
            GetAllGeneralDashboardFinanceDashboards(${e}) {
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(a=>a.data.GetAllGeneralDashboardFinanceDashboards))}GetAllGeneralDashboardFinanceDashboardsN1Filter(e){return this.apollo.watchQuery({query:t.ZP`
          query {
            GetAllGeneralDashboardFinanceDashboardsN1(${e}) {
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(a=>a.data.GetAllGeneralDashboardFinanceDashboardsN1))}GetAllGeneralDashboardFinanceDashboardsFilter(e){return this.apollo.watchQuery({query:t.ZP`
          query {
            GetAllGeneralDashboardFinanceDashboards(${e}) {
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(a=>a.data.GetAllGeneralDashboardFinanceDashboards))}GetAllEngagementLevelCalculations(e){return this.apollo.watchQuery({query:t.ZP`
          query GetAllEngagementLevelCalculations {
            GetAllEngagementLevelCalculations(${e}) {
              engagement_level
              total_count
            }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(a=>a.data.GetAllEngagementLevelCalculations))}GetAllGeneralDashboardAdmissions(e){return this.apollo.watchQuery({query:t.ZP`
        query GetAllGeneralDashboardAdmissions {
          GetAllGeneralDashboardAdmissions(${e}) {
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(a=>a.data.GetAllGeneralDashboardAdmissions))}GeneralDashboardFinance(e){return this.apollo.watchQuery({query:t.ZP`
        query GeneralDashboardFinance {
          GetAllGeneralDashboardFinances(${e}) {
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(a=>a.data.GetAllGeneralDashboardFinances))}GetAllGeneralDashboardFinancesN1(e){return this.apollo.watchQuery({query:t.ZP`
        query {
          GetAllGeneralDashboardFinancesN1(${e}) {
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(a=>a.data["GetAllGeneralDashboardFinancesN1 "]))}GeneralDashboardFinanceCashIn(e){return this.apollo.watchQuery({query:t.ZP`
        query {
          GeneralDashboardFinanceCashIn(${e}) {
            payment_date
            amount_total
            amount_need_payed
            amount_already_payed
          }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(a=>a.data["GeneralDashboardFinanceCashIn "]))}GetAllGeneralForDP(e){return this.apollo.watchQuery({query:t.ZP`
        query {
          GetAllGeneralDashboardAdmissions(${e}) {
            _id
            campus
            school
            level
            intake_channel
          }
        }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(a=>a.data.GetAllGeneralDashboardAdmissions))}GetDataGeneral(e,a){return this.apollo.watchQuery({query:t.ZP`
          query GetDataGeneral {
            GetAllGeneralDashboardAdmissionDashboards(filter: { admission_member_id: "${e}", scholar_season: "${a}" }) {
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(o=>o.data.GetAllGeneralDashboardAdmissionDashboards))}getCashInTableData(e,a,o,i){return this.apollo.query({query:t.ZP`
      query GetCashInTableData {
        GetAllGeneralDashboardFinanceCashInSchoolTable(filter: {
          school_id: "${e}",
          campus: "${a}"
          ${o?`financial_profile: ${o}`:""}
          ${i?`scholar_season_id: "${i}"`:""}
        }) {
          level
          months {
            month
            amount
          }
        }
      }
      `,fetchPolicy:"network-only"}).pipe((0,l.U)(s=>s.data.GetAllGeneralDashboardFinanceCashInSchoolTable))}GetDataGeneralFinance(e){return this.apollo.watchQuery({query:t.ZP`
          query GetAllGeneralDashboardFinanceDashboards {
            GetAllGeneralDashboardFinanceDashboards(filter: { scholar_season: "${e}" }) {
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(a=>a.data.GetAllGeneralDashboardFinanceDashboards))}getEvolutionOverMonths(e){return this.apollo.query({query:t.ZP`
        query GetEvolutionOverMonths {
          GetEvolutionOverMonths(${e}) {
            date
            amount
          }
        }
        `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetEvolutionOverMonths))}GetDataGeneralFinanceComparatif(e){return this.apollo.query({query:t.ZP`
          query GetDataGeneralFinanceComparatif {
            GetAllGeneralDashboardFinances(filter: { scholar_season: "${e}" }) {
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
        `,fetchPolicy:"network-only"}).pipe((0,l.U)(a=>a.data.GetAllGeneralDashboardFinances))}getSummaryPaymentPerYear(){return this.apollo.query({query:t.ZP`
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
        `,fetchPolicy:"network-only"}).pipe((0,l.U)(e=>e.data.GetSummaryPaymentPerYear))}GetAllSchoolCandidate(e,a,o){return this.apollo.watchQuery({query:t.ZP`
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
        `,variables:{short_names:e,scholar_season_id:a,user_type_id:o},fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(i=>i.data.GetAllCandidateSchool))}GetAllSchool(e,a){return this.apollo.watchQuery({query:t.ZP`
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
        `,variables:{short_names:e,user_type_id:a},fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(o=>o.data.GetAllCandidateSchool))}GetAllSchoolSchoolarDropdown(e,a){return this.apollo.watchQuery({query:t.ZP`
          query GetAllCandidateSchool($scholar_season_id: ID, $user_type_id: ID) {
            GetAllCandidateSchool(filter: { scholar_season_id: $scholar_season_id }, scholar_season_id: "${e}", user_type_id: $user_type_id) {
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
        `,variables:{scholar_season_id:e,user_type_id:a},fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(o=>o.data.GetAllCandidateSchool))}GetAllSchoolScholar(e,a,o){return this.apollo.watchQuery({query:t.ZP`
          query GetAllCandidateSchool($short_names: [String], $user_type_id: ID) {
            GetAllCandidateSchool(filter: { short_names: $short_names, scholar_season_id: "${a}"}, scholar_season_id: "${a}", user_type_id: $user_type_id) {
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
        `,variables:{short_names:e,user_type_id:o},fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(i=>i.data.GetAllCandidateSchool))}GetSchoolCampusLevelSectorSpecialityForTable(e,a,o,i,s,n){return this.apollo.watchQuery({query:t.ZP`
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
        `,variables:{scholar_season_id:a,school_id:e,level_id:o,sector_id:i,speciality_id:n,user_type_id:s},fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(r=>r.data.GetSchoolCampusLevelSectorSpecialityForTable))}GetAllSchoolCandidates(e,a){return this.apollo.watchQuery({query:t.ZP`
          query GetAllCandidateSchool($user_type_id: ID) {
            GetAllCandidateSchool(filter: { short_name: "${e}"}, user_type_id: $user_type_id) {
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
        `,fetchPolicy:"network-only",variables:{user_type_id:a}}).valueChanges.pipe((0,l.U)(o=>o.data.GetAllCandidateSchool))}GetOneCandidateSchool(e,a){return this.apollo.watchQuery({query:t.ZP`
          query GetOneCandidateSchool {
            GetOneCandidateSchool(_id: "${e}", scholar_season_id: "${a}") {
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
              campuses (scholar_season_id: "${a}") {
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(o=>o.data.GetOneCandidateSchool))}GetAllSchoolCandidatesWithScholar(e,a,o){return this.apollo.watchQuery({query:t.ZP`
          query GetAllCandidateSchool($user_type_id: ID){
            GetAllCandidateSchool(filter: { short_name: "${e}" }, scholar_season_id: "${a}", user_type_id: $user_type_id) {
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
        `,fetchPolicy:"network-only",variables:{user_type_id:o}}).valueChanges.pipe((0,l.U)(i=>i.data.GetAllCandidateSchool))}GetAllEngagementLevelProgresses(){return this.apollo.watchQuery({query:t.ZP`
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(e=>e.data.GetAllEngagementLevelProgresses))}GetAllCandidateSchool(e){return this.apollo.watchQuery({query:t.ZP`
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
        `,fetchPolicy:"network-only",variables:{user_type_id:e}}).valueChanges.pipe((0,l.U)(a=>a.data.GetAllCandidateSchool))}createVolumeHour(e){return this.apollo.mutate({mutation:t.ZP`
          mutation CreateVolumeHour($volume_hour_input: VolumeHourInput) {
            CreateVolumeHour(volume_hour_input: $volume_hour_input) {
              _id
            }
          }
        `,variables:{volume_hour_input:e}}).pipe((0,l.U)(a=>a.data.CreateVolumeHour))}getAllTypeOfInformationDropdown(e){return this.apollo.watchQuery({query:t.ZP`
          query GetAllTypeOfInformation($filter: TypeOfInformationFilterInput) {
            GetAllTypeOfInformation(filter: $filter) {
              _id
              type_of_information
            }
          }
        `,fetchPolicy:"network-only",variables:{filter:e}}).valueChanges.pipe((0,l.U)(a=>a.data.GetAllTypeOfInformation))}getAllAdditionalCostsDropdown(e){return this.apollo.watchQuery({query:t.ZP`
          query GetAllAdditionalCosts($filter: AdditionalCostFilterInput) {
            GetAllAdditionalCosts(filter: $filter) {
              additional_cost
              _id
            }
          }
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(a=>a.data.GetAllAdditionalCosts))}getAllAdditionalCostsByScholar(e){return this.apollo.watchQuery({query:t.ZP`
          query {
            GetAllAdditionalCosts(filter: {scholar_season_id: "${e}"}) {
              additional_cost
              _id
            }
          }
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(a=>a.data.GetAllAdditionalCosts))}getAllProfilRatesDropdown(){return this.apollo.watchQuery({query:t.ZP`
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(e=>e.data.GetAllProfilRates))}getAllProfilRatesByScholar(e){return this.apollo.watchQuery({query:t.ZP`
          query GetAllProfilRates {
            GetAllProfilRates(filter: {scholar_season_id: "${e}"}) {
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(a=>a.data.GetAllProfilRates))}GetAllAccountingAccountsDropdown(e){return this.apollo.watchQuery({query:t.ZP`
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
        `,variables:{filter:e},fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(a=>a.data.GetAllAccountingAccounts))}GetAllAccountingAccounts(){return this.apollo.watchQuery({query:t.ZP`
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(e=>e.data.GetAllAccountingAccounts))}createProfilRate(e){return this.apollo.mutate({mutation:t.ZP`
          mutation CreateProfilRate($profil_rate_input: ProfilRateInput) {
            CreateProfilRate(profil_rate_input: $profil_rate_input) {
              _id
            }
          }
        `,variables:{profil_rate_input:e}}).pipe((0,l.U)(a=>a.data.CreateProfilRate))}updateProfilRate(e,a){return this.apollo.mutate({mutation:t.ZP`
          mutation UpdateProfilRate($_id: ID!, $profil_rate_input: ProfilRateInput) {
            UpdateProfilRate(_id: $_id, profil_rate_input: $profil_rate_input) {
              _id
            }
          }
        `,variables:{_id:e,profil_rate_input:a}}).pipe((0,l.U)(o=>o.data.UpdateProfilRate))}UpdateManyLegalEntity(e,a){return this.apollo.mutate({mutation:t.ZP`
          mutation UpdateManyLegalEntity($_ids: [ID], $input: LegalEntityInput) {
            UpdateManyLegalEntity(_ids: $_ids, input: $input) {
              _id
            }
          }
        `,variables:{_ids:e,input:a}}).pipe((0,l.U)(o=>o.data.UpdateManyLegalEntity))}UpdateLegalEntityPublish(e,a,o){return this.apollo.mutate({mutation:t.ZP`
          mutation UpdateLegalEntity($_id: ID, $input: LegalEntityInput, $is_publish: Boolean) {
            UpdateLegalEntity(_id: $_id, legal_entity_input: $input, is_publish: $is_publish) {
              _id
            }
          }
        `,variables:{_id:e,input:a,is_publish:o}}).pipe((0,l.U)(i=>i.data.UpdateLegalEntity))}GetAllEngagementLevel(e,a){return this.apollo.watchQuery({query:t.ZP`
          query GetAllEngagement($user_type_id: ID) {
            GetAllEngagementLevelProgresses(${e}, user_type_id: $user_type_id) {
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
        `,fetchPolicy:"network-only",variables:{user_type_id:a}}).valueChanges.pipe((0,l.U)(o=>o.data.GetAllEngagementLevelProgresses))}GetGeneralData(e){return this.apollo.watchQuery({query:t.ZP`
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
        `,fetchPolicy:"network-only",variables:{filter:e}}).valueChanges.pipe((0,l.U)(a=>a.data.GetAllGeneralDashboardAdmissionDashboards))}GetAllAdmissionChart(e){return this.apollo.watchQuery({query:t.ZP`
          query GetAllAdmissionChart {
            GetAllGeneralDashboardAdmissionDashboards(${e}) {
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(a=>a.data.GetAllGeneralDashboardAdmissionDashboards))}GetCountCandidatePerNationality(e,a,o,i,s,n,r,d){return this.apollo.watchQuery({query:t.ZP`
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
        `,fetchPolicy:"network-only",variables:{scholar_season_id:e,school_id:a,campus_id:o,level_id:i,sector_id:s,speciality_id:n,user_type_id:r,is_speciality:d}}).valueChanges.pipe((0,l.U)(c=>c.data.GetCountCandidatePerNationality))}getRegisteredCandidatePerWeek(e,a,o,i,s,n,r,d){return this.apollo.watchQuery({query:t.ZP`
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
        `,fetchPolicy:"network-only",variables:{scholar_season_id:e,school_id:a,campus_id:o,level_id:i,sector_id:s,speciality_id:n,user_type_id:r,is_speciality:d}}).valueChanges.pipe((0,l.U)(c=>c.data.GetRegisteredCandidatePerWeek))}getTotalRegisteredCandidate(e,a,o,i,s,n,r,d){return this.apollo.watchQuery({query:t.ZP`
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
        `,fetchPolicy:"network-only",variables:{scholar_season_id:e,school_id:a,campus_id:o,level_id:i,sector_id:s,speciality_id:n,user_type_id:r,is_speciality:d}}).valueChanges.pipe((0,l.U)(c=>c.data.GetTotalRegisteredCandidate))}GetRegisteredCandidatePerDay(e,a,o,i,s,n,r,d,c,D){return this.apollo.watchQuery({query:t.ZP`
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
        `,fetchPolicy:"network-only",variables:{scholar_season_id:e,school_id:a,campus_id:o,level_id:i,sector_id:s,speciality_id:n,period_start:r,period_end:d,user_type_id:c,is_speciality:D}}).valueChanges.pipe((0,l.U)(f=>f.data.GetRegisteredCandidatePerDay))}GetAllAdmissionGeneralDashboard(e,a){return this.apollo.watchQuery({query:t.ZP`
        query GetAllAdmissionGeneralDashboard {
          GetAllGeneralDashboardAdmissions(${e}) {
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
        `,fetchPolicy:"network-only"}).valueChanges.pipe((0,l.U)(o=>o.data.GetAllGeneralDashboardAdmissions))}GetTotalRegisteredPerProgram(e,a,o,i,s,n){return this.apollo.watchQuery({query:t.ZP`
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
        `,fetchPolicy:"network-only",variables:{scholar_season_id:e,school_id:a,level_id:o,sector_id:i,speciality_id:n,user_type_id:s}}).valueChanges.pipe((0,l.U)(r=>r.data.GetTotalRegisteredPerProgram))}GetAllSchoolCandidatesUserType(e){return this.apollo.watchQuery({query:t.ZP`
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
        `,fetchPolicy:"network-only",variables:{user_type_id:e}}).valueChanges.pipe((0,l.U)(a=>a.data.GetAllCandidateSchool))}}return u.\u0275fac=function(e){return new(e||u)(p.\u0275\u0275inject(y.eN),p.\u0275\u0275inject(g._M),p.\u0275\u0275inject(G.sK))},u.\u0275prov=p.\u0275\u0275defineInjectable({token:u,factory:u.\u0275fac,providedIn:"root"}),u})()}}]);