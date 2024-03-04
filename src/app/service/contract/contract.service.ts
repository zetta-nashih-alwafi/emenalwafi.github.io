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
export class ContractService {
  constructor(public httpClient: HttpClient, private apollo: Apollo, private translate: TranslateService) {}

  getAllFCContractStudentTable(filter, user_type_id, pagination) {
    return this.apollo
      .query({
        query: gql`
        query GetAllFCContractProcesses($userTypeId: ID, $pagination: PaginationInput) {
          GetAllFCContractProcesses(${filter}, user_type_id: $userTypeId, pagination: $pagination) {
            _id
            candidate_id {
              _id
              civility
              first_name
              last_name
              candidate_unique_number
              email
              school_mail
              candidate_admission_status
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
              intake_channel {
                _id
                program
              }
            }
            contract_validator_signatory_status {
              user_id {
                civility
                first_name
                last_name
              }
              is_already_sign
            }
            form_builder_id {
              _id
              form_builder_name
            }
            admission_financement_id {
              _id
              organization_name
              organization_id{
                _id
                organization_type
              }
            }
            start_date {
              date
              time
            }
            end_date {
              date
              time
            }
            contract_manager {
              _id
              civility
              first_name
              last_name
            }
            send_date {
              date
              time
            }
            financer
            contract_status
            count_document
            form_builder_pdf_s3_file_name
            admission_financement_ids {
              _id
              organization_id {
                _id
                organization_type
              }
              company_branch_id {
                _id
              }
            }
          }
        }
        `,
        fetchPolicy: 'network-only',
        variables: {
          user_type_id,
          pagination,
        },
      })
      .pipe(map((resp) => resp.data['GetAllFCContractProcesses']));
  }

  getAllFCContractCheckbox(user_type_id, pagination) {
    return this.apollo
      .query({
        query: gql`
          query GetAllFCContractProcesses($user_type_id: ID, $pagination: PaginationInput) {
            GetAllFCContractProcesses(user_type_id: $user_type_id, pagination: $pagination) {
              _id
              candidate_id {
                _id
                civility
                first_name
                last_name
                candidate_unique_number
                intake_channel {
                  _id
                  program
                }
              }
              form_builder_id {
                _id
                form_builder_name
              }
              admission_financement_id {
                _id
                organization_name
                organization_type
              }
              start_date {
                date
                time
              }
              end_date {
                date
                time
              }
              contract_manager {
                _id
                civility
                first_name
                last_name
              }
              contract_status
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          user_type_id,
          pagination,
        },
      })
      .pipe(map((resp) => resp.data['GetAllFCContractProcesses']));
  }

  getAllCandidates(user_type_ids, filter, pagination) {
    return this.apollo
      .query({
        query: gql`
          query GetAllCandidates($user_type_ids: [ID], $filter: CandidateFilterInput, $pagination: PaginationInput) {
            GetAllCandidates(user_type_ids: $user_type_ids, filter: $filter, pagination: $pagination) {
              _id
              civility
              first_name
              last_name
              user_id {
                _id
              }
              continuous_formation_manager_id {
                _id
              }
              admission_member_id {
                _id
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          user_type_ids,
          filter,
          pagination
        },
      })
      .pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  deleteFcContractProcess(_id: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteFcContractProcess{
            DeleteFcContractProcess(_id: "${_id}") {
              _id
            }
          }
        `,
      })
      .pipe(map((resp) => resp.data['DeleteFcContractProcess']));
  }

  createFcContractProcess(fc_contract_process_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateFcContractProcess($fc_contract_process_input: FcContractProcessInput) {
            CreateFcContractProcess(fc_contract_process_input: $fc_contract_process_input) {
              _id
              candidate_id {
                _id
              }
            }
          }
        `,
        variables: {
          fc_contract_process_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateFcContractProcess']));
  }

  sendFCContractProcess(
    contract_manager_id,
    candidate_id,
    form_builder_id,
    user_type_id,
    contract_validator_signatory_status,
  ): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendFCContractProcess(
            $contract_manager_id: ID
            $candidate_id: ID
            $form_builder_id: ID
            $user_type_id: ID
            $contract_validator_signatory_status: [ContractProcessContractValidatorSignatoryStatusInput]
          ) {
            SendFCContractProcess(
              contract_manager_id: $contract_manager_id
              candidate_id: $candidate_id
              form_builder_id: $form_builder_id
              user_type_id: $user_type_id
              contract_validator_signatory_status: $contract_validator_signatory_status
            ) {
              _id
              candidate_id {
                _id
              }
            }
          }
        `,
        variables: {
          contract_manager_id,
          candidate_id,
          form_builder_id,
          user_type_id,
          contract_validator_signatory_status,
        },
      })
      .pipe(map((resp) => resp.data['SendFCContractProcess']));
  }

  getAllContractManagerDropdown() {
    return this.apollo
      .query({
        query: gql`
          query GetAllUsers{
            GetAllUsers(user_type: ["6209f2dc74890f0ecad16670"]) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getAllFCContractManagerDropdown() {
    return this.apollo
      .query({
        query: gql`
          query {
            GetAllUsers(user_type: ["64a245893677852cf45c5763"]) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getAllFormBuildersContract(): Observable<any[]> {
    return this.apollo
      .watchQuery<[]>({
        query: gql`
          query GetAllFormBuilders {
            GetAllFormBuilders(filter: { status: true, template_type: fc_contract, hide_form: false }) {
              _id
              form_builder_name
              steps {
                contract_signatory {
                  _id
                  name
                }
                user_who_complete_step{
                  _id
                  name
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllFormBuilders']));
  }

  getAllSchoolFormFCContract(): Observable<any[]> {
    return this.apollo
      .watchQuery<[]>({
        query: gql`
          query GetAllSchoolFormFCContract {
            GetAllCandidateSchool {
              _id
              short_name
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
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  getAllSectorFormFCContract(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<[]>({
        query: gql`
          query GetAllSectorFormFCContract($filter: SectorFilterInput) {
            GetAllSectors(filter: $filter) {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSectors']));
  }

  getAllSpecialityFormFCContract(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<[]>({
        query: gql`
          query GetAllSpecialityFormFCContract($filter: SpecializationFilterInput) {
            GetAllSpecializations(filter: $filter) {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSpecializations']));
  }

  SendEmailFcContractProcess(contractProcessId: string, lang: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendEmailFcContractProcess($contractProcessId: ID!, $lang: String) {
            SendEmailFcContractProcess(_id: $contractProcessId, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          contractProcessId,
          lang,
        },
      })
      .pipe(map((resp) => resp.data['SendEmailFcContractProcess']));
  }
}
