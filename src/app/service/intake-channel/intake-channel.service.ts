import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class IntakeChannelService {
  constructor(public httpClient: HttpClient, private apollo: Apollo) {}

  // Start Speciality ================================================================================================
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

  GetAllSpecializationsByScholar(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSpecializationsByScholar{
            GetAllSpecializations {
              _id
              name
              intake_channel
              description
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSpecializations']));
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
  // End Speciality ==================================================================================================

  // Start Sector ====================================================================================================
  GetAllSectorsTable(pagination, sorting): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSectors($pagination: PaginationInput, $sorting: SectorSortingInput) {
            GetAllSectors(pagination: $pagination, sorting: $sorting) {
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
          sorting: sorting ? sorting : null,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSectors']));
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
  // End Sector ======================================================================================================
  // Start Site ======================================================================================================
  GetAllSitesTable(pagination): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSite($pagination: PaginationInput) {
            GetAllSite(pagination: $pagination) {
              _id
              name
              address
              zip_code
              country
              city
              count_document
            }
          }
        `,
        variables: {
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSite']));
  }

  GetAllSites(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSites{
            GetAllSite {
              _id
              name
              address
              zip_code
              country
              city
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSite']));
  }

  DeleteSite(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteSite($_id: ID!) {
            DeleteSite(_id: $_id) {
              name
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteSite']));
  }

  CreateSite(site_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateSite($site_input: SiteInput) {
            CreateSite(site_input: $site_input) {
              _id
              name
            }
          }
        `,
        variables: {
          site_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateSite']));
  }

  UpdateSite(site_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateSite($site_input: SiteInput, $_id: ID!) {
            UpdateSite(site_input: $site_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          site_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateSite']));
  }
  // End Site ========================================================================================================

  // Start Campus ====================================================================================================
  GetAllCampuses(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCampusesIntakeChannel($filter: CampusFilterInput) {
            GetAllCampuses(filter: $filter) {
              _id
              name
              short_name
              analytical_code
              sites {
                site_id {
                  _id
                  name
                  address
                  zip_code
                  country
                  city
                }
                is_main_address
              }
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

  GetOneCandidateSchool(_id, scholar_season_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneCandidateSchoolIntakeChannel($_id: ID!, $scholar_season_id: ID) {
            GetOneCandidateSchool(_id: $_id, scholar_season_id: $scholar_season_id) {
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
          _id,
          scholar_season_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidateSchool']));
  }

  GetOneCampus(_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneCampusIntakeChannel($_id: ID!) {
            GetOneCampus(_id: $_id) {
              _id
              name
              short_name
              address
              analytical_code
              sites {
                site_id {
                  _id
                  name
                  address
                  zip_code
                  country
                  city
                }
                is_main_address
              }
            }
          }
        `,
        variables: {
          _id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCampus']));
  }
  CreateCampus(campus_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateCampus($campus_input: CampusInput) {
            CreateCampus(campus_input: $campus_input) {
              _id
            }
          }
        `,
        variables: {
          campus_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateCampus']));
  }
  UpdateCampus(campus_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCampusIntakeChannel($campus_input: CampusInput, $_id: ID!) {
            UpdateCampus(campus_input: $campus_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          campus_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateCampus']));
  }
  // end campus ======================================================================================================

  // Start Level =====================================================================================================
  GetAllLevelsTable(pagination): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllLevels($pagination: PaginationInput) {
            GetAllLevels(pagination: $pagination) {
              _id
              name
              description
              accounting_plan
              count_document
            }
          }
        `,
        variables: {
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllLevels']));
  }

  DeleteLevel(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteLevel($_id: ID!) {
            DeleteLevel(_id: $_id) {
              name
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteLevel']));
  }

  CreateLevel(level_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateLevel($level_input: LevelInput) {
            CreateLevel(level_input: $level_input) {
              _id
              name
            }
          }
        `,
        variables: {
          level_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateLevel']));
  }

  UpdateLevel(level_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateLevel($level_input: LevelInput, $_id: ID!) {
            UpdateLevel(level_input: $level_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
          level_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateLevel']));
  }
  // End Level =======================================================================================================

  // Start ScholarSeason =============================================================================================
  UpdateScholarSeason(scholar_season_input, _id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateScholarSeason($scholar_season_input: ScholarSeasonInput, $_id: ID!) {
            UpdateScholarSeason(scholar_season_input: $scholar_season_input, _id: $_id) {
              _id
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
  // End ScholarSeason ===============================================================================================

  // Start School ====================================================================================================
  GetAllSchools(user_type_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($user_type_id: ID) {
            GetAllCandidateSchool(user_type_id: $user_type_id) {
              _id
              short_name
              long_name
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

  GetOneSchool(id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneCandidateSchool{
            GetOneCandidateSchool(_id: "${id}") {
              _id
              school_logo
              short_name
              long_name
              platform_account
              tele_phone
              accounting_plan
              signalement_email
              school_stamp
              empty_scholar_seasons {
                _id
                scholar_season
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidateSchool']));
  }

  GetOneSchoolLegal(id, scholar_season_id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneCandidateSchool{
            GetOneCandidateSchool(_id: "${id}", scholar_season_id: "${scholar_season_id}") {
              _id
              school_logo
              short_name
              long_name
              tele_phone
              accounting_plan
              signalement_email
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
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidateSchool']));
  }

  CreateCandidateSchool(candidate_school_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateCandidateSchool($candidate_school_input: CandidateSchoolInput) {
            CreateCandidateSchool(candidate_school_input: $candidate_school_input) {
              _id
              short_name
              platform_account
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
              _id
              school_logo
              short_name
              long_name
              tele_phone
              accounting_plan
              signalement_email
              platform_account
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

  GetAllPublishedScholarSeasons(is_published): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllScholarSeasons {
            GetAllScholarSeasons(filter: {is_published: ${is_published}}) {
              _id
              scholar_season
              is_published
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllScholarSeasons']));
  }

  DuplicateScholarSeason(duplicate_scholar_season_input) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DuplicateScholarSeason($duplicate_scholar_season_input: DuplicateScholarSeasonInput!) {
            DuplicateScholarSeason(duplicate_scholar_season_input: $duplicate_scholar_season_input) {
              _id
            }
          }
        `,
        variables: {
          duplicate_scholar_season_input,
        },
      })
      .pipe(map((resp) => resp.data['DuplicateScholarSeason']));
  }

  GetAllSchoolProgram(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllPrograms($filter: ProgramFilterInput) {
            GetAllPrograms(filter: $filter) {
              _id
              program
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
              }
              count_document
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllPrograms']));
  }

  GetAllSchoolIntakeChannel(filter, pagination, sortValue): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllIntakeChannels($filter: IntakeChannelFilterInput, $pagination: PaginationInput, $sort: IntakeChannelSortingInput) {
            GetAllIntakeChannels(filter: $filter, pagination: $pagination, sorting: $sort) {
              _id
              intake_channel
              scholar_season
              school
              campus
              level
              sector_id {
                _id
                name
              }
              speciality_id {
                _id
                name
              }
              profil_rate {
                _id
                name
                scholar_season_id {
                  _id
                }
              }
              admission_flyer {
                s3_file_name
                document_name
              }
              admission_document {
                s3_file_name
                document_name
              }
              admission_document_template {
                _id
                form_builder_name
              }
              count_document
              start_date {
                date
                time
              }
              program_director_id {
                _id
              }
              cvec_template_id { 
                form_builder_name
                _id
              }
              cvec_send_date
              cvec_validators {
                user_validator {
                  _id
                  first_name
                  last_name
                  civility
                }
                validator {
                  _id
                }
                form_builder_step_id {
                  _id
                }
              }
              adm_doc_validators {
                user_validator {
                  _id
                  first_name
                  last_name
                  civility
                }
                validator {
                  _id
                }
                form_builder_step_id {
                  _id
                }
              }
              adm_doc_names
            }
          }
        `,
        variables: {
          filter,
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllIntakeChannels']));
  }

  GetAllSchoolIntakeChannelIdCheckbox(filter, pagination, sortValue): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllIntakeChannels($filter: IntakeChannelFilterInput, $pagination: PaginationInput, $sort: IntakeChannelSortingInput) {
            GetAllIntakeChannels(filter: $filter, pagination: $pagination, sorting: $sort) {
              _id
            }
          }
        `,
        variables: {
          filter,
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllIntakeChannels']));
  }

  GetAllSchoolIntakeChannelDirectorCheckbox(filter, pagination, sortValue): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllIntakeChannels($filter: IntakeChannelFilterInput, $pagination: PaginationInput, $sort: IntakeChannelSortingInput) {
            GetAllIntakeChannels(filter: $filter, pagination: $pagination, sorting: $sort) {
              _id
              program_director_id {
                _id
              }
            }
          }
        `,
        variables: {
          filter,
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllIntakeChannels']));
  }

  GetAllRegistrationProfileForCheckbox(filter, pagination, sortValue): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllRegistrationProfileForCheckbox(
            $filter: IntakeChannelFilterInput
            $pagination: PaginationInput
            $sort: IntakeChannelSortingInput
          ) {
            GetAllIntakeChannels(filter: $filter, pagination: $pagination, sorting: $sort) {
              _id
              intake_channel
              profil_rate {
                _id
                name
                scholar_season_id {
                  _id
                }
              }
            }
          }
        `,
        variables: {
          filter,
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllIntakeChannels']));
  }

  GetAllRegistrationProfile(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllProfilRates($filter: ProfilRateFilterInput) {
            GetAllProfilRates(filter: $filter) {
              _id
              name
              scholar_season_programs {
                scholar_season_id {
                  _id
                }
                school_id {
                  _id
                }
                programs {
                  _id
                }
              }
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllProfilRates']));
  }

  GetAllRegistrationProfileForDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllRegistrationProfileForDropdown {
            GetAllProfilRates {
              _id
              name
              scholar_season_programs {
                scholar_season_id {
                  _id
                }
                school_id {
                  _id
                }
                programs {
                  _id
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllProfilRates']));
  }
  // End School ======================================================================================================

  // Start Setting - Type of formation ===============================================================================

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
              readmission_form_id {
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
              accounting_plan
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

  getAllTypeOfInformationDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllTypeOfInformation {
            GetAllTypeOfInformation {
              _id
              type_of_information
              description
              type_of_formation
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTypeOfInformation']));
  }

  // End Setting - Type of formation =================================================================================

  // Start Setting - Addtional ======================================================================================
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
  GetAllAdditionalCostsId(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAdditionalCosts($pagination: PaginationInput, $sort: AdditionalCostSortingInput) {
            GetAllAdditionalCosts(pagination: $pagination, sorting: $sort, ${filter}) {
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

  // End Setting - Addtional costs ===========================================================================

  // Start Setting - Registration Profile ===============================================================================

  getAllPaymentModes(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllPaymentModes($filter: PaymentModeFilterInput) {
            GetAllPaymentModes(filter: $filter) {
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
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllPaymentModes']));
  }

  getAllAdditionalCostsDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAdditionalCosts {
            GetAllAdditionalCosts {
              additional_cost
              _id
              amount
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAdditionalCosts']));
  }

  // End Setting - Registration Profile =================================================================================

  // Start School - Scholar-season - Program ============================================================================
  GetAllProgramsID(filter, pagination): Observable<Array<{ _id: string }>> {
    return this.apollo
      .query({
        query: gql`
          query GetAllProgramsID($filter: ProgramFilterInput, $pagination: PaginationInput) {
            GetAllPrograms(filter: $filter, pagination: $pagination) {
              _id
            }
          }
        `,
        variables: {
          filter,
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((res) => res.data['GetAllPrograms']));
  }

  GetAllSelectedSchoolProgramScholarSeason(filter, pagination, user_type_logins): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSelectedSchoolProgramScholarSeason(
            $filter: ProgramFilterInput
            $pagination: PaginationInput
            $user_type_logins: [ID]
          ) {
            GetAllPrograms(filter: $filter, pagination: $pagination, user_type_logins: $user_type_logins) {
              _id
              program
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
              }
              scholar_season_id {
                _id
                scholar_season
              }
              count_document
            }
          }
        `,
        variables: {
          filter,
          pagination,
          user_type_logins,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllPrograms']));
  }

  GetAllSelectedSchoolProgramScholarSeasonFilter(filter, pagination, user_type_logins): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSelectedSchoolProgramScholarSeason(
            $filter: ProgramFilterInput
            $pagination: PaginationInput
            $user_type_logins: [ID]
          ) {
            GetAllPrograms(filter: $filter, pagination: $pagination, user_type_logins: $user_type_logins) {
              _id
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
              }
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,
        variables: {
          filter,
          pagination,
          user_type_logins,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllPrograms']));
  }

  deleteProgramSelected(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation deleteProgramSelected($_id: ID!) {
            DeleteProgram(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteProgram']));
  }

  getSectorDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query getSectorDropdown {
            GetAllSectors {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSectors']));
  }

  getAllCampusesDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query getAllCampusesDropdown {
            GetAllCampuses {
              _id
              name
              short_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCampuses']));
  }

  getAllSpecializationsDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query getAllSpecializationsDropdown {
            GetAllSpecializations {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSpecializations']));
  }

  getAllLevelsDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query getAllLevelsDropdown {
            GetAllLevels {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllLevels']));
  }

  AssignProgramToSchool(program_to_school_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AssignProgramToSchool($program_to_school_input: AssignProgramToSchoolInput) {
            AssignProgramToSchool(program_to_school_input: $program_to_school_input) {
              _id
            }
          }
        `,
        variables: {
          program_to_school_input,
        },
      })
      .pipe(map((resp) => resp.data['AssignProgramToSchool']));
  }

  // End School - Scholar-season - Program ==============================================================================

  // Start School - Scholar-season - Admission ==============================================================================

  GetAllSchoolScholar(short_names, user_type_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($short_names: [String], $user_type_id: ID) {
            GetAllCandidateSchool(filter: { short_names: $short_names }, user_type_id: $user_type_id) {
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

  AssignProgramToProfileRates(scholar_season_id, school_id, intake_channel_inputs): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AssignProgramToProfileRates(
            $scholar_season_id: ID
            $school_id: ID
            $intake_channel_inputs: [ProgramToProfileRateInput]
          ) {
            AssignProgramToProfileRates(
              scholar_season_id: $scholar_season_id
              school_id: $school_id
              intake_channel_inputs: $intake_channel_inputs
            ) {
              _id
            }
          }
        `,
        variables: {
          scholar_season_id,
          school_id,
          intake_channel_inputs,
        },
      })
      .pipe(map((resp) => resp.data['ProfilRate']));
  }

  updateProgram(_id, program_input) {
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

  updatePrograms(program_ids, program_input, is_select_all?, filter?) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdatePrograms($program_ids: [ID], $program_input: ProgramInput, $is_select_all: Boolean, $filter: ProgramFilterInput) {
            UpdatePrograms(program_ids: $program_ids, program_input: $program_input, is_select_all: $is_select_all, filter: $filter)
          }
        `,
        variables: {
          program_ids,
          program_input,
          is_select_all,
          filter
        },
      })
      .pipe(map((resp) => resp.data['UpdatePrograms']));
  }

  updateProgramStartDate(program_ids, program_input) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdatePrograms($program_ids: [ID], $program_input: ProgramInput) {
            UpdatePrograms(program_ids: $program_ids, program_input: $program_input)
          }
        `,
        variables: {
          program_ids,
          program_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdatePrograms']));
  }

  updateCommonCandidateSchool(_id, candidate_school_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCommonCandidateSchool($_id: ID, $candidate_school_input: CandidateSchoolInput) {
            UpdateCommonCandidateSchool(_id: $_id, candidate_school_input: $candidate_school_input) {
              _id
              empty_scholar_seasons {
                _id
                scholar_season
              }
            }
          }
        `,
        variables: {
          _id,
          candidate_school_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateCommonCandidateSchool']));
  }

  AssignProgramDirectorToManyPrograms(intake_channel_ids, program_director_id, filter, select_all): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AssignProgramDirectorToManyPrograms(
            $intake_channel_ids: [ID]
            $program_director_id: [ID]
            $filter: IntakeChannelFilterInput
            $select_all: Boolean
          ) {
            AssignProgramDirectorToManyPrograms(
              intake_channel_ids: $intake_channel_ids
              program_director_id: $program_director_id
              filter: $filter
              select_all: $select_all
            ) {
              _id
            }
          }
        `,
        variables: {
          intake_channel_ids,
          program_director_id,
          filter,
          select_all,
        },
      })
      .pipe(map((resp) => resp.data['AssignProgramDirectorToManyPrograms']));
  }

  GetAllTypeInformationIntakeChannelIdCheckbox(filter, pagination): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllTypeInformationIntakeChannelIdCheckbox($pagination: PaginationInput, $filter: TypeOfInformationFilterInput) {
            GetAllTypeOfInformation(filter: $filter, pagination: $pagination) {
              _id
            }
          }
        `,
        variables: {
          filter,
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTypeOfInformation']));
  }

  // End School - Scholar-season - Admission ==============================================================================

  getConnectRegistrationCheckboxId(filter, pagination, sortValue): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query getConnectRegistrationCheckboxId(
            $filter: IntakeChannelFilterInput
            $pagination: PaginationInput
            $sort: IntakeChannelSortingInput
          ) {
            GetAllIntakeChannels(filter: $filter, pagination: $pagination, sorting: $sort) {
              _id
              intake_channel
              scholar_season
            }
          }
        `,
        variables: {
          filter,
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllIntakeChannels']));
  }
  GetAllAdditionalExpensesIntakeChannelIdCheckbox(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAdditionalExpensesIntakeChannelIdCheckbox ($pagination: PaginationInput, $sort: AdditionalCostSortingInput) {
            GetAllAdditionalCosts(pagination: $pagination, sorting: $sort, ${filter}) {
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

  GetAllUserAdmission(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllUsers(user_type: "617f64ec5a48fe2228518812") {
              _id
              first_name
              last_name
              civility
              entities {
                type {
                  _id
                  name
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }
  GetAllUserAdmissionWithIntake(intake_channel_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllUsers($intake_channel_ids: [ID]) {
            GetAllUsers(user_type: "617f64ec5a48fe2228518812", intake_channel_ids: $intake_channel_ids) {
              _id
              first_name
              last_name
              civility
              entities {
                type {
                  _id
                  name
                }
              }
            }
          }
        `,
        variables: {
          intake_channel_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }
}
