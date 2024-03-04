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
export class CandidatesService {
  sideNavTutorial = false;
  widthMainContent = 100;
  widthSideContent = 0;
  public indexStep: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  public statusStepOne: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusStepTwo: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusStepThree: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusStepFour: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusStepFive: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusStepSix: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusStepSeven: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusStepEight: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusStepNine: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusStepTen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusEditMode: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusEditModeTwo: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusEditModeThree: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusEditModeFour: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusEditModeFive: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusEditModeSix: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusEditModeSeven: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public statusEditModeEight: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public tutorialContractActive: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public dataCandidate: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public formStepTwo: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public dataCompany: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public dataJobOfferOne: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public dataJobOfferTwo: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public dataJobOfferThree: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public dataContractStepOne: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public dataContractStepTwo: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public dataContractStepThree: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public dataContractStepFour: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public dataContractStepFive: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public dataContractStepSix: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public dataSurvey: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public tutorialSelected: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public stepOneForm: BehaviorSubject<boolean> = new BehaviorSubject<any>(false);
  public candidateOneStduent: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  private isSaved = new BehaviorSubject<boolean>(false);
  public isSaved$ = this.isSaved.asObservable();

  setIsSaved() {
    this.isSaved.next(true);
  }

  setIndexStep(value: number) {
    this.indexStep.next(value);
  }

  setStatusStepOne(value: boolean) {
    this.statusStepOne.next(value);
  }

  setTutorialSelected(value: any) {
    this.tutorialSelected.next(value);
  }

  setTutorialContractActive(value: boolean) {
    this.tutorialContractActive.next(value);
  }

  setStatusStepTwo(value: boolean) {
    this.statusStepTwo.next(value);
  }

  setFormStepTwo(value: boolean) {
    this.formStepTwo.next(value);
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

  setStatusStepSix(value: boolean) {
    this.statusStepSix.next(value);
  }

  setStatusStepSeven(value: boolean) {
    this.statusStepSeven.next(value);
  }

  setStatusStepEight(value: boolean) {
    this.statusStepEight.next(value);
  }

  setStatusStepNine(value: boolean) {
    this.statusStepNine.next(value);
  }

  setStatusStepTen(value: boolean) {
    this.statusStepTen.next(value);
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

  setStatusEditModeSix(value: boolean) {
    this.statusEditModeSix.next(value);
  }

  setStatusEditModeSeven(value: boolean) {
    this.statusEditModeSeven.next(value);
  }

  setStatusEditModeEight(value: boolean) {
    this.statusEditModeEight.next(value);
  }

  setDataCandidate(value: any) {
    this.dataCandidate.next(value);
  }

  setDataJobOne(value: any) {
    this.dataJobOfferOne.next(value);
  }

  setDataCompany(value: any) {
    this.dataCompany.next(value);
  }

  setDataJobTwo(value: any) {
    this.dataJobOfferTwo.next(value);
  }

  setDataJobThree(value: any) {
    this.dataJobOfferThree.next(value);
  }

  setDataContractStepOne(value: any) {
    this.dataContractStepOne.next(value);
  }

  setDataContractStepTwo(value: any) {
    this.dataContractStepTwo.next(value);
  }

  setDataContractStepThree(value: any) {
    this.dataContractStepThree.next(value);
  }

  setDataContractStepFour(value: any) {
    this.dataContractStepFour.next(value);
  }

  setDataContractStepFive(value: any) {
    this.dataContractStepFive.next(value);
  }

  setDataContractStepSix(value: any) {
    this.dataContractStepSix.next(value);
  }

  setDataSurvey(value: any) {
    this.dataSurvey.next(value);
  }

  setCandidateOneStduent(value: any){
    this.candidateOneStduent.next(value)
  }

  disableValidateStepOne(value: boolean) {
    this.stepOneForm.next(value);
  }

  constructor(public httpClient: HttpClient, private apollo: Apollo, private translate: TranslateService) {}

  getAllTags(isUsedByStudent, menuTable, userTypeIds, candidateAdmissionStatuses) {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllTags(
            $menuTable: EnumMenuTable
            $isUsedByStudent: Boolean
            $userTypeIds: [ID]
            $candidateAdmissionStatuses: [EnumCandidateAdmissionStatus]
          ) {
            GetAllTags(
              menu_table: $menuTable
              is_used_by_student: $isUsedByStudent
              user_type_ids: $userTypeIds
              candidate_admission_statuses: $candidateAdmissionStatuses
            ) {
              _id
              name
            }
          }
        `,
        variables: {
          isUsedByStudent: isUsedByStudent,
          menuTable: menuTable,
          userTypeIds: userTypeIds,
          candidateAdmissionStatuses: candidateAdmissionStatuses,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTags']));
  }

  // getAllTags(isUsedByStudent, menuTable, userTypeIds, candidateAdmissionStatuses){
  //   return this.apollo
  //     .watchQuery<any[]>({
  //       query: gql`
  //       query GetAllTags($menuTable: EnumMenuTable, $isUsedByStudent: Boolean, $userTypeIds: [ID], $candidateAdmissionStatuses: [EnumCandidateAdmissionStatus]) {
  //         GetAllTags(menu_table: $menuTable, is_used_by_student: $isUsedByStudent, user_type_ids: $userTypeIds, candidate_admission_statuses: $candidateAdmissionStatuses) {
  //           _id
  //           name
  //         }
  //       }
  //       `,
  //       variables: {
  //         isUsedByStudent: isUsedByStudent,
  //         menuTable: menuTable,
  //         userTypeIds: userTypeIds,
  //         candidateAdmissionStatuses: candidateAdmissionStatuses
  //       },
  //       fetchPolicy: 'network-only',
  //     })
  //     .valueChanges.pipe(map((resp) => resp.data['GetAllTags']));

  // }

  getAllAdmissionMember(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAdmissionMembers($pagination: PaginationInput, $sort: AdmissionMemberSortingInput) {
            GetAllAdmissionMembers(pagination: $pagination, sorting: $sort, ${filter}) {
                user_id {
                  _id
                  dev_member_intake_channels
                  first_name
                  last_name
                  civility
                  profile_picture
                  portable_phone
                  email
                  entities {
                    school {
                      _id
                      short_name
                    }
                    campus {
                      _id
                      name
                    }
                  }
                }
                count_document
                work_location
                number_candidate_affected
                number_candidate_first_call_not_done
                number_candidate_first_call_done
                percentage_candidate_first_call_done
                number_candidate_first_email_not_done
                number_candidate_first_email_done
                percentage_candidate_first_email_done
                number_candidate_lost
                number_candidate_low
                number_candidate_medium
                number_candidate_high
                number_candidate_not_registered
                number_candidate_registered
                percentage_candidate_registered
                number_candidate_connection_not_done
                number_candidate_connection_done
                percentage_candidate_connection_done
                number_candidate_personal_information_not_done
                number_candidate_personal_information_done
                percentage_candidate_personal_information_done
                number_candidate_signature_not_done
                number_candidate_signature_done
                percentage_candidate_signature_done
                number_candidate_method_of_payment_not_done
                number_candidate_method_of_payment_done
                percentage_candidate_method_of_payment_done
                number_candidate_payment_not_done
                number_candidate_payment_done
                percentage_candidate_payment_done
              }
            }
        `,
        variables: {
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAdmissionMembers']));
  }

  getAllFormContractFCProcesses(pagination, filter, user_type_ids?): Observable<any> {
    return this.apollo
      .query({
        query: gql`query GetAllFormProcesses($pagination: PaginationInput, $sorting: FormProcessSortingInput, $user_type_ids: [ID])  {
        GetAllFormProcesses (
          ${filter}
          pagination: $pagination,
          sorting: $sorting
          user_type_ids: $user_type_ids
          ) {
            _id
            user_who_reject_and_stop{
              _id
              first_name
              last_name
              civility
            }
            rejected_and_stop_at{
              date
              time
            }
            reason_rejected
            candidate_id {
              _id
              first_name
              last_name
              civility
              email
              school_mail
              intake_channel {
                _id
                program
              }
              scholar_season {
                _id
                scholar_season
              }
              payment_supports {
                relation
                family_name
                name
                civility
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
              candidate_unique_number
            }
            contract_validator_signatory_status {
              user_id {
                civility
                first_name
                last_name
              }
              is_already_sign
            }
            student_id {
              _id
              first_name
              last_name
              civility
              admission_process_id {
                _id
              }
              user_id {
                _id
                first_name
                last_name
              }
            }
            school_id {
              _id
              short_name
              long_name
            }
            rncp_title_id {
              _id
              short_name
              long_name
              operator_dir_responsible {
                _id
                first_name
                last_name
                civility
              }
            }
            form_builder_id {
              _id
              form_builder_name
              steps {
                _id
                step_title
                user_who_complete_step {
                  name
                }
              }
            }
            steps {
              _id
              step_title
              step_type
              step_status
              is_only_visible_based_on_condition
              form_builder_step {
                _id
              }
            }
            class_id {
              _id
              name
            }
            admission_financement_ids {
              _id
              organization_id {
                _id
                organization_type
              }
              company_branch_id {
                _id
                company_name
              }
            }
            admission_status
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
            created_at
            start_date
            end_date
            count_document
            contract_status
            financer
            user_id {
              _id
              first_name
              last_name
              civility
            }
        }
      }`,
        variables: {
          pagination: pagination,
          user_type_ids: user_type_ids ? user_type_ids : '',
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllFormProcesses']));
  }

  // it still continue development on ERP_032
  getAllScholarSeasonCRMDropdown(): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllScholarSeasonCRMDropdown{
            GetAllScholarSeasonCRMDropdown
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllScholarSeasonCRMDropdown']));
  }

  getAllFormContractFCProcessesStudentCard(pagination, filter, user_type_ids?): Observable<any> {
    return this.apollo
      .query({
        query: gql`query GetAllFormProcesses($pagination: PaginationInput, $sorting: FormProcessSortingInput, $user_type_ids: [ID])  {
      GetAllFormProcesses (
        ${filter}
        pagination: $pagination,
        sorting: $sorting
        user_type_ids: $user_type_ids
        ) {
          _id
          user_who_reject_and_stop{
            _id
            first_name
            last_name
            civility
          }
          rejected_and_stop_at{
            date
            time
          }
          reason_rejected
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
              steps {
                _id
                step_title
                user_who_complete_step {
                  name
                }
              }
            }
            steps {
              _id
              step_title
              step_type
              step_status
              is_only_visible_based_on_condition
              form_builder_step {
                _id
              }
            }
            admission_financement_id {
              _id
              organization_name
              organization_id{
                _id
                organization_type
              }
            }
            start_date
            end_date
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
    }`,
        variables: {
          pagination: pagination,
          user_type_ids: user_type_ids ? user_type_ids : '',
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllFormProcesses']));
  }

  generateContractPDF(formBuilderId, formProcessStepId, isPreview): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GenerateFormBuilderContractTemplatePDF($form_process_step_id: ID, $formProcessStepId: ID, $isPreview: Boolean, $lang: String) {
            GenerateFormBuilderContractTemplatePDF(_id: $form_process_step_id, form_process_step_id: $formProcessStepId, is_preview: $isPreview, lang: $lang)
          }
        `,
        variables: {
          formBuilderId,
          formProcessStepId,
          isPreview,
          lang: localStorage.getItem('currentLang'),
        },
      })
      .pipe(map((resp) => resp.data['GenerateFormBuilderContractTemplatePDF']));
  }

  getAllDataContractAdmission(pagination, filter, user_type_ids?): Observable<any> {
    return this.apollo
      .query({
        query: gql`query GetAllFormProcesses($pagination: PaginationInput, $sorting: FormProcessSortingInput, $user_type_ids: [ID])  {
        GetAllFormProcesses (
          ${filter}
          pagination: $pagination,
          sorting: $sorting
          user_type_ids: $user_type_ids
          ) {
            _id
            candidate_id {
              _id
              first_name
              last_name
              civility
              intake_channel {
                _id
                program
              }
              scholar_season {
                _id
                scholar_season
              }
              candidate_unique_number
            }
            student_id {
              _id
              first_name
              last_name
              civility
              admission_process_id {
                _id
              }
              user_id {
                _id
                first_name
                last_name
              }
            }
            school_id {
              _id
              short_name
              long_name
            }
            rncp_title_id {
              _id
              short_name
              long_name
              operator_dir_responsible {
                _id
                first_name
                last_name
                civility
              }
            }
            form_builder_id {
              _id
              form_builder_name
              steps {
                _id
                step_title
              }
            }
            steps {
              _id
              step_title
              step_type
              step_status
              is_only_visible_based_on_condition
              form_builder_step {
                _id
              }
            }
            class_id {
              _id
              name
            }
            admission_financement_ids {
              _id
              organization_id {
                _id
                organization_type
              }
              company_branch_id {
                _id
                company_name
              }
            }
            admission_status
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
            created_at
            start_date
            end_date
            count_document
            contract_status
            financer
            user_id {
              _id
              first_name
              last_name
              civility
            }
        }
      }`,
        variables: {
          pagination: pagination,
          user_type_ids,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllFormProcesses']));
  }
  getAllFormProcessesCheckboxId(pagination, filter, user_type_ids): Observable<any> {
    return this.apollo
      .query({
        query: gql`query GetAllFormProcesses($pagination: PaginationInput, $sorting: FormProcessSortingInput, $user_type_ids: [ID])  {
        GetAllFormProcesses (
          ${filter}
          pagination: $pagination,
          sorting: $sorting
          user_type_ids: $user_type_ids
          ) {
            _id
        }
      }`,
        variables: {
          pagination: pagination,
          user_type_ids,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllFormProcesses']));
  }

  getTemplateNameDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllTemplateNameDropdown {
            GetAllTemplateNameDropdown
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTemplateNameDropdown']));
  }

  getAllContactsOrg(organization_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllContacts($organization_ids: [ID]) {
            GetAllContacts(organization_ids: $organization_ids) {
              _id
              email
              civility
              first_name
              last_name
            }
          }
        `,
        variables: {
          organization_ids,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllContacts']));
  }

  getAllUsersCompanyContract(company): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllUsersCompanyContract{
            GetAllUsers(company_staff: true, company: "${company}") {
              _id
              email
              civility
              first_name
              last_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getAllUserManyCompanyContract(companies): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllUsers($companies: [ID]) {
            GetAllUsers(company_staff: true, companies: $companies) {
              _id
              email
              civility
              first_name
              last_name
            }
          }
        `,
        variables: {
          companies,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getFinancierDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllFinancerDropdown {
            GetAllFinancerDropdown
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllFinancerDropdown']));
  }
  getTypeOfFinancementDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllTypeOfFinancementDropdown {
            GetAllTypeOfFinancementDropdown
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTypeOfFinancementDropdown']));
  }
  getContractManagerDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllContractManagerDropdown {
            GetAllContractManagerDropdown {
              _id
              civility
              first_name
              last_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllContractManagerDropdown']));
  }

  getAllCandidatesWithUserType(pagination, sortValue, filter, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}) {
                  _id
                  jury_decision
                  trial_date
                  region
                  civility
                  first_name
                  last_name
                  telephone
                  payment_method
                  is_admitted
                  email
                  is_oscar_updated
                  finance
                  nationality
                  candidate_unique_number
                  candidate_admission_status
                  financement
                  school_mail
                  diploma_status
                  admission_document_process_status
                  billing_id {
                    _id
                    deposit_status
                    is_deposit_completed
                    deposit_pay_amount
                    deposit
                    account_number
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
                  photo
                  registration_email_due_date {
                    due_date
                    due_time
                  }
                  reg_n8_sent_date {
                    sent_date
                    sent_time
                  }
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
                  }
                  type_of_formation_id {
                    _id
                    type_of_information
                    type_of_formation
                    sigle
                    admission_form_id {
                      _id
                      form_builder_name
                    }
                  }
                  registration_profile {
                    _id
                    name
                    is_down_payment
                    discount_on_full_rate
                    type_of_formation {
                      _id
                      type_of_information
                    }
                    additional_cost_ids {
                      additional_cost
                      amount
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
                    short_name
                    long_name
                    campuses {
                      _id
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
                  # This one from 049
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
                  program_desired
                  trial_date
                  date_added
                  selected_payment_plan {
                    name
                    times
                    additional_expense
                    total_amount
                    payment_date {
                      date
                      amount
                    }
                    down_payment
                  }
                  registered_at {
                    date
                    time
                  }
                  resign_after_school_begins_at {
                    date
                    time
                  }
                  no_show_at {
                    date
                    time
                  }
                  hubspot_deal_id
                  hubspot_contact_id
                  is_hubspot_updated
                  is_manual_updated
                  continuous_formation_manager_id {
                    _id
                    first_name
                    last_name
                    civility
                    profile_picture
                    email
                    position
                  }
                  admission_process_id {
                    _id
                    steps {
                      _id
                      index
                      step_title
                      step_type
                      step_status
                      status
                      is_only_visible_based_on_condition
                    }
                  }
                  latest_previous_program{
                    _id
                    program
                    scholar_season_id {
                      _id
                      scholar_season
                    }
                  }
                  type_of_readmission
                  previous_programs {
                    _id
                  }
                }
              }
        `,
        variables: {
          user_type_ids: user_type_ids ? user_type_ids : '',
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getAllCandidatesFITable(pagination, sortValue, filter, searching, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
                  _id
                  jury_decision
                  trial_date
                  region
                  civility
                  first_name
                  last_name
                  telephone
                  payment_method
                  is_admitted
                  email
                  is_oscar_updated
                  finance
                  nationality
                  registration_profile_type
                  candidate_unique_number
                  candidate_admission_status
                  is_future_program_assigned
                  program_status
                  is_program_assigned
                  financement
                  school_mail
                  diploma_status
                  admission_document_process_status
                  billing_id {
                    _id
                    deposit_status
                    is_deposit_completed
                    deposit_pay_amount
                    deposit
                    account_number
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
                  photo
                  registration_email_due_date {
                    due_date
                    due_time
                  }
                  reg_n8_sent_date {
                    sent_date
                    sent_time
                  }
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
                  }
                  type_of_formation_id {
                    _id
                    type_of_information
                    type_of_formation
                    sigle
                    admission_form_id {
                      _id
                      form_builder_name
                    }
                  }
                  registration_profile {
                    _id
                    name
                    is_down_payment
                    discount_on_full_rate
                    type_of_formation {
                      _id
                      type_of_information
                    }
                    additional_cost_ids {
                      additional_cost
                      amount
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
                    short_name
                    long_name
                    campuses {
                      _id
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
                  program_desired
                  trial_date
                  date_added
                  selected_payment_plan {
                    name
                    times
                    additional_expense
                    total_amount
                    payment_date {
                      date
                      amount
                    }
                    down_payment
                  }
                  registered_at {
                    date
                    time
                  }
                  resign_after_school_begins_at {
                    date
                    time
                  }
                  no_show_at {
                    date
                    time
                  }
                  hubspot_deal_id
                  hubspot_contact_id
                  is_hubspot_updated
                  is_manual_updated
                  continuous_formation_manager_id {
                    _id
                    first_name
                    last_name
                    civility
                    profile_picture
                    email
                    position
                  }
                  admission_process_id {
                    _id
                    steps {
                      _id
                      index
                      step_title
                      step_type
                      step_status
                      status
                      is_only_visible_based_on_condition
                    }
                  }
                  latest_previous_program{
                    _id
                    program
                    scholar_season_id {
                      _id
                      scholar_season
                    }
                  }
                  type_of_readmission
                  previous_programs {
                    _id
                  }
                }
              }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getAllAssignment(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput, $lang: String) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching, lang: $lang) {
                  _id
                  financial_situation
                  readmission_status
                  jury_decision
                  trial_date
                  region
                  civility
                  first_name
                  last_name
                  telephone
                  payment_method
                  is_admitted
                  email
                  is_oscar_updated
                  finance
                  nationality
                  registration_profile_type
                  candidate_unique_number
                  candidate_admission_status
                  financement
                  financial_situation
                  student_id{
                    _id
                  }
                  latest_previous_program {
                    _id
                    program
                    scholar_season_id {
                      _id
                      scholar_season
                    }
                  }
                  initial_intake_channel
                  billing_id {
                    _id
                    deposit_status
                    is_deposit_completed
                    deposit_pay_amount
                    deposit
                    account_number
                    accumulated_late
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
                  photo
                  registration_email_due_date {
                    due_date
                    due_time
                  }
                  reg_n8_sent_date {
                    sent_date
                    sent_time
                  }
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
                  }
                  type_of_formation_id {
                    _id
                    type_of_information
                    type_of_formation
                    sigle
                    admission_form_id {
                      _id
                      form_builder_name
                    }
                  }
                  registration_profile {
                    _id
                    name
                    is_down_payment
                    discount_on_full_rate
                    type_of_formation {
                      _id
                      type_of_information
                    }
                    additional_cost_ids {
                      additional_cost
                      amount
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
                    short_name
                    long_name
                    campuses {
                      _id
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
                  program_desired
                  trial_date
                  date_added
                  selected_payment_plan {
                    name
                    times
                    additional_expense
                    total_amount
                    payment_date {
                      date
                      amount
                    }
                    down_payment
                  }
                  registered_at {
                    date
                    time
                  }
                  resign_after_school_begins_at {
                    date
                    time
                  }
                  no_show_at {
                    date
                    time
                  }
                  hubspot_deal_id
                  hubspot_contact_id
                  is_hubspot_updated
                  is_manual_updated
                  continuous_formation_manager_id {
                    _id
                    first_name
                    last_name
                    civility
                    profile_picture
                    email
                    position
                  }
                  admission_process_id {
                    _id
                    steps {
                      _id
                      index
                      step_title
                      step_type
                      step_status
                      status
                    }
                  }
                }
              }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
          lang: this.translate.currentLang,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getAllAssignmentCheckbox(filter, sortValue, pagination, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($pagination: PaginationInput, $sort: CandidateSortInput, $user_type_ids: [ID]) {
          GetAllCandidates(${filter}, sorting: $sort, pagination: $pagination, user_type_ids: $user_type_ids) {
                  _id
                  jury_decision
                  trial_date
                  region
                  civility
                  first_name
                  last_name
                  telephone
                  payment_method
                  is_admitted
                  email
                  is_oscar_updated
                  finance
                  nationality
                  registration_profile_type
                  candidate_unique_number
                  candidate_admission_status
                  billing_id {
                    _id
                    deposit_status
                    is_deposit_completed
                    deposit_pay_amount
                    deposit
                    account_number
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
                  photo
                  registration_email_due_date {
                    due_date
                    due_time
                  }
                  reg_n8_sent_date {
                    sent_date
                    sent_time
                  }
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
                  }
                  type_of_formation_id {
                    _id
                    type_of_information
                    type_of_formation
                  }
                  registration_profile {
                    _id
                    name
                    is_down_payment
                    discount_on_full_rate
                    type_of_formation {
                      _id
                      type_of_information
                    }
                    additional_cost_ids {
                      additional_cost
                      amount
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
                    short_name
                    long_name
                    campuses {
                      _id
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
                  program_desired
                  trial_date
                  date_added
                  selected_payment_plan {
                    name
                    times
                    additional_expense
                    total_amount
                    payment_date {
                      date
                      amount
                    }
                    down_payment
                  }
                  registered_at {
                    date
                    time
                  }
                  resign_after_school_begins_at {
                    date
                    time
                  }
                  no_show_at {
                    date
                    time
                  }
                  hubspot_deal_id
                  hubspot_contact_id
                  is_hubspot_updated
                  is_manual_updated
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
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  UpdateJuryDecision(candidates_id, candidate_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidate($candidate_input: CandidateInput!, $lang: String) {
            UpdateCandidate(_id: "${candidates_id}", candidate_input: $candidate_input, lang: $lang) {
              _id
              jury_decision
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

  UpdateProgramDesired(candidates_id, candidate_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidate($candidate_input: CandidateInput!, $lang: String) {
            UpdateCandidate(_id: "${candidates_id}", candidate_input: $candidate_input, lang: $lang) {
              _id
              program_desired
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

  getAllCandidatesFICheckbox(pagination, sortValue, filter, searching, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
                  _id
                  is_oscar_updated
                  is_hubspot_updated
                  is_manual_updated
                  intake_channel {
                    _id
                    program
                    scholar_season_id {
                      _id
                    }
                  }
                  registration_profile {
                    _id
                    name
                  }
                  school {
                    _id
                    short_name
                    long_name
                  }
                  campus {
                    _id
                    name
                  }
                  level {
                    _id
                    name
                  }
                  scholar_season {
                    _id
                    scholar_season
                  }
                  speciality {
                    _id
                    name
                  }
                  sector {
                    _id
                    name
                  }
                  type_of_formation_id {
                    _id
                    type_of_information
                    type_of_formation
                  }
                  nationality
                  civility
                  first_name
                  last_name
                  email
                  school_mail
                  announcement_call
                  announcement_email {
                    sent_date
                    sent_time
                  }
                  admission_member_id {
                    _id
                    first_name
                    last_name
                    civility
                    email
                  }
                  payment_supports {
                    relation
                    family_name
                    name
                    civility
                    email
                  }
                  candidate_admission_status
                  user_id {
                    _id
                  }
                }
              }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getAllCandidatesFCCheckbox(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
                  _id
                  is_oscar_updated
                  is_hubspot_updated
                  is_manual_updated
                  intake_channel {
                    _id
                    program
                    scholar_season_id {
                      _id
                    }
                  }
                  registration_profile {
                    _id
                    name
                  }
                  school {
                    _id
                    short_name
                    long_name
                  }
                  campus {
                    _id
                    name
                  }
                  level {
                    _id
                    name
                  }
                  scholar_season {
                    _id
                    scholar_season
                  }
                  speciality {
                    _id
                    name
                  }
                  sector {
                    _id
                    name
                  }
                  type_of_formation_id {
                    _id
                    type_of_information
                    type_of_formation
                  }
                  nationality
                  civility
                  first_name
                  last_name
                  email
                  school_mail
                  announcement_call
                  announcement_email {
                    sent_date
                    sent_time
                  }
                  admission_member_id {
                    _id
                    first_name
                    last_name
                    civility
                    email
                  }
                  payment_supports {
                    relation
                    family_name
                    name
                    civility
                    email
                  }
                  candidate_admission_status
                  user_id {
                    _id
                  }
                }
              }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getAllOscarCampus(pagination, sortValue, search, filterQuery, source_type, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort,
            filter: {candidate_admission_status: admitted, ${filterQuery}, ${
          source_type ? `source_type: ${source_type}` : ``
        } crm_table: oscar}, ${search}
          ) {
              _id
              region
              civility
              first_name
              last_name
              count_document
              telephone
              email
              program_desired
              trial_date
              date_added
              nationality
              oscar_campus_id
              hubspot_deal_id
              hubspot_contact_id
            }
          }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getAllOscarCampusForExport(pagination, sortValue, search, filterQuery, source_type): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($pagination: PaginationInput, $sort: CandidateSortInput) {
          GetAllCandidates(pagination: $pagination, sorting: $sort,
            filter: {candidate_admission_status: admitted, ${filterQuery}, ${
          source_type ? `source_type: ${source_type}` : ``
        } crm_table: oscar}, ${search}
          ) {
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
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getAllOscarCampusForAssign(pagination, sortValue, search, filterQuery, source_type): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($pagination: PaginationInput, $sort: CandidateSortInput) {
          GetAllCandidates(pagination: $pagination, sorting: $sort,
            filter: {candidate_admission_status: admitted, ${filterQuery}, ${
          source_type ? `source_type: ${source_type}` : ``
        } crm_table: oscar}, ${search}
          ) {
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
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getAllReadmissionCheckbox(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query getAllReadmissionCheckbox($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
                  _id
                  jury_decision
                  civility
                  first_name
                  last_name
                  telephone
                  payment_method
                  email
                  school_mail
                  finance
                  nationality
                  candidate_admission_status
                  campus {
                    _id
                    name
                  }
                  intake_channel {
                    _id
                    program
                    scholar_season_id {
                      _id
                      scholar_season
                    }
                  }
                  type_of_formation_id {
                    _id
                    type_of_information
                    type_of_formation
                  }
                  registration_profile {
                    _id
                    name
                    type_of_formation {
                      _id
                      type_of_information
                    }
                  }
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
                    short_name
                    long_name
                  }
                  payment_supports {
                    relation
                    family_name
                    name
                    civility
                    email
                  }
                  date_added
                  announcement_call
                  announcement_email {
                    sent_date
                    sent_time
                  }
                }
              }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }
  getAllOscarCampusCheckbox(pagination, sortValue, search, filterQuery, source_type, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort,
            filter: {candidate_admission_status: admitted, ${filterQuery}, ${
          source_type ? `source_type: ${source_type}` : ``
        } crm_table: oscar}, ${search}
          ) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getAllHubspotCampus(
    pagination,
    sortValue,
    search,
    oscar_campus_tenant_key,
    source_type,
    previous_school,
    previous_campus,
    previous_level,
    user_type_ids,
    hubspot_scholar_seasons 
  ): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput) {
          GetAllCandidates(
            user_type_ids: $user_type_ids, 
            pagination: $pagination, 
            sorting: $sort,
            filter: {candidate_admission_status: admitted, ${
              oscar_campus_tenant_key ? `oscar_campus_tenant_key: "${oscar_campus_tenant_key}"` : ``
            }, ${source_type ? `source_type: ${source_type}` : ``},
            crm_table: hubspot, 
            ${previous_school ? `previous_schools: ${previous_school}` : ``},
            ${previous_campus ? `previous_campuses: ${previous_campus}` : ``},
            ${previous_level ? `previous_levels: ${previous_level}` : ``},
            ${hubspot_scholar_seasons ? `hubspot_scholar_seasons: ${hubspot_scholar_seasons}` : ``}}, 
            ${search}
          ) {
              _id
              region
              civility
              first_name
              last_name
              count_document
              telephone
              email
              program_desired
              trial_date
              date_added
              nationality
              oscar_campus_id
              hubspot_deal_id
              hubspot_contact_id
              previous_school
              previous_campus
              previous_level
              hubspot_scholar_season
            }
          }
        `,
        variables: {
          pagination,
          user_type_ids,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getAllHubspotCampusCheckbox(
    pagination,
    sortValue,
    search,
    oscar_campus_tenant_key,
    source_type,
    previous_school,
    previous_campus,
    previous_level,
    user_type_ids,
    hubspot_scholar_seasons 
  ): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort,
            filter: {candidate_admission_status: admitted, ${
              oscar_campus_tenant_key ? `oscar_campus_tenant_key: "${oscar_campus_tenant_key}"` : ``
            }, ${source_type ? `source_type: ${source_type}` : ``},
            crm_table: hubspot, ${previous_school ? `previous_schools: ${previous_school}` : ``},
            ${previous_campus ? `previous_campuses: ${previous_campus}` : ``},
            ${previous_level ? `previous_levels: ${previous_level}` : ``},
            ${hubspot_scholar_seasons ? `hubspot_scholar_seasons: ${hubspot_scholar_seasons}` : ``}}, ${search}
          ) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,
        variables: {
          pagination,
          user_type_ids,
          sort: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }
  getAllHubspotCampusCheckboxId(
    pagination,
    sortValue,
    search,
    oscar_campus_tenant_key,
    source_type,
    previous_school,
    previous_campus,
    previous_level,
    hubspot_scholar_seasons
  ): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($pagination: PaginationInput, $sort: CandidateSortInput) {
          GetAllCandidates(pagination: $pagination, sorting: $sort,
            filter: {candidate_admission_status: admitted, ${
              oscar_campus_tenant_key ? `oscar_campus_tenant_key: "${oscar_campus_tenant_key}"` : ``
            }, ${source_type ? `source_type: ${source_type}` : ``},
            crm_table: hubspot, ${previous_school ? `previous_schools: ${previous_school}` : ``},
            ${previous_campus ? `previous_campuses: ${previous_campus}` : ``},
            ${previous_level ? `previous_levels: ${previous_level}` : ``},
            ${hubspot_scholar_seasons ? `hubspot_scholar_seasons: ${hubspot_scholar_seasons}` : ``}}, ${search}
          ) {
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
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }
  getAllHubspotCampusCheckboxForAssign(
    pagination,
    sortValue,
    search,
    oscar_campus_tenant_key,
    source_type,
    previous_school,
    previous_campus,
    previous_level,
    hubspot_scholar_seasons
  ): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($pagination: PaginationInput, $sort: CandidateSortInput) {
          GetAllCandidates(pagination: $pagination, sorting: $sort,
            filter: {candidate_admission_status: admitted, ${
              oscar_campus_tenant_key ? `oscar_campus_tenant_key: "${oscar_campus_tenant_key}"` : ``
            }, ${source_type ? `source_type: ${source_type}` : ``},
            crm_table: hubspot, ${previous_school ? `previous_schools: ${previous_school}` : ``},
            ${previous_campus ? `previous_campuses: ${previous_campus}` : ``},
            ${previous_level ? `previous_levels: ${previous_level}` : ``},
            ${hubspot_scholar_seasons ? `hubspot_scholar_seasons: ${hubspot_scholar_seasons}` : ``}}, ${search}
          ) {
              _id
              civility
              first_name
              last_name
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
  getAllProgramDesiredOfCandidate(oscar_campus_tenant_keys): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllProgramDesiredOfCandidate($oscar_campus_tenant_keys: [String]) {
            GetAllProgramDesiredOfCandidate(oscar_campus_tenant_keys: $oscar_campus_tenant_keys)
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          oscar_campus_tenant_keys,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllProgramDesiredOfCandidate']));
  }

  GetAllTenantKeyOfCandidate(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllTenantKeyOfCandidate{
            GetAllTenantKeyOfCandidate
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTenantKeyOfCandidate']));
  }

  GetAllTrialDateOfCandidate(oscar_campus_tenant_keys, programs_desired): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllTrialDateOfCandidate($oscar_campus_tenant_keys: [String], $programs_desired: [String]) {
            GetAllTrialDateOfCandidate(
              oscar_campus_tenant_keys: $oscar_campus_tenant_keys
              programs_desired: $programs_desired
              candidate_admission_statuses: [admitted]
            )
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          oscar_campus_tenant_keys,
          programs_desired,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTrialDateOfCandidate']));
  }

  GetAllTrialDateOfCandidateFollowUP(candidate_admission_statuses): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllTrialDateOfCandidate($candidate_admission_statuses: [EnumCandidateAdmissionStatus]) {
            GetAllTrialDateOfCandidate(candidate_admission_statuses: $candidate_admission_statuses)
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          candidate_admission_statuses,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllTrialDateOfCandidate']));
  }

  getCandidateRegistration(candidate_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetOneCandidate{
          GetOneCandidate(_id: "${candidate_id}") {
            _id
            is_adult
            is_emancipated_minor
            legal_representative{
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
            telephone
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
            iban
            bic
            autorization_account
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidate']));
  }

  getOneCandidate(candidate_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetOneCandidateNewContact{
          GetOneCandidate(_id: "${candidate_id}") {
            _id
            region
            civility
            first_name
            last_name
            telephone
            payment_method
            is_admitted
            email
            nationality
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
            intake_channel {
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
            registration_profile {
              _id
              name
              type_of_formation {
                _id
                type_of_information
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
              short_name
              long_name
              campuses {
                _id
                name
                levels {
                  _id
                  name
                }
              }
            }
            city
            address
            post_code
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
            program_desired
            trial_date
            emergency_contacts {
              civility
              email
              family_name
              fixed_phone
              is_contact_person_in_emergency
              name
              relation
              tele_phone
              phone_number_indicative
              parent_address{
                address
                postal_code
                city
                post_code_of_birth
                city_of_birth
                is_main_address
              }
            }
            is_emancipated_minor
            legal_representative{
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
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidate']));
  }

  getOneCandidateCard(candidate_id): Observable<any> {
    return this.apollo
      .watchQuery<any>({
        query: gql`
        query GetOneCandidateCard{
          GetOneCandidate(_id: "${candidate_id}") {
            _id
            jury_decision
            trial_date
            region
            civility
            first_name
            last_name
            telephone
            payment_method
            is_admitted
            email
            is_oscar_updated
            finance
            nationality
            registration_profile_type
            candidate_unique_number
            candidate_admission_status
            financement
            school_mail
            diploma_status
            admission_document_process_status
            billing_id {
              _id
              deposit_status
              is_deposit_completed
              deposit_pay_amount
              deposit
              account_number
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
            photo
            registration_email_due_date {
              due_date
              due_time
            }
            reg_n8_sent_date {
              sent_date
              sent_time
            }
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
            }
            type_of_formation_id {
              _id
              type_of_information
              type_of_formation
              sigle
              admission_form_id {
                _id
                form_builder_name
              }
            }
            registration_profile {
              _id
              name
              is_down_payment
              discount_on_full_rate
              type_of_formation {
                _id
                type_of_information
              }
              additional_cost_ids {
                additional_cost
                amount
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
              short_name
              long_name
              campuses {
                _id
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
            # This one from 049
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
            program_desired
            trial_date
            date_added
            selected_payment_plan {
              name
              times
              additional_expense
              total_amount
              payment_date {
                date
                amount
              }
              down_payment
            }
            registered_at {
              date
              time
            }
            resign_after_school_begins_at {
              date
              time
            }
            no_show_at {
              date
              time
            }
            hubspot_deal_id
            hubspot_contact_id
            is_hubspot_updated
            is_manual_updated
            continuous_formation_manager_id {
              _id
              first_name
              last_name
              civility
              profile_picture
              email
              position
            }
            admission_process_id {
              _id
              steps {
                _id
                index
                step_title
                step_type
                step_status
                status
                is_only_visible_based_on_condition
              }
            }
            latest_previous_program{
              _id
              program
              scholar_season_id {
                _id
                scholar_season
              }
            }
            type_of_readmission
            previous_programs {
              _id
            }
            student_id {
              _id
            }
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidate']));
  }
  getOneCandidateFile(candidate_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query {
          GetOneCandidate(_id: "${candidate_id}") {
            candidate_unique_number
            _id
                  jury_decision
                  trial_date
                  region
                  civility
                  first_name
                  last_name
                  telephone
                  payment_method
                  is_admitted
                  email
                  is_oscar_updated
                  finance
                  nationality
                  registration_profile_type
                  candidate_unique_number
                  candidate_admission_status
                  financement
                  school_mail
                  diploma_status
                  admission_document_process_status
                  billing_id {
                    _id
                    deposit_status
                    is_deposit_completed
                    deposit_pay_amount
                    deposit
                    account_number
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
                  photo
                  registration_email_due_date {
                    due_date
                    due_time
                  }
                  reg_n8_sent_date {
                    sent_date
                    sent_time
                  }
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
                  }
                  type_of_formation_id {
                    _id
                    type_of_information
                    type_of_formation
                    sigle
                    admission_form_id {
                      _id
                      form_builder_name
                    }
                  }
                  registration_profile {
                    _id
                    name
                    is_down_payment
                    discount_on_full_rate
                    type_of_formation {
                      _id
                      type_of_information
                    }
                    additional_cost_ids {
                      additional_cost
                      amount
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
                    short_name
                    long_name
                    campuses {
                      _id
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
                  # This one from 049
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
                  program_desired
                  trial_date
                  date_added
                  selected_payment_plan {
                    name
                    times
                    additional_expense
                    total_amount
                    payment_date {
                      date
                      amount
                    }
                    down_payment
                  }
                  registered_at {
                    date
                    time
                  }
                  resign_after_school_begins_at {
                    date
                    time
                  }
                  no_show_at {
                    date
                    time
                  }
                  hubspot_deal_id
                  hubspot_contact_id
                  is_hubspot_updated
                  is_manual_updated
                  continuous_formation_manager_id {
                    _id
                    first_name
                    last_name
                    civility
                    profile_picture
                    email
                    position
                  }
                  admission_process_id {
                    _id
                    steps {
                      _id
                      index
                      step_title
                      step_type
                      step_status
                      status
                      is_only_visible_based_on_condition
                    }
                  }
                  latest_previous_program{
                    _id
                    program
                    scholar_season_id {
                      _id
                      scholar_season
                    }
                  }
                  type_of_readmission
                  previous_programs {
                    _id
                  }
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidate']));
  }

  getPromoForRegistration(school, campus, level, region, gender): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetPromoAllExternalsForDisplay{
          GetPromoAllExternalsForDisplay(
            school: "${school}",
            campus: "${campus}",
            level: "${level}",
            region: "${region}",
            gender: ${gender}
            ) {
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
      })
      .valueChanges.pipe(map((resp) => resp.data['GetPromoAllExternalsForDisplay']));
  }

  getPromoForAlumni(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllPromoExternals(filter: { module: "006_Alumni" }) {
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
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllPromoExternals']));
  }

  getAllPromo(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
            GetAllPromoExternals {
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
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllPromoExternals']));
  }

  // find error when accessing candidate card details
  // message: "Field \"user_id\" of type \"User\" must have a selection of subfields. Did you mean \"user_id { ... }\"?"
  getCandidateDetails(candidate_id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetOneCandidate{
          GetOneCandidate(_id: "${candidate_id}") {
            _id
            region
            civility
            first_name
            last_name
            telephone
            payment_method
            is_admitted
            registration_certificate
            email
            registration_certificate
            nationality
            candidate_unique_number
            candidate_admission_status
            readmission_status
            program_status
            financial_situation
            is_future_program_assigned
            admission_process_id {
              _id
              steps {
                step_type
              }
            }
            student_id {
              _id
              program_sequence_ids {
                _id
                name
                program_id {
                  _id
                  program
                }
                program_sequence_groups {
                  _id
                  student_classes {
                    name
                    students_id {
                      _id
                    }
                    program_sequence_id {
                      program_modules_id {
                        program_subjects_id {
                          name
                        }
                      }
                    }
                  }
                }
                start_date{
                  date
                  time
                }
                end_date{
                  date
                  time
                }
                type_of_sequence
              }
            }
            billing_id {
              _id
              profil_rate
              account_number
              deposit
              deposit_pay_amount
              terms {
                _id
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
              }
              accumulated_late
              amount_late
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
            photo
            registration_email_due_date {
              due_date
              due_time
            }
            reg_n8_sent_date {
              sent_date
              sent_time
            }
            announcement_call
            announcement_email {
              sent_date
              sent_time
            }
            intake_channel {
              _id
              program
              school_id {
                short_name
              }
              campus {
                name
              }
              level {
                name
              }
              scholar_season_id {
                _id
                scholar_season
              }
              speciality_id {
                name
              }
              course_sequence_id {
                program_sequences_id {
                  program_sequence_groups {
                    _id
                    student_classes {
                      name
                      students_id {
                        _id
                      }
                      program_sequence_id {
                        program_modules_id {
                          program_subjects_id {
                            name
                          }
                        }
                      }
                    }
                  }
                  name
                  type_of_sequence
                  start_date {
                    date
                    time
                  }
                  end_date {
                    date
                    time
                  }
                }
              }
            }
            type_of_formation_id {
              _id
              type_of_information
              type_of_formation
            }
            registration_profile {
              _id
              name
              discount_on_full_rate
              additional_cost_ids {
                additional_cost
                amount
              }
              type_of_formation {
                _id
                type_of_information
              }
              is_down_payment
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
              short_name
              long_name
              campuses {
                _id
                name
                levels {
                  _id
                  name
                }
              }
            }
            selected_payment_plan {
              total_amount
              down_payment
            }
            school_mail
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
            program_desired
            trial_date
            school_contract_pdf_link
            date_added
            engaged_at {
              date
              time
            }
            registered_at {
              date
              time
            }
            resigned_after_engaged_at {
              date
              time
            }
            resign_after_school_begins_at {
              date
              time
            }
            no_show_at {
              date
              time
            }
            resigned_after_registered_at {
              date
              time
            }
            inscription_at {
              date
              time
            }
            resigned_at {
              date
              time
            }
            candidate_sign_date {
              date
              time
            }
            school_contract_pdf_link
            bill_validated_at {
              date
              time
            }
            payment_transfer_check_data {
              s3_document_name
            }
            financement_validated_at {
              date
              time
            }
            initial_intake_channel
            latest_previous_program {
              _id
              program
              school_id {
                short_name
              }
              campus {
                name
              }
              level {
                name
              }
              scholar_season_id {
                _id
                scholar_season
              }
              speciality_id {
                name
              }
            }
            previous_programs {
              _id
            telephone
            payment_method
            is_admitted
            registration_certificate
            candidate_unique_number
            candidate_admission_status
            admission_process_id {
              _id
              steps {
                step_type
              }
            }
            billing_id {
              _id
              account_number
              deposit
              deposit_pay_amount
              terms {
                _id
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
              }
              accumulated_late
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
            registration_email_due_date {
              due_date
              due_time
            }
            reg_n8_sent_date {
              sent_date
              sent_time
            }
            announcement_call
            announcement_email {
              sent_date
              sent_time
            }
            intake_channel {
              _id
              program
              school_id {
                short_name
              }
              campus {
                name
              }
              level {
                name
              }
              scholar_season_id {
                _id
                scholar_season
              }
              speciality_id {
                name
              }
            }
            type_of_formation_id {
              _id
              type_of_information
              type_of_formation
            }
            registration_profile {
              _id
              name
              discount_on_full_rate
              additional_cost_ids {
                additional_cost
                amount
              }
              type_of_formation {
                _id
                type_of_information
              }
              is_down_payment
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
              short_name
              long_name
              campuses {
                _id
                name
                levels {
                  _id
                  name
                }
              }
            }
            selected_payment_plan {
              total_amount
              down_payment
            }
            school_mail
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
            is_whatsapp
            participate_in_open_house_day
            participate_in_job_meeting
            count_document
            user_id
            payment_splits {
              payer_name
              percentage
            }
            program_desired
            trial_date
            school_contract_pdf_link
            date_added
            engaged_at {
              date
              time
            }
            registered_at {
              date
              time
            }
            resign_after_school_begins_at {
              date
              time
            }
            no_show_at {
              date
              time
            }
            resigned_after_engaged_at {
              date
              time
            }
            resigned_after_registered_at {
              date
              time
            }
            inscription_at {
              date
              time
            }
            resigned_at {
              date
              time
            }
            candidate_sign_date {
              date
              time
            }
            school_contract_pdf_link
            bill_validated_at {
              date
              time
            }
            payment_transfer_check_data {
              s3_document_name
            }
            financement_validated_at {
              date
              time
            }
            initial_intake_channel
            latest_previous_program {
              _id
              program
              school_id {
                short_name
              }
              campus {
                name
              }
              level {
                name
              }
              scholar_season_id {
                _id
                scholar_season
              }
              speciality_id {
                name
              }
            }
            }
            mission_card_validated_at {
              date
              time
            }
            resignation_missing_prerequisites_at {
              date
              time
            }
            current_school_contract_amendment_form {
              _id
              school_amendment_form_link
              school_amendment_pdf_name
              form_status
            }
            full_rate_id {
              amount_internal
              amount_external
            }
            registration_profile_type
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidate']));
  }

  getAllStepValidationMessages(school, campus, step): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllStepValidationMessages{
          GetStepValidationMessageForDisplay(school: "${school}", campus: "${campus}", validation_step: ${step}
          ) {
            _id
            validation_step
            first_title
            second_title
            school
            campus
            image_upload
            video_link
            is_published
            generic
            region
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetStepValidationMessageForDisplay']));
  }

  getStepValidationMessages(school, campus, step): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetStepValidationMessages{
          GetStepValidationMessageForDisplay(school: "${school}", campus: "${campus}", validation_step: ${step}
          ) {
            _id
            first_title
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetStepValidationMessageForDisplay']));
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

  GetAllFullRate(scholar_season_id, school_id, campus, level): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllFullRate($school_id: ID, $scholar_season_id: ID, $campus: ID, $level: ID) {
            GetAllFullRate(school_id: $school_id, scholar_season_id: $scholar_season_id, campus: $campus, level: $level) {
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

  GetAllProfilRatesByName(rate): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query {
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

  GetDevLeader(candidate_campus): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetDevLeader{
          GetAllUsers(user_type: ["617f64ec5a48fe2228518810"], candidate_campus: "${candidate_campus}") {
            _id
            first_name
            civility
            last_name
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }

  GetDevMember(candidate_campus): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetDevMember{
          GetAllUsers(user_type: ["617f64ec5a48fe2228518811"], candidate_campus: "${candidate_campus}") {
            _id
            first_name
            civility
            last_name
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }

  GetDevLeaders(candidate_campus): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query {
          GetAllUsers(candidate_campus: "${candidate_campus}") {
            _id
            first_name
            civility
            last_name
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }

  GetDevMembers(candidate_campus): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query {
          GetAllUsers(candidate_campus: "${candidate_campus}") {
            _id
            first_name
            civility
            last_name
          }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getNationalityCandidate(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidates($pagination: PaginationInput, $sort: CandidateSortInput) {
            GetAllCandidates(pagination: $pagination, sorting: $sort, ${filter}) {
                  _id
                  nationality
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

  getAllMemberAdmission() {
    return this.apollo
      .query({
        query: gql`
          query getAllMemberAdmission($entity: [EnumEntityType!]) {
            GetAllUsers(entity: $entity) {
              _id
              civility
              first_name
              last_name
              profile_picture
              entities {
                school {
                  _id
                  short_name
                }
                campus {
                  _id
                  name
                }
              }
            }
          }
        `,
        variables: {
          // 617f64ec5a48fe2228518811 is usertype for Admission Member
          // user_type: ['617f64ec5a48fe2228518811']
          entity: ['admission'],
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getAllMemberByDirector(campuses, school) {
    return this.apollo
      .query({
        query: gql`
          query GetAllUsers($campuses: [ID]) {
            GetAllUsers(campuses: $campuses, school: "${school}") {
              _id
              civility
              first_name
              last_name
              profile_picture
              entities {
                candidate_school
                candidate_campus
              }
            }
          }
        `,
        variables: {
          campuses,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getMentorAdmissionAssignMentor(filter) {
    return this.apollo
      .query({
        query: gql`
          query getMentorAdmissionAssignMentor {
            GetAllStudents(${filter}) {
              _id
              civility
              first_name
              last_name
              candidate_school
              candidate_campus
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getAllIntakeChannelDropdown(search) {
    return this.apollo
      .query({
        query: gql`
          query GetAllIntakeChannelDropdown{
            GetAllIntakeChannelDropdown
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllIntakeChannelDropdown']));
  }

  getIntakeChannelDropdown() {
    return this.apollo
      .query({
        query: gql`
          query GetAllPrograms{
            GetAllPrograms {
              _id
              intake_channel
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllPrograms']));
  }

  getIntakeChannelCampusDropdown(filter) {
    return this.apollo
      .query({
        query: gql`
          query GetAllIntakeChannels{
            GetAllIntakeChannels(${filter}) {
              _id
              intake_channel
              campus
              school
              level
              sector_id {
                _id
                name
              }
              speciality_id {
                _id
                name
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllIntakeChannels']));
  }

  SendNotifN1(candidate_ids): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendCandidateN1($candidate_ids: [ID!]!, $lang: String) {
            SendCandidateN1(candidate_ids: $candidate_ids, lang: $lang)
          }
        `,
        variables: {
          candidate_ids,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['SendCandidateN1']));
  }

  SendReadRegN1(candidate_ids, is_include_flyer): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendReadRegN1($candidate_ids: [ID!]!, $lang: String, $is_include_flyer: Boolean) {
            SendReadRegN1(candidate_ids: $candidate_ids, lang: $lang, is_include_flyer: $is_include_flyer)
          }
        `,
        variables: {
          candidate_ids,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
          is_include_flyer,
        },
      })
      .pipe(map((resp) => resp.data['SendReadRegN1']));
  }

  SendReadRegN2(candidate_ids): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendReadRegN2($candidate_ids: [ID!]!, $lang: String) {
            SendReadRegN2(candidate_ids: $candidate_ids, lang: $lang)
          }
        `,
        variables: {
          candidate_ids,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['SendReadRegN1']));
  }

  SendNotifRegistrationN8(candidate_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendNotificationREGISTRATION_N8($candidate_id: ID!, $lang: String) {
            SendNotificationREGISTRATION_N8(candidate_id: $candidate_id, lang: $lang)
          }
        `,
        variables: {
          candidate_id,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['SendNotificationREGISTRATION_N8']));
  }

  SendNotifRegistrationN8ResendNewForm(candidate_id, isReinscriptionNo): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendNotificationREGISTRATION_N8($candidate_id: ID!, $lang: String, $isReinscriptionNo: Boolean) {
            SendNotificationREGISTRATION_N8(candidate_id: $candidate_id, lang: $lang, isReinscriptionNo: $isReinscriptionNo)
          }
        `,
        variables: {
          candidate_id,
          isReinscriptionNo,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['SendNotificationREGISTRATION_N8']));
  }

  ImportGeneralDashboardAdmission(import_general_admission_dashboard_input, file): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ImportGeneralDashboardAdmission(
            $import_general_admission_dashboard_input: ImportGeneralDashboardAdmissionInput
            $file: Upload!
            $lang: String
          ) {
            ImportGeneralDashboardAdmission(
              import_general_admission_dashboard_input: $import_general_admission_dashboard_input
              file: $file
              lang: $lang
            ) {
              _id
            }
          }
        `,
        variables: {
          file,
          import_general_admission_dashboard_input,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['ImportGeneralDashboardAdmission']));
  }

  ImportReconciliationAndLetterage(import_reconciliation_letterage_input, file): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ImportReconciliationAndLetterage(
            $import_reconciliation_letterage_input: ImportReconciliationLetterageInput
            $file: Upload!
          ) {
            ImportReconciliationAndLetterage(import_reconciliation_letterage_input: $import_reconciliation_letterage_input, file: $file) {
              confirm_reconciliation {
                _id
                accounting_document
                transaction_date
                transaction_time
                transaction_type
                description
                from
                to
                bank
                reference
                amount
                amount_type
                candidate_id
                intake_channel
                letter
                student_id {
                  _id
                  first_name
                  last_name
                  civility
                  email
                  candidate_id {
                    _id
                    payment_supports {
                      civility
                      name
                      family_name
                    }
                  }
                }
              }
              assign_reconciliation {
                _id
                accounting_document
                transaction_date
                transaction_time
                transaction_type
                description
                from
                to
                bank
                reference
                amount
                amount_type
                candidate_id
                intake_channel
                letter
                student_ids {
                  _id
                  first_name
                  last_name
                  civility
                  email
                  candidate_id {
                    _id
                    payment_supports {
                      civility
                      name
                      family_name
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          file,
          import_reconciliation_letterage_input,
          // lang: localStorage.getItem('currentLang'),
        },
        context: {
          useMultipart: true,
        },
      })
      .pipe(map((resp) => resp.data['ImportReconciliationAndLetterage']));
  }

  finishReconciliationAndLetterage(reconciliationAndLetterage: any[]): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation FinishReconciliationAndLetterage($reconciliationAndLetterage: [ReconciliationAndLetterageInput]) {
            FinishReconciliationAndLetterage(reconciliation_letterage_input: $reconciliationAndLetterage)
          }
        `,
        variables: { reconciliationAndLetterage },
      })
      .pipe(map((resp) => resp.data['FinishReconciliationAndLetterage']));
  }

  assignReconciliation(reconciliationAndLetterage: any[]): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AssignReconciliation($reconciliationAndLetterage: [ReconciliationAndLetterageInput]) {
            AssignReconciliation(reconciliation_letterage_input: $reconciliationAndLetterage) {
              confirm_lettrage {
                _id
                accounting_document
                transaction_date
                transaction_time
                transaction_type
                transaction
                description
                from
                to
                bank
                reference
                amount
                candidate_id
                intake_channel
                letter
                student_id {
                  _id
                  first_name
                  last_name
                  civility
                  email
                  candidate_id {
                    _id
                    intake_channel
                    payment_supports {
                      civility
                      name
                      family_name
                    }
                  }
                  billing_id {
                    deposit
                    deposit_status
                    intake_channel
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
                term_index
              }
              assign_lettrage {
                _id
                accounting_document
                transaction_date
                transaction_time
                transaction_type
                transaction
                description
                from
                to
                bank
                reference
                amount
                candidate_id
                intake_channel
                letter
                student_id {
                  _id
                  first_name
                  last_name
                  civility
                  email
                  candidate_id {
                    _id
                    intake_channel
                    payment_supports {
                      civility
                      name
                      family_name
                    }
                  }
                  billing_id {
                    deposit
                    deposit_status
                    intake_channel
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
                term_index
              }
            }
          }
        `,
        variables: { reconciliationAndLetterage },
      })
      .pipe(map((resp) => resp.data['AssignReconciliation']));
  }

  SendRegistrationNotification(candidate_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendRegistrationNotification($candidate_id: ID!, $lang: String) {
            SendRegistrationNotification(candidate_id: $candidate_id, lang: $lang) {
              _id
            }
          }
        `,
        variables: {
          candidate_id,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['SendCandidateN1']));
  }

  ChangeMentorToManyCandidate(candidates_id, mentors_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ChangeMentorToManyCandidate($candidates_id: [ID!]!, $mentors_id: [ID!]!, $lang: String) {
            ChangeMentorToManyCandidate(candidates_id: $candidates_id, mentors_id: $mentors_id, lang: $lang) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,
        variables: {
          candidates_id,
          mentors_id,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['ChangeMentorToManyCandidate']));
  }

  AssignProfilRateToManyCandidate(candidates_id, profil_rate, registration_profile_type, volume_hour?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AssignProfilRateToManyCandidate($candidates_id: [ID!]!, $volume_hour: Float, $lang: String) {
            AssignProfilRateToManyCandidate(
              candidates_id: $candidates_id,
              profil_rate: "${profil_rate}",
              registration_profile_type: ${registration_profile_type},
              volume_hour: $volume_hour,
              lang: $lang
              ) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,
        variables: {
          candidates_id,
          volume_hour: volume_hour ? volume_hour : null,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['AssignProfilRateToManyCandidate']));
  }

  AssignProfilRateToManyCandidateForReadmission(fi_input?, fc_input?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AssignProfilRateToManyCandidateForReadmission(
            $fi_input: AssignProfileRateInput
            $fc_input: AssignProfileRateInput
            $lang: String
          ) {
            AssignProfilRateToManyCandidateForReadmission(fi_input: $fi_input, fc_input: $fc_input, lang: $lang) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,
        variables: {
          fi_input,
          fc_input,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['AssignProfilRateToManyCandidateForReadmission']));
  }

  UpdateManyStudentAdmissionProcessStep(input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateManyStudentAdmissionProcessStep($input: [UpdateManyStudentAdmissionProcessStepInput]) {
            UpdateManyStudentAdmissionProcessStep(input: $input) {
              _id
              step_title
            }
          }
        `,
        variables: {
          input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateManyStudentAdmissionProcessStep']));
  }

  ChangeAdmissionMemberToManyCandidate(candidates_id, admission_members_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ChangeAdmissionMemberToManyCandidate($candidates_id: [ID!]!, $admission_members_id: [ID!]!, $lang: String) {
            ChangeAdmissionMemberToManyCandidate(candidates_id: $candidates_id, admission_members_id: $admission_members_id, lang: $lang) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,
        variables: {
          candidates_id,
          admission_members_id,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['ChangeAdmissionMemberToManyCandidate']));
  }

  ChangeAdmissionMemberToManyCandidateFC(candidates_id, admission_members_id, continuous_formation_managers_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ChangeAdmissionMemberToManyCandidate(
            $candidates_id: [ID!]!
            $admission_members_id: [ID]
            $lang: String
            $continuous_formation_managers_id: [ID]
          ) {
            ChangeAdmissionMemberToManyCandidate(
              candidates_id: $candidates_id
              admission_members_id: $admission_members_id
              lang: $lang
              continuous_formation_managers_id: $continuous_formation_managers_id
            ) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,
        variables: {
          candidates_id,
          admission_members_id,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
          continuous_formation_managers_id,
        },
      })
      .pipe(map((resp) => resp.data['ChangeAdmissionMemberToManyCandidate']));
  }

  AcceptRejectTransferCampus(candidate_id, campus, is_accepted): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AcceptRejectTransferCampus($candidate_id: ID!, $campus: String!, $is_accepted: Boolean!, $lang: String) {
            AcceptRejectTransferCampus(candidate_id: $candidate_id, campus: $campus, is_accepted: $is_accepted, lang: $lang) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,
        variables: {
          candidate_id,
          campus,
          is_accepted,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['AcceptRejectTransferCampus']));
  }

  UpdateCandidateCall(candidates_id, candidate_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidate($candidate_input: CandidateInput!, $lang: String) {
            UpdateCandidate(_id: "${candidates_id}", candidate_input: $candidate_input, lang: $lang) {
              _id
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

  UpdateCandidateStatusPostPone(candidates_id, candidate_input, is_prevent_resend_notif): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidate($candidate_input: CandidateInput!, $lang: String, $is_prevent_resend_notif: Boolean) {
            UpdateCandidate(_id: "${candidates_id}", candidate_input: $candidate_input, lang: $lang, is_prevent_resend_notif: $is_prevent_resend_notif) {
              _id
            }
          }
        `,
        variables: {
          candidate_input,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
          is_prevent_resend_notif
        },
      })
      .pipe(map((resp) => resp.data['UpdateCandidate']));
  }

  UpdateCandidateStatus(candidates_id, candidate_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidate($candidate_input: CandidateInput!, $lang: String) {
            UpdateCandidate(_id: "${candidates_id}", candidate_input: $candidate_input, lang: $lang) {
              _id
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
              payment_method
              is_admitted
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
              }
              registration_profile {
                _id
                name
                type_of_formation {
                  _id
                  type_of_information
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
                short_name
                long_name
                campuses {
                  _id
                  name
                  levels {
                    _id
                    name
                  }
                }
              }
              parents {
                relation
                family_name
                name
                civility
                is_same_address
                is_parent_also_payment_support
                parent_address {
                  address
                  additional_address
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
              program_desired
              trial_date
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

  UpdateCandidateId(candidates_id, candidate_input, is_save_identity_student?): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidate($candidate_input: CandidateInput!, $lang: String, $is_save_identity_student: Boolean) {
            UpdateCandidate(_id: "${candidates_id}", candidate_input: $candidate_input, lang: $lang, is_save_identity_student: $is_save_identity_student) {
              _id
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

  UpdateManyCandidates(candidates_id, candidate_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateManyCandidates($candidate_input: CandidateInput!, $candidates_id: [ID]!) {
            UpdateManyCandidates(candidates_id: $candidates_id, candidate_input: $candidate_input) {
              _id
            }
          }
        `,
        variables: {
          candidate_input,
          candidates_id,
        },
      })
      .pipe(map((resp) => resp.data['UpdateManyCandidates']));
  }

  UpdateJuryDecisionCandidates(jury_decision_inputs, candidate_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateManyCandidates($candidate_input: CandidateInput!, $jury_decision_inputs: [JuryDecisionInput]) {
            UpdateManyCandidates(candidate_input: $candidate_input, jury_decision_inputs: $jury_decision_inputs) {
              _id
            }
          }
        `,
        variables: {
          candidate_input,
          jury_decision_inputs,
        },
      })
      .pipe(map((resp) => resp.data['UpdateManyCandidates']));
  }

  UpdateManyJuryDecision(filter, select_all, is_readmission, candidate_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateManyCandidates($candidate_input: CandidateInput!, $select_all: Boolean, $is_readmission: Boolean) {
            UpdateManyCandidates(${filter}, candidate_input: $candidate_input, select_all: $select_all, is_readmission: $is_readmission) {
              _id
            }
          }
        `,
        variables: {
          candidate_input,
          is_readmission,
          select_all,
        },
      })
      .pipe(map((resp) => resp.data['UpdateManyCandidates']));
  }

  UpdateIncamingCall(candidates_id, candidate_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidate($candidate_input: CandidateInput!, $lang: String) {
            UpdateCandidate(_id: "${candidates_id}", candidate_input: $candidate_input, lang: $lang) {
              _id
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

  getCandidates(pagination, sortValue, filter_): Observable<any[]> {
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
    return this.httpClient.get<any[]>('assets/data/candidates.json');
  }

  getNationality() {
    return this.httpClient.get<any[]>('assets/data/nationality.json');
  }

  getTemplateImport(): Observable<any> {
    const API_URL = environment.apiUrl.replace('graphql', '');
    return this.httpClient.post(
      `${API_URL}downloadGeneralAdmissionTemplateCSV`,
      {
        openingDate: '04/01/2021',
        closingDate: '27/06/2021',
        delimiter: ';',
        lang: 'fr',
        scholarSeasons: ['21-22'],
        schools: ['EFAP'],
        campuses: ['PARIS', 'LYON'],
        levels: ['2', '1'],
      },
      { headers: { Accept: 'text/csv', 'Content-Type': 'application/json' } },
    );
  }

  downloadTemplateCSV(openingDate, closingDate, delimiter, scholarSeasons, schools, campuses, levels, sectors, specialities) {
    const lang = localStorage.getItem('currentLang');
    const API_URL = environment.apiUrl.replace('graphql', '');
    const element = document.createElement('a');
    if (specialities) {
      element.href = `${API_URL}downloadGeneralAdmissionTemplateCSV/${openingDate}/${closingDate}/${delimiter}/${lang}/${scholarSeasons}/${schools}/${campuses}/${levels}/${sectors}/${specialities}`;
    } else {
      element.href = `${API_URL}downloadGeneralAdmissionTemplateCSV/${openingDate}/${closingDate}/${delimiter}/${lang}/${scholarSeasons}/${schools}/${campuses}/${levels}/${sectors}`;
    }
    element.target = '_blank';
    element.download = 'Student Import CSV';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  GetDataForImportObjectives(short_name, user_type_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($user_type_id: ID){
            GetAllCandidateSchool(filter: { short_name: "${short_name}" }, user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              scholar_season_id {
                _id
                scholar_season
                rncp_titles{
                  _id
                }
              }
              campuses {
                _id
                name
                levels {
                  _id
                  name
                  specialities {
                    name
                  }
                }
                scholar_season_id {
                  _id
                  scholar_season
                  rncp_titles{
                      _id
                  }
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

  GetAllStudentAdmissionProcesses(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllFormProcesses($filter: FormProcessFilterInput) {
            GetAllFormProcesses(filter: $filter) {
              _id
              steps {
                _id
                step_title
                is_validation_required
                validator {
                  _id
                  name
                }
                is_user_who_receive_the_form_as_validator
                step_type
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllFormProcesses']));
  }

  GetAllFormProces(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllFormProcesses($filter: FormProcessFilterInput) {
            GetAllFormProcesses(filter: $filter) {
              _id
              candidate_id {
                _id
                first_name
                last_name
                civility
                school {
                  _id
                }
                campus {
                  _id
                }
                level {
                  _id
                }
              }
              steps {
                _id
                step_title
                is_validation_required
                validator {
                  _id
                  name
                  entity
                }
                is_user_who_receive_the_form_as_validator
                step_type
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllFormProcesses']));
  }

  getDataAdmissionProcessForValidator(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllFormProcesses($filter: FormProcessFilterInput) {
            GetAllFormProcesses(filter: $filter) {
              _id
              candidate_id {
                _id
                civility
                last_name
                first_name
                _id
                school {
                  _id
                }
                campus {
                  _id
                }
                level {
                  _id
                }
              }
              steps {
                _id
                step_title
                is_validation_required
                validator {
                  _id
                  name
                  entity
                }
                is_user_who_receive_the_form_as_validator
                step_type
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllFormProcesses']));
  }
  GetAllCandidateSchoolByScholarSeason(id, user_type_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($user_type_id: ID) {
            GetAllCandidateSchool(scholar_season_id: "${id}", user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              campuses {
                _id
                name
                levels {
                  _id
                  name
                  specialities {
                    name
                  }
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

  GetDataSchoolCampus(short_name?, user_type_id?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($user_type_id: ID){
            GetAllCandidateSchool(filter: { short_name: "${short_name}" }, user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              campuses {
                name
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          short_name: short_name ? short_name : null,
          user_type_id: user_type_id ? user_type_id : null,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  GetDataSchoolCampusByShortNames(short_names?, user_type_id?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($short_names: [String], $user_type_id: ID){
            GetAllCandidateSchool(filter: { short_names: $short_names }, user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              campuses {
                name
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          short_names: short_names ? short_names : null,
          user_type_id: user_type_id ? user_type_id : null,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  GetDataSchool(short_name, user_type_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($user_type_id: ID){
            GetAllCandidateSchool(filter: { short_name: "${short_name}" }, user_type_id: $user_type_id) {
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

  GetDataCandidatePerSchool(short_name, user_type_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($user_type_id: ID){
            GetAllCandidateSchool(filter: { short_name: "${short_name}" }, user_type_id: $user_type_id) {
              _id
              short_name
              long_name
              campuses {
                name
                bank {
                  name
                  city
                  address
                }
                levels {
                  name
                  specialities {
                    name
                  }
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

  GetTutorialContract(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/contract-tutorial.json');
  }

  GetFirstLastObjectiveDate(scholar_seasons, schools, campuses, levels): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetFirstLastObjectiveDate($scholar_seasons: [ID], $schools: [ID], $campuses: [ID], $levels: [ID]) {
            GetFirstLastObjectiveDate(scholar_seasons: $scholar_seasons, schools: $schools, campuses: $campuses, levels: $levels) {
              first_dates
              last_dates
            }
          }
        `,
        variables: {
          scholar_seasons,
          schools,
          levels,
          campuses,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetFirstLastObjectiveDate']));
  }
  // getAlumniCards(): Observable<any[]> {
  //   return this.httpClient.get<any[]>('assets/data/alumni-cards.json');
  // }

  getAlumniCards(filter, pagination): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAlumni($pagination: PaginationInput) {
            GetAllAlumni(${filter}, pagination: $pagination) {
              _id
            candidate_id {
              first_name
              last_name
              civility
              first_name_used
              last_name_used
              address
              city_of_birth
              country_of_birth
              email
            }
            upload_picture
            phone_number
            email
            professional_email
            date_of_birth
            civility
            first_name
            used_first_name
            last_name
            used_last_name
            created_at
            updated_at
            updated_by
            email_status
            promo_year
            school {
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
            sector {
              _id
              name
            }
            speciality {
              _id
              name
            }
            city
            country
            professional_status
            company
            activity_sector
            job_name
            last_survey_sent {
              date
              time
            }
            sent_by {
              _id
              first_name
              last_name
              civility
              email
            }
            email_status
              count_document
            }
          }
        `,
        variables: {
          pagination,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAlumni']));
  }

  getAllInternships(pagination, filter?, sorting?, searching?, user_type_login_id?): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllInternships(
            $pagination: PaginationInput
            $sorting: InternshipSortingInput
            $user_type_login_id: ID!
          ) {
            GetAllInternships(pagination: $pagination, ${filter && filter !== 'filter: {}' ? filter + ', ' : ''}sorting: $sorting${
          searching && searching !== 'searching: {}' ? ', ' + searching : ''
        }, user_type_login_id: $user_type_login_id) {
              _id
              internship_creation_step
              internship_report_due_date {
                date
                time
              }
              mentor_evaluation_due_date {
                date
                time
              }
              student_id {
                _id
                civility
                email
                user_id {
                  _id
                }
                first_name
                last_name
                specialization {
                  _id
                  name
                  sectors {
                    name
                    _id
                  }
                }
                # scholar_season {
                #   _id
                #   scholar_season
                # }
                candidate_school{
                  _id
                  short_name
                }
                candidate_campus{
                  _id
                  name
                }
                candidate_level{
                  _id
                  name
                }
                tele_phone
                candidate_id {
                  _id
                }
                companies {
                  status
                  is_active
                  company {
                    _id
                    # country
                    company_entity_id {
                      _id
                    }
                    status
                    company_name
                    company_logo
                    # description
                    brand
                    type_of_company
                    # type_of_industry
                    no_RC
                    mentor_ids {
                      _id
                    }
                    school_ids {
                      _id
                      short_name
                    }
                    company_addresses {
                      address
                      city
                      country
                      is_main_address
                      postal_code
                      region
                      department
                    }
                    count_document
                    # images {
                    #   s3_file_name
                    # }
                    company_logo
                    # banner
                    activity
                    # twitter_link
                    # instagram_link
                    # facebook_link
                    # youtube_link
                    # video_link
                    # website_link
                  }
                }
              }
              company_relation_member_id {
                _id
                first_name
                last_name
                civility
              }
              is_published
              internship_status
              agreement_status
              company_branch_id {
                _id
                company_name
              }
              internship_date {
                date_from
                date_to
                duration_in_weeks
                duration_in_months
              }
              is_company_manager_already_sign
              is_mentor_already_sign
              is_student_already_sign
              student_sign_status
              mentor_sign_status
              company_manager_sign_status
              company_relation_member_sign_status
              pdf_file_name
              count_document
            }
          }
        `,
        variables: {
          pagination,
          user_type_login_id,
          sorting: sorting ? sorting : null,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllInternships']));
  }

  getAllInternshipsCheckbox(pagination, filter?, sorting?, searching?, user_type_login_id?): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllInternships(
            $pagination: PaginationInput
            $sorting: InternshipSortingInput
            $user_type_login_id: ID!
          ) {
            GetAllInternships(pagination: $pagination, ${filter && filter !== 'filter: {}' ? filter + ', ' : ''}sorting: $sorting${
          searching && searching !== 'searching: {}' ? ', ' + searching : ''
        }, user_type_login_id: $user_type_login_id) {
              _id
              student_id {
                _id
                civility
                email
                user_id {
                  _id
                }
                first_name
                last_name
                candidate_school
                candidate_campus
                candidate_level
                tele_phone
                candidate_id {
                  _id
                }
              }
              count_document
            }
          }
        `,
        variables: {
          pagination,
          user_type_login_id,
          sorting: sorting ? sorting : null,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllInternships']));
  }

  getAllSpecialityInternships(user_type_login_id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllInternships($user_type_login_id: ID!) {
            GetAllInternships(user_type_login_id: $user_type_login_id) {
              student_id {
                specialization {
                  _id
                  name
                  sectors {
                    name
                    _id
                  }
                }
              }
            }
          }
        `,
        variables: {
          user_type_login_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllInternships']));
  }

  GetAllUsersCRM(user_type, pagination?, last_name?, sorting?, school?, programs?, schools?, campuses?, levels?): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllUsers(
            $user_type: [ID!]
            $pagination: PaginationInput
            $last_name: String
            $sorting: UserSorting
            $school: ID
            $programs: [String]
            $campuses: [ID]
            $schools: [ID]
            $levels: [ID]
          ) {
            GetAllUsers(
              user_type: $user_type
              pagination: $pagination
              last_name: $last_name
              sorting: $sorting
              school: $school
              programs: $programs
              campuses: $campuses
              schools: $schools
              levels: $levels
            ) {
              _id
              civility
              first_name
              last_name
              profile_picture
              email
              programs
              entities {
                entity_name
                school_type
                school {
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
                type {
                  _id
                  name
                }
              }
              user_status
              count_document
            }
          }
        `,
        variables: {
          user_type,
          pagination: pagination ? pagination : null,
          last_name: last_name ? last_name : null,
          sorting: sorting ? sorting : null,
          school: school ? school : null,
          programs: programs ? programs : null,
          campuses: campuses ? campuses : null,
          schools: schools ? schools : null,
          levels: levels ? levels : null,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }

  GetAllUsersByCRM(user_type, pagination?, last_name?, sorting?, school?, programs?, schools?, campuses?, levels?): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllUsers(
            $user_type: [ID!]
            $pagination: PaginationInput
            $last_name: String
            $sorting: UserSorting
            $school: ID
            $programs: [String]
            $campuses: [ID]
            $schools: [ID]
            $levels: [ID]
          ) {
            GetAllUsers(
              user_type: $user_type
              pagination: $pagination
              last_name: $last_name
              sorting: $sorting
              school: $school
              programs: $programs
              campuses: $campuses
              schools: $schools
              levels: $levels
            ) {
              _id
              civility
              first_name
              last_name
              profile_picture
              email
              programs
              entities {
                entity_name
                school_type
                candidate_campus
                candidate_school
                candidate_level
                type {
                  _id
                  name
                }
              }
              user_status
              count_document
            }
          }
        `,
        variables: {
          user_type,
          pagination: pagination ? pagination : null,
          last_name: last_name ? last_name : null,
          sorting: sorting ? sorting : null,
          school: school ? school : null,
          programs: programs ? programs : null,
          campuses: campuses ? campuses : null,
          schools: schools ? schools : null,
          levels: levels ? levels : null,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }

  GetAllUsersCRMDropdown(user_type, candidate_campuses?, schools?, pagination?, last_name?, sorting?): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllUsers(
            $user_type: [ID!]
            $pagination: PaginationInput
            $last_name: String
            $sorting: UserSorting
            $candidate_campuses: [String]
            $schools: [ID]
          ) {
            GetAllUsers(
              user_type: $user_type
              candidate_campuses: $candidate_campuses
              schools: $schools
              pagination: $pagination
              last_name: $last_name
              sorting: $sorting
            ) {
              _id
              civility
              first_name
              last_name
              profile_picture
              email
              entities {
                candidate_campus
                schools
                candidate_level
                type {
                  _id
                  name
                }
              }
              user_status
              count_document
            }
          }
        `,
        variables: {
          user_type,
          candidate_campuses: candidate_campuses ? candidate_campuses : null,
          schools: schools ? schools : null,
          pagination: pagination ? pagination : null,
          last_name: last_name ? last_name : null,
          sorting: sorting ? sorting : null,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }

  changeCompanyRelationMemberofStudents(change_company_relation_member_of_students): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ChangeCompanyRelationMemberofStudents(
            $change_company_relation_member_of_students: [CompanyRelationMemberofStudentsInput]
          ) {
            ChangeCompanyRelationMemberofStudents(change_company_relation_member_of_students: $change_company_relation_member_of_students) {
              _id
            }
          }
        `,
        variables: {
          change_company_relation_member_of_students,
        },
      })
      .pipe(map((resp) => resp.data['ChangeCompanyRelationMemberofStudents']));
  }

  GetOneUserCRM(_id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneUserCRM($_id: ID) {
            GetOneUser(_id: $_id) {
              _id
              civility
              first_name
              last_name
              profile_picture
              user_addresses {
                address
                postal_code
                country
                city
                department
                region
                is_main_address
              }
              email
              position
              office_phone
              portable_phone
              entities {
                school {
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
                type {
                  _id
                  name
                }
              }
              user_status
              count_document
            }
          }
        `,
        variables: {
          _id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneUser']));
  }

  getAllCandidateSchoolDropdown(): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool {
            GetAllCandidateSchool {
              _id
              short_name
              campuses {
                name
                levels {
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

  getAllStudents(pagination, filter, student_ids?): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllStudents($pagination: PaginationInput, $filter: FilterStudent, $student_ids: [ID]) {
            GetAllStudents(pagination: $pagination, filter: $filter, student_ids: $student_ids) {
              _id
              civility
              first_name
              last_name
              photo
              email
              tele_phone
              is_photo_in_s3
              photo_s3_path
              candidate_school
              candidate_campus
              candidate_level
              status
              count_document
              date_of_birth
              place_of_birth
              student_address {
                address
                postal_code
                country
                city
                region
                department
                is_main_address
              }
              companies {
                internship_id {
                  _id
                  status
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          filter: filter,
          student_ids: student_ids ? student_ids : [],
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getCandidatesParentData(candidateId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetCandidatesParentData{
          GetOneCandidate(_id: "${candidateId}"){
            _id
            address
            post_code
            country
            city
            region
            department
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
              phone_number_indicative
              email
              upload_document_rib
              autorization_account
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
              phone_number_indicative
              email
              is_same_address
              job
              professional_email
              profession
              is_parent_also_payment_support
              is_contact_person_in_emergency
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
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneCandidate']));
  }

  triggerNotificationInternship_N1(internship_ids): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation TriggerNotificationINTERNSHIP_N1($internship_ids: [ID], $lang: String) {
            TriggerNotificationINTERNSHIP_N1(internship_ids: $internship_ids, lang: $lang)
          }
        `,
        variables: {
          internship_ids,
          lang: this.translate.currentLang,
        },
      })
      .pipe(map((resp) => resp.data['TriggerNotificationINTERNSHIP_N1']));
  }

  triggerNotificationINTERNSHIP_N2(internship_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation TriggerNotificationINTERNSHIP_N2($internship_id: ID, $lang: String) {
            TriggerNotificationINTERNSHIP_N2(internship_id: $internship_id, lang: $lang)
          }
        `,
        variables: {
          internship_id,
          lang: this.translate.currentLang,
        },
      })
      .pipe(map((resp) => resp.data['TriggerNotificationINTERNSHIP_N2']));
  }

  triggerNotificationINTERNSHIP_N6(internship_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation TriggerNotificationINTERNSHIP_N6($internship_id: ID, $lang: String) {
            TriggerNotificationINTERNSHIP_N6(internship_id: $internship_id, lang: $lang)
          }
        `,
        variables: {
          internship_id,
          lang: this.translate.currentLang,
        },
      })
      .pipe(map((resp) => resp.data['TriggerNotificationINTERNSHIP_N6']));
  }

  triggerNotificationINTERNSHIP_N4(internship_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation TriggerNotificationINTERNSHIP_N4($internship_id: ID, $lang: String) {
            TriggerNotificationINTERNSHIP_N4(internship_id: $internship_id, lang: $lang)
          }
        `,
        variables: {
          internship_id,
          lang: this.translate.currentLang,
        },
      })
      .pipe(map((resp) => resp.data['TriggerNotificationINTERNSHIP_N4']));
  }

  TriggerNotificationINTERNSHIP_N5(old_CRM_id, new_CRM_id, internship_ids): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation TriggerNotificationINTERNSHIP_N5($old_CRM_id: ID, $new_CRM_id: ID, $internship_ids: [ID], $lang: String) {
            TriggerNotificationINTERNSHIP_N5(old_CRM_id: $old_CRM_id, new_CRM_id: $new_CRM_id, internship_ids: $internship_ids, lang: $lang)
          }
        `,
        variables: {
          old_CRM_id,
          new_CRM_id,
          internship_ids,
          lang: this.translate.currentLang,
        },
      })
      .pipe(map((resp) => resp.data['TriggerNotificationINTERNSHIP_N5']));
  }

  getAllProgramsDropdown(): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllUserProgramsDropdown {
            GetAllUserProgramsDropdown
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUserProgramsDropdown']));
  }

  GetAllProgramsByScholar(scholar_season_id): Observable<any> {
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

  CreatePayment(payment_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreatePayment($payment_input: CreatePaymentInput!) {
            CreatePayment(payment_input: $payment_input) {
              psp_reference
              result_code
              amount {
                currency
                value
              }
              merchant_reference
              refusal_reason
              refusal_reason_code
            }
          }
        `,
        variables: {
          payment_input,
        },
      })
      .pipe(map((resp) => resp.data['CreatePayment']));
  }

  getAllScholarSeasons(filter?, for_next_season?): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllScholarSeasons($filter: ScholarSeasonFilterInput, $for_next_season: Boolean) {
            GetAllScholarSeasons(filter: $filter, for_next_season: $for_next_season) {
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
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter: filter ? filter : null,
          for_next_season: for_next_season ? for_next_season : null,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllScholarSeasons']));
  }

  GetAllScholarSeasonsPublished(pagination?, sortValue?, filter?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllScholarSeasons($pagination: PaginationInput) {
            GetAllScholarSeasons(pagination: $pagination, filter: { is_published: true }) {
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

  getAllSchoolDropdown(): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool {
            GetAllCandidateSchool {
              _id
              short_name
              long_name
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

  GetAllSchoolFilter(scholar_season_id, filter, user_type_ids, is_from_crm?, include_all?, is_assignment_table?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($user_type_ids: [ID], $is_from_crm: Boolean,$include_all: Boolean, $is_assignment_table: Boolean){
            GetAllCandidateSchool(${filter} scholar_season_id: "${scholar_season_id}", user_type_ids: $user_type_ids, is_from_crm: $is_from_crm,include_all:$include_all,is_assignment_table:$is_assignment_table) {
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
                specialities {
                  _id
                  name
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
          user_type_ids,
          is_from_crm,
          include_all,
          is_assignment_table: is_assignment_table ? is_assignment_table : null,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  GetAllSchoolFilterTrombs(scholar_season_id, filter, user_type_logins): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($user_type_logins: [ID]){
            GetAllCandidateSchool(${filter} scholar_season_id: "${scholar_season_id}", user_type_logins: $user_type_logins) {
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
                specialities {
                  _id
                  name
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
          user_type_logins,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  GetAllSchoolDropdown(filter, scholar_season_id, user_type_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateSchool($filter: CandidateSchoolFilterInput, $scholar_season_id: ID, $user_type_id: ID) {
            GetAllCandidateSchool(filter: $filter, scholar_season_id: $scholar_season_id, user_type_id: $user_type_id) {
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
                specialities {
                  _id
                  name
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
        variables: {
          filter,
          scholar_season_id,
          user_type_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateSchool']));
  }

  GetAllCampuses(filter, user_type_ids, is_from_crm?, include_all?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCampuses($filter: CampusFilterInput, $user_type_ids: [ID], $is_from_crm: Boolean, $include_all: Boolean) {
            GetAllCampuses(filter: $filter, user_type_ids: $user_type_ids, is_from_crm: $is_from_crm, include_all: $include_all) {
              _id
              name
              address
              post_code
              city
              country
              currency
              bank {
                name
              }
              levels {
                _id
                name
              }
              specialities {
                _id
                name
              }
            }
          }
        `,
        variables: {
          filter,
          user_type_ids,
          is_from_crm,
          include_all,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCampuses']));
  }

  GetAllSpecializationsByScholar(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSpecializations($filter: SpecializationFilterInput) {
            GetAllSpecializations(filter: $filter) {
              _id
              name
              sigli
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
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSpecializations']));
  }

  GetAllLevels(filter, user_type_ids, is_from_crm?, include_all?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllLevels($filter: LevelFilterInput, $user_type_ids: [ID], $is_from_crm: Boolean, $include_all: Boolean) {
            GetAllLevels(filter: $filter, user_type_ids: $user_type_ids, is_from_crm: $is_from_crm, include_all: $include_all) {
              _id
              name
              code
              description
              specialities {
                _id
                name
              }
              documents {
                name
                url
              }
              terms_and_condition
            }
          }
        `,
        variables: {
          filter,
          user_type_ids,
          is_from_crm,
          include_all,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllLevels']));
  }

  GetAllSpecializationsWithoutFilter(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSpecializations {
            GetAllSpecializations {
              _id
              name
              sectors {
                _id
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSpecializations']));
  }

  getLatestCandidateOscarTable(): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation RefreshCandidateFromOscarCampus{
            RefreshCandidateFromOscarCampus {
              message
              total_created
            }
          }
        `,
      })
      .pipe(map((resp) => resp.data['RefreshCandidateFromOscarCampus']));
  }

  refreshCandidateFromHubSpot(): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation RefreshCandidateFromHubSpot{
            RefreshCandidateFromHubSpot
          }
        `,
      })
      .pipe(map((resp) => resp.data['RefreshCandidateFromHubSpot']));
  }

  AssignProgramToCandidate(
    select_all,
    assign_program_to_candidate_input,
    filter?,
    searching?,
    candidate_ids?,
    is_readmission?,
  ): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation AssignProgramToCandidate(
            $candidate_ids: [ID!]!
            $select_all: Boolean
            $filter: CandidateAssignProgramFilterInput
            $searching: CandidateSearchInput
            $assign_program_to_candidate_input: AssignProgramToCandidateInput
            $is_readmission: Boolean
          ) {
            AssignProgramToCandidate(
              candidate_ids: $candidate_ids
              select_all: $select_all
              filter: $filter
              searching: $searching
              assign_program_to_candidate_input: $assign_program_to_candidate_input
              is_readmission: $is_readmission
            )
          }
        `,
        variables: {
          select_all,
          assign_program_to_candidate_input,
          filter: filter ? filter : null,
          is_readmission: is_readmission ? is_readmission : null,
          searching: searching ? searching : null,
          candidate_ids: candidate_ids ? candidate_ids : [],
        },
      })
      .pipe(map((resp) => resp.data['AssignProgramToCandidate']));
  }

  getDevMemberDropdown(candidate_campus, candidate_school, candidate_level): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query getAdmissionUsers($entity: [EnumEntityType!], $user_type: [ID!]) {
          GetAllUsers(entity: $entity, user_type: $user_type, campus: "${candidate_campus}",
          school: "${candidate_school}", level: "${candidate_level}"
          ) {
            _id
            first_name
            civility
            last_name
            entities {
              entity_name
              type {
                _id
                name
              }
            }
          }
        }
        `,
        variables: {
          entity: ['admission'],
          user_type: ['617f64ec5a48fe2228518810', '617f64ec5a48fe2228518811'],
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getAcademicMemberDropdown(candidate_campuses, candidate_schools, candidate_levels): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query getAcademicMemberDropdown(
            $entity: [EnumEntityType!]
            $user_type: [ID!]
            $candidate_schools: [ID]
            $candidate_campuses: [ID]
            $candidate_levels: [ID]
          ) {
            GetAllUsers(
              entity: $entity
              user_type: $user_type
              candidate_campuses: $candidate_campuses
              candidate_schools: $candidate_schools
              candidate_levels: $candidate_levels
            ) {
              _id
              first_name
              civility
              last_name
              entities {
                entity_name
                type {
                  _id
                  name
                }
              }
            }
          }
        `,
        variables: {
          entity: ['academic'],
          user_type: ['617f64ec5a48fe2228518813'],
          candidate_campuses,
          candidate_schools,
          candidate_levels,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getAcadMemberDropdown(candidate_campus, candidate_school, candidate_level): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query getAcademicUsers($entity: [EnumEntityType!], $user_type: [ID!]) {
          GetAllUsers(entity: $entity, user_type: $user_type, campus: "${candidate_campus}",
          school: "${candidate_school}", level: "${candidate_level}"
          ) {
            _id
            first_name
            civility
            last_name
            entities {
              entity_name
              type {
                _id
                name
              }
            }
          }
        }
        `,
        variables: {
          entity: ['academic'],
          user_type: ['617f64ec5a48fe2228518813'],
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getAllCandidateCampus(filter, include_all?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCampuses($filter: CampusFilterInput, $include_all: Boolean) {
            GetAllCampuses(filter: $filter, include_all: $include_all) {
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          filter,
          include_all,
        },
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCampuses']));
  }

  SendRegistrationN1(candidate_ids): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendRegistrationN1($candidate_ids: [ID!]!, $lang: String) {
            SendRegistrationN1(candidate_ids: $candidate_ids, lang: $lang)
          }
        `,
        variables: {
          candidate_ids,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['SendRegistrationN1']));
  }

  SendRegistrationN1WithFlyer(candidate_ids, is_include_flyer): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SendRegistrationN1($candidate_ids: [ID!]!, $lang: String, $is_include_flyer: Boolean) {
            SendRegistrationN1(candidate_ids: $candidate_ids, lang: $lang, is_include_flyer: $is_include_flyer)
          }
        `,
        variables: {
          candidate_ids,
          is_include_flyer,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['SendRegistrationN1']));
  }

  UpdateCandidateCRMStatus(candidate_ids): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidateCRMStatus($candidate_ids: [ID]) {
            UpdateCandidateCRMStatus(candidate_ids: $candidate_ids)
          }
        `,
        variables: {
          candidate_ids,
        },
      })
      .pipe(map((resp) => resp.data['UpdateCandidateCRMStatus']));
  }

  GetAllCandidateNationalities(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateNationalities {
            GetAllCandidateNationalities
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateNationalities']));
  }

  GetAllCandidateComments(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateComments($filter: CandidateCommentFilterInput) {
            GetAllCandidateComments(filter: $filter) {
              _id
              candidate_id {
                _id
                first_name
                last_name
                civility
                photo
              }
              created_by {
                _id
                first_name
                last_name
                civility
                profile_picture
              }
              subject
              comment
              is_personal_situation
              is_restrictive_conditions
              is_reply
              reply_for_comment_id {
                _id
                candidate_id {
                  _id
                  first_name
                  last_name
                  civility
                  photo
                }
                created_by {
                  _id
                  first_name
                  last_name
                  civility
                  profile_picture
                }
                subject
                comment
                category
                is_reply
                tagged_user_ids {
                  _id
                  first_name
                  last_name
                  civility
                }
                date_created
              }
              reply_comment_ids {
                _id
                candidate_id {
                  _id
                  first_name
                  last_name
                  civility
                  photo
                }
                created_by {
                  _id
                  first_name
                  last_name
                  civility
                  profile_picture
                }
                subject
                comment
                category
                is_reply
                tagged_user_ids {
                  _id
                  first_name
                  last_name
                  civility
                }
                date_created
              }
              tagged_user_ids {
                _id
                first_name
                last_name
                civility
              }
              date_created
              category
              actor {
                civility
                first_name
                last_name
              }
              master_transaction_id {
                is_manual_action
                date_action {
                  date
                  time
                }
                credit
                debit
                note
                reference
              }
              param_comment
              payment_amount
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateComments']));
  }

  GetOneCandidateComment(_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneCandidateComment($_id: ID!) {
            GetOneCandidateComment(_id: $_id) {
              _id
              candidate_id {
                _id
                first_name
                last_name
                civility
                photo
              }
              created_by {
                _id
                first_name
                last_name
                civility
                profile_picture
              }
              subject
              comment
              is_personal_situation
              is_restrictive_conditions
              is_reply
              reply_for_comment_id {
                _id
                candidate_id {
                  _id
                  first_name
                  last_name
                  civility
                  photo
                }
                created_by {
                  _id
                  first_name
                  last_name
                  civility
                  profile_picture
                }
                subject
                comment
                category
                is_reply
                tagged_user_ids {
                  _id
                  first_name
                  last_name
                  civility
                }
                date_created
              }
              reply_comment_ids {
                _id
                candidate_id {
                  _id
                  first_name
                  last_name
                  civility
                  photo
                }
                created_by {
                  _id
                  first_name
                  last_name
                  civility
                  profile_picture
                }
                subject
                comment
                category
                is_reply
                tagged_user_ids {
                  _id
                  first_name
                  last_name
                  civility
                }
                date_created
              }
              tagged_user_ids {
                _id
                first_name
                last_name
                civility
              }
              category
              date_created
            }
          }
        `,
        variables: {
          _id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidateComment']));
  }

  GetAllCandidateCommentCategories(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateCommentCategories{
            GetAllCandidateCommentCategories
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateCommentCategories']));
  }

  CreateCandidateComment(candidate_comment_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateCandidateComment($candidate_comment_input: CandidateCommentInput) {
            CreateCandidateComment(candidate_comment_input: $candidate_comment_input) {
              _id
            }
          }
        `,
        variables: {
          candidate_comment_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateCandidateComment']));
  }

  UpdateCandidateComment(_id, candidate_comment_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateCandidateComment($_id: ID!, $candidate_comment_input: CandidateCommentInput) {
            UpdateCandidateComment(_id: $_id, candidate_comment_input: $candidate_comment_input) {
              _id
            }
          }
        `,
        variables: {
          _id,
          candidate_comment_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateCandidateComment']));
  }

  DeleteCandidateComment(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteCandidateComment($_id: ID!) {
            DeleteCandidateComment(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteCandidateComment']));
  }

  GetCandidateCommentsFilterList(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCandidateComments($filter: CandidateCommentFilterInput) {
            GetAllCandidateComments(filter: $filter) {
              created_by {
                _id
                first_name
                last_name
                civility
              }
              date_created
              category
              is_reply
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidateComments']));
  }

  TransferProgramOfCandidate(candidates_id, assign_program_to_candidate_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation TransferProgramOfCandidate($assign_program_to_candidate_input: AssignProgramToCandidateInput, $lang: String) {
            TransferProgramOfCandidate(candidate_id: "${candidates_id}", assign_program_to_candidate_input: $assign_program_to_candidate_input, lang: $lang) {
              _id
              region
            }
          }
        `,
        variables: {
          assign_program_to_candidate_input,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['TransferProgramOfCandidate']));
  }

  GetFirstDateOfRegisteredCandidate(
    scholar_season_id,
    school_ids,
    campus_ids,
    level_ids,
    sector_ids,
    speciality_ids,
    start_date,
  ): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetFirstDateOfRegisteredCandidate(
            $scholar_season_id: ID
            $school_ids: [ID]
            $campus_ids: [ID]
            $level_ids: [ID]
            $sector_ids: [ID]
            $speciality_ids: [ID]
            $start_date: String
          ) {
            GetFirstDateOfRegisteredCandidate(
              scholar_season_id: $scholar_season_id
              school_ids: $school_ids
              campus_ids: $campus_ids
              level_ids: $level_ids
              sector_ids: $sector_ids
              speciality_ids: $speciality_ids
              start_date: $start_date
            ) {
              date
              time
            }
          }
        `,
        variables: {
          scholar_season_id,
          school_ids,
          campus_ids,
          level_ids,
          sector_ids,
          speciality_ids: speciality_ids ? speciality_ids : null,
          start_date,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetFirstDateOfRegisteredCandidate']));
  }

  getUserContinuousFormationManager(userType: string[], candidateCampus?, candidateSchool?, candidateLevel?): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllUsers($userType: [ID!], $candidateSchool: ID, $candidateCampus: ID, $candidateLevel: ID) {
            GetAllUsers(user_type: $userType, level: $candidateLevel, school: $candidateSchool, campus: $candidateCampus) {
              _id
              civility
              first_name
              last_name
            }
          }
        `,
        variables: {
          userType,
          candidateCampus,
          candidateSchool,
          candidateLevel,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }
  getAppPermission(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAppPermission{
            GetAppPermission {
              candidate_import {
                is_hubspot_running
                hubspot_last_import_date {
                  time
                  date
                }
                oscar_last_import_date {
                  date
                  time
                }
              }
              hyperplanning {
                teacher_last_updated {
                  date
                  time
                }
                student_last_updated {
                  date
                  time
                }
                is_update_student_running
                is_update_teacher_running
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAppPermission']));
  }

  // GetAllAdmissionFinancements
  getAllAdmissionFinancements(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllAdmissionFinancements{
            GetAllAdmissionFinancements {
              _id
              candidate_id {
                _id
              }
              admission_process_id {
                _id
              }
              organization_name
              rate_per_hours
              hours
              total
              remaining_due
              document_pdf
              status
              count_document
              is_financement_validated
              created_by {
                _id
                first_name
                last_name
              }
            }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllAdmissionFinancements']));
  }

  createAdmissionFinancement(payload) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateAdmissionFinancement($payload: AdmissionFinancementInput) {
            CreateAdmissionFinancement(admission_financement_input: $payload) {
              _id
            }
          }
        `,
        variables: {
          payload,
        },
      })
      .pipe(map((resp) => resp.data['CreateAdmissionFinancement']));
  }

  GetAllSchoolCRMDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllSchoolCRMDropdown{
            GetAllSchoolCRMDropdown
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllSchoolCRMDropdown']));
  }

  GetAllCampusCRMDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllCampusCRMDropdown{
            GetAllCampusCRMDropdown
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCampusCRMDropdown']));
  }

  GetAllLevelCRMDropdown(): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllLevelCRMDropdown{
            GetAllLevelCRMDropdown
          }
        `,
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllLevelCRMDropdown']));
  }

  generateStudentBilling(select_all, filter, billing_student_ids, user_type_ids?) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GenerateStudentBilling(
            $select_all: Boolean
            $filter: BillingFilterInput
            $billing_student_ids: [ID]
            $user_type_ids: [ID]
          ) {
            GenerateStudentBilling(
              select_all: $select_all
              filter: $filter
              billing_student_ids: $billing_student_ids
              user_type_ids: $user_type_ids
            ) {
              _id
            }
          }
        `,
        variables: {
          select_all,
          filter,
          billing_student_ids,
          user_type_ids: user_type_ids ? user_type_ids : null,
        },
      })
      .pipe(map((resp) => resp.data['GenerateStudentBilling']));
  }

  getAllIdForReadmissionCheckbox(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
                  _id
                }
              }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getAllFiIdForCheckbox(pagination, sortValue, filter, searching, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
                  _id
                }
              }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getAllIdForAssignmentCheckbox(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput, $user_type_ids: [ID]) {
          GetAllCandidates(pagination: $pagination, sorting: $sort, ${filter}, searching: $searching, user_type_ids: $user_type_ids) {
                  _id
                }
              }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getAllDesiredForAssignmentCheckbox(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
                  _id
                  program_desired
                }
              }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getAllProgramForAssignmentCheckbox(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
                  _id
                  last_name
                  first_name
                  civility
                  program_desired
                  jury_decision
                  financial_situation
                }
              }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getAllEmailForAssignmentCheckbox(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
                  _id
                  civility
                  first_name
                  last_name
                  email
                  school_mail
                }
              }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getAllJuryForAssignmentCheckbox(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
                  _id
                  jury_decision
                }
              }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getFIDataCrmOk(pagination, sortValue, filter, searching, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
            _id
            is_oscar_updated
            is_hubspot_updated
            is_manual_updated
            candidate_admission_status
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getFIDataRegisProfil(pagination, sortValue, filter, searching, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
            _id
            intake_channel {
              _id
              program
              scholar_season_id {
                _id
              }
            }
            type_of_formation_id {
              _id
            }
            registration_profile {
              _id
              name
            }
            school {
              _id
              short_name
              long_name
            }
            campus {
              _id
              name
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
            civility
            first_name
            last_name
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getFIDataForCall(pagination, sortValue, filter, searching, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
            _id
            registration_profile {
              _id
            }
            announcement_call
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getFIDataForFirstMail(pagination, sortValue, filter, searching, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
            _id
            registration_profile {
              _id
            }
            announcement_call
            announcement_email {
              sent_date
              sent_time
            }
            civility
            first_name
            last_name
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getFIDataForDevMember(pagination, sortValue, filter, searching, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
            _id
            admission_member_id {
              _id
              first_name
              last_name
              civility
              email
            }
            civility
            first_name
            last_name
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getFIDataForSendMail(pagination, sortValue, filter, searching, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
            _id
            civility
            first_name
            last_name
            email
            school_mail
            payment_supports {
              relation
              family_name
              name
              civility
              email
            }
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getFCDataCrmOk(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
            _id
            is_oscar_updated
            is_hubspot_updated
            is_manual_updated
            candidate_admission_status
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getFCDataRegisProfil(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
            _id
            intake_channel {
              _id
              program
              scholar_season_id {
                _id
              }
            }
            type_of_formation_id {
              _id
            }
            registration_profile {
              _id
              name
            }
            school {
              _id
              short_name
              long_name
            }
            campus {
              _id
              name
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
            civility
            first_name
            last_name
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getFCDataForCall(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
            _id
            registration_profile {
              _id
            }
            announcement_call
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getFCDataForFirstMail(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
            _id
            registration_profile {
              _id
            }
            announcement_call
            announcement_email {
              sent_date
              sent_time
            }
            civility
            first_name
            last_name
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getFCDataForDevMember(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
            _id
            admission_member_id {
              _id
              first_name
              last_name
              civility
              email
            }
            civility
            first_name
            last_name
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getFCDataForSendMail(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
            _id
            civility
            first_name
            last_name
            email
            school_mail
            payment_supports {
              relation
              family_name
              name
              civility
              email
            }
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getReadmissionDataRegisProfil(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
            _id
            financial_situation
            intake_channel {
              _id
              program
              scholar_season_id {
                _id
              }
            }
            type_of_formation_id {
              _id
            }
            registration_profile {
              _id
              name
            }
            school {
              _id
              short_name
              long_name
            }
            campus {
              _id
              name
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
            civility
            first_name
            last_name
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getReadmissionDataForFirstMail(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
            _id
            registration_profile {
              _id
            }
            announcement_call
            announcement_email {
              sent_date
              sent_time
            }
            civility
            first_name
            last_name
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getReadmissionDataForDevMember(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
            _id
            admission_member_id {
              _id
              first_name
              last_name
              civility
              email
            }
            type_of_formation_id {
              _id
              type_of_information
              type_of_formation
            }
            civility
            first_name
            last_name
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getReadmissionDataForSendMail(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
            _id
            civility
            first_name
            last_name
            email
            school_mail
            payment_supports {
              relation
              family_name
              name
              civility
              email
            }
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getReadmissionDataForEditJury(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
            _id
            jury_decision
            civility
            first_name
            last_name
            latest_previous_program {
              _id
              scholar_season_id {
                _id
                scholar_season
              }
            }           
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getReadmissionDataForReminder(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
            _id
            announcement_email {
              sent_date
              sent_time
            }
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  getReadmissionDataForAdmissionId(pagination, sortValue, filter, searching?, user_type_ids?): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
            _id
            admission_process_id {
              _id
            }
          }
        }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }

  CheckPaymentCompleted(candidate_id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query CheckPaymentCompleted($candidate_id: ID!) {
            CheckPaymentCompleted(candidate_id: $candidate_id)
          }
        `,
        variables: {
          candidate_id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['CheckPaymentCompleted']));
  }
  getAllAdmissionFinancementsTransfer(filter): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllAdmissionFinancements($filter: AdmissionFinancementFilterInput) {
            GetAllAdmissionFinancements(filter: $filter) {
              _id
              actual_status
            }
          }
        `,
        variables: {
          filter,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllAdmissionFinancements']));
  }
  getAllCandidatesFc(pagination, sortValue, filter, searching, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput, $lang: String) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching, lang: $lang) {
                  _id
                  jury_decision
                  trial_date
                  region
                  civility
                  first_name
                  last_name
                  telephone
                  payment_method
                  is_admitted
                  email
                  is_oscar_updated
                  finance
                  nationality
                  registration_profile_type
                  candidate_unique_number
                  candidate_admission_status
                  is_future_program_assigned
                  program_status
                  is_program_assigned
                  financement
                  school_mail
                  diploma_status
                  admission_document_process_status
                  billing_id {
                    _id
                    deposit_status
                    is_deposit_completed
                    deposit_pay_amount
                    deposit
                    account_number
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
                  photo
                  registration_email_due_date {
                    due_date
                    due_time
                  }
                  reg_n8_sent_date {
                    sent_date
                    sent_time
                  }
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
                  }
                  type_of_formation_id {
                    _id
                    type_of_information
                    type_of_formation
                    sigle
                    admission_form_id {
                      _id
                      form_builder_name
                    }
                  }
                  registration_profile {
                    _id
                    name
                    is_down_payment
                    discount_on_full_rate
                    type_of_formation {
                      _id
                      type_of_information
                    }
                    additional_cost_ids {
                      additional_cost
                      amount
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
                    short_name
                    long_name
                    campuses {
                      _id
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
                  program_desired
                  trial_date
                  date_added
                  selected_payment_plan {
                    name
                    times
                    additional_expense
                    total_amount
                    payment_date {
                      date
                      amount
                    }
                    down_payment
                  }
                  registered_at {
                    date
                    time
                  }
                  resign_after_school_begins_at {
                    date
                    time
                  }
                  no_show_at {
                    date
                    time
                  }
                  hubspot_deal_id
                  hubspot_contact_id
                  is_hubspot_updated
                  is_manual_updated
                  continuous_formation_manager_id {
                    _id
                    first_name
                    last_name
                    civility
                    profile_picture
                    email
                    position
                  }
                  admission_process_id {
                    _id
                    steps {
                      _id
                      index
                      step_title
                      step_type
                      step_status
                      status
                      is_only_visible_based_on_condition
                    }
                  }
                  latest_previous_program{
                    _id
                    program
                    scholar_season_id {
                      _id
                      scholar_season
                    }
                  }
                  type_of_readmission
                  previous_programs {
                    _id
                  }
                }
              }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }
  getAllFcIdForCheckbox(pagination, sortValue, filter, searching, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllCandidates($user_type_ids: [ID], $pagination: PaginationInput, $sort: CandidateSortInput, $searching: CandidateSearchInput) {
          GetAllCandidates(user_type_ids: $user_type_ids, pagination: $pagination, sorting: $sort, ${filter}, searching: $searching) {
                  _id
                }
              }
        `,
        variables: {
          user_type_ids,
          pagination,
          sort: sortValue ? sortValue : {},
          searching: searching ? searching : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }
  getAllCandidatesTabStudent(filter, user_type_ids): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query getAllCandidatesTabStudent($filter: CandidateFilterInput, $user_type_ids: [ID]) {
            GetAllCandidates(filter: $filter, user_type_ids: $user_type_ids) {
              _id
              region
              require_visa_permit
              civility
              first_name
              last_name
              telephone
              phone_number_indicative
              payment_method
              is_admitted
              registration_certificate
              email
              registration_certificate
              nationality
              candidate_unique_number
              candidate_admission_status
              program_status
              jury_decision
              readmission_status
              is_future_program_assigned
              financial_situation
              current_school_contract_amendment_form {
                _id
                school_amendment_form_link
                school_amendment_pdf_name
                form_status
              }
              reason_no_reinscription
              reinscription_yes_no {
                is_answer_yes
                answer_label
              }
              registration_profile_type
              full_rate_id {
                amount_internal
                amount_external
              }
              is_program_assigned
              admission_process_id {
                _id
                steps {
                  step_type
                }
              }
              student_id {
                _id
                user_id {
                  _id
                }
                program_sequence_ids {
                  _id
                  name
                  program_id {
                    _id
                    program
                  }
                  program_sequence_groups {
                    _id
                    student_classes {
                      name
                      students_id {
                        _id
                      }
                      program_sequence_id {
                        program_modules_id {
                          program_subjects_id {
                            name
                          }
                        }
                      }
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
                  type_of_sequence
                }
              }
              billing_id {
                _id
                profil_rate
                account_number
                deposit
                deposit_pay_amount
                terms {
                  _id
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
                }
                accumulated_late
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
              photo
              registration_email_due_date {
                due_date
                due_time
              }
              reg_n8_sent_date {
                sent_date
                sent_time
              }
              announcement_call
              announcement_email {
                sent_date
                sent_time
              }
              intake_channel {
                _id
                program
                school_id {
                  short_name
                }
                campus {
                  name
                }
                level {
                  name
                }
                scholar_season_id {
                  _id
                  scholar_season
                }
                speciality_id {
                  name
                }
                course_sequence_id {
                  program_sequences_id {
                    program_sequence_groups {
                      _id
                      student_classes {
                        name
                        students_id {
                          _id
                        }
                        program_sequence_id {
                          program_modules_id {
                            program_subjects_id {
                              name
                            }
                          }
                        }
                      }
                    }
                    name
                    type_of_sequence
                    start_date {
                      date
                      time
                    }
                    end_date {
                      date
                      time
                    }
                  }
                }
              }
              type_of_formation_id {
                _id
                type_of_information
                type_of_formation
              }
              registration_profile {
                _id
                name
                discount_on_full_rate
                additional_cost_ids {
                  additional_cost
                  amount
                }
                type_of_formation {
                  _id
                  type_of_information
                }
                is_down_payment
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
                from {
                  date_utc
                  time_utc
                }
                to {
                  date_utc
                  time_utc
                }
              }
              sector {
                _id
                name
              }
              school {
                _id
                short_name
                long_name
                campuses {
                  _id
                  name
                  levels {
                    _id
                    name
                  }
                }
              }
              selected_payment_plan {
                total_amount
                down_payment
              }
              school_mail
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
              program_desired
              trial_date
              school_contract_pdf_link
              date_added
              engaged_at {
                date
                time
              }
              registered_at {
                date
                time
              }
              resigned_after_engaged_at {
                date
                time
              }
              resign_after_school_begins_at {
                date
                time
              }
              no_show_at {
                date
                time
              }
              resigned_after_registered_at {
                date
                time
              }
              inscription_at {
                date
                time
              }
              resigned_at {
                date
                time
              }
              candidate_sign_date {
                date
                time
              }
              school_contract_pdf_link
              bill_validated_at {
                date
                time
              }
              payment_transfer_check_data {
                s3_document_name
              }
              financement_validated_at {
                date
                time
              }
              initial_intake_channel
              latest_previous_program {
                _id
                program
                school_id {
                  short_name
                }
                campus {
                  name
                }
                level {
                  name
                }
                scholar_season_id {
                  _id
                  scholar_season
                }
                speciality_id {
                  name
                }
              }
              previous_programs {
                _id
                telephone
                payment_method
                is_admitted
                registration_certificate
                candidate_unique_number
                candidate_admission_status
                admission_process_id {
                  _id
                  steps {
                    step_type
                  }
                }
                billing_id {
                  _id
                  account_number
                  deposit
                  deposit_pay_amount
                  terms {
                    _id
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
                  }
                  accumulated_late
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
                registration_email_due_date {
                  due_date
                  due_time
                }
                reg_n8_sent_date {
                  sent_date
                  sent_time
                }
                announcement_call
                announcement_email {
                  sent_date
                  sent_time
                }
                intake_channel {
                  _id
                  program
                  school_id {
                    short_name
                  }
                  campus {
                    name
                  }
                  level {
                    name
                  }
                  scholar_season_id {
                    _id
                    scholar_season
                  }
                  speciality_id {
                    name
                  }
                }
                type_of_formation_id {
                  _id
                  type_of_information
                  type_of_formation
                }
                registration_profile {
                  _id
                  name
                  discount_on_full_rate
                  additional_cost_ids {
                    additional_cost
                    amount
                  }
                  type_of_formation {
                    _id
                    type_of_information
                  }
                  is_down_payment
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
                  short_name
                  long_name
                  campuses {
                    _id
                    name
                    levels {
                      _id
                      name
                    }
                  }
                }
                selected_payment_plan {
                  total_amount
                  down_payment
                }
                school_mail
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
                is_whatsapp
                participate_in_open_house_day
                participate_in_job_meeting
                count_document
                user_id
                payment_splits {
                  payer_name
                  percentage
                }
                program_desired
                trial_date
                school_contract_pdf_link
                date_added
                engaged_at {
                  date
                  time
                }
                registered_at {
                  date
                  time
                }
                resign_after_school_begins_at {
                  date
                  time
                }
                no_show_at {
                  date
                  time
                }
                resigned_after_engaged_at {
                  date
                  time
                }
                resigned_after_registered_at {
                  date
                  time
                }
                inscription_at {
                  date
                  time
                }
                resigned_at {
                  date
                  time
                }
                candidate_sign_date {
                  date
                  time
                }
                school_contract_pdf_link
                bill_validated_at {
                  date
                  time
                }
                payment_transfer_check_data {
                  s3_document_name
                }
                financement_validated_at {
                  date
                  time
                }
                initial_intake_channel
                latest_previous_program {
                  _id
                  program
                  school_id {
                    short_name
                  }
                  campus {
                    name
                  }
                  level {
                    name
                  }
                  scholar_season_id {
                    _id
                    scholar_season
                  }
                  speciality_id {
                    name
                  }
                }
              }
              mission_card_validated_at {
                date
                time
              }
              resignation_missing_prerequisites_at {
                date
                time
              }
              cvec_number
              ine_number
              is_adult
              is_emancipated_minor
              visa_document_process_id{
                _id
                form_type
                steps{
                  _id
                  step_status
                }
                form_status
              }
            }
          }
        `,
        variables: {
          filter,
          user_type_ids
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllCandidates']));
  }
  getAllProgramsToGetSpeciality(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetAllPrograms($filter: ProgramFilterInput) {
            GetAllPrograms(filter: $filter) {
              _id
              speciality_id {
                _id
                name
                sigli
                intake_channel
                description
                sectors {
                  name
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
      .valueChanges.pipe(map((resp) => resp.data['GetAllPrograms']));
  }
  getAllStudentCard(pagination, sorting, filter, user_type_ids, student_ids?) {
    return this.apollo
      .query({
        query: gql`
          query GetAllStudents(
            $pagination: PaginationInput
            $sorting: StudentSorting
            $filter: FilterStudent
            $user_type_ids: [ID]
            $student_ids: [ID]
          ) {
            GetAllStudents(
              pagination: $pagination
              sorting: $sorting
              filter: $filter
              user_type_ids: $user_type_ids
              student_ids: $student_ids
            ) {
              _id
              civility
              first_name
              last_name
              count_document
              candidate_id {
                _id
                student_id {
                  _id
                }
                is_program_assigned
                program_status
                candidate_admission_status
                jury_decision
                trial_date
                region
                civility
                first_name
                last_name
                telephone
                payment_method
                is_admitted
                email
                is_oscar_updated
                finance
                nationality
                candidate_unique_number
                candidate_admission_status
                financement
                school_mail
                diploma_status
                admission_document_process_status
                is_future_program_assigned
                billing_id {
                  _id
                  deposit_status
                  is_deposit_completed
                  deposit_pay_amount
                  deposit
                  account_number
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
                photo
                registration_email_due_date {
                  due_date
                  due_time
                }
                reg_n8_sent_date {
                  sent_date
                  sent_time
                }
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
                }
                type_of_formation_id {
                  _id
                  type_of_information
                  type_of_formation
                  sigle
                  admission_form_id {
                    _id
                    form_builder_name
                  }
                }
                registration_profile {
                  _id
                  name
                  is_down_payment
                  discount_on_full_rate
                  type_of_formation {
                    _id
                    type_of_information
                  }
                  additional_cost_ids {
                    additional_cost
                    amount
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
                  short_name
                  long_name
                  campuses {
                    _id
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
                # This one from 049
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
                program_desired
                trial_date
                date_added
                selected_payment_plan {
                  name
                  times
                  additional_expense
                  total_amount
                  payment_date {
                    date
                    amount
                  }
                  down_payment
                }
                registered_at {
                  date
                  time
                }
                resign_after_school_begins_at {
                  date
                  time
                }
                no_show_at {
                  date
                  time
                }
                hubspot_deal_id
                hubspot_contact_id
                is_hubspot_updated
                is_manual_updated
                continuous_formation_manager_id {
                  _id
                  first_name
                  last_name
                  civility
                  profile_picture
                  email
                  position
                }
                admission_process_id {
                  _id
                  steps {
                    _id
                    index
                    step_title
                    step_type
                    step_status
                    status
                    is_only_visible_based_on_condition
                  }
                }
                latest_previous_program {
                  _id
                  program
                  scholar_season_id {
                    _id
                    scholar_season
                  }
                }
                type_of_readmission
                previous_programs {
                  _id
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          sorting,
          filter,
          user_type_ids,
          student_ids: student_ids ? student_ids : null,
        },
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  getAllStudentCardIdentity(pagination, sorting, filter, student_ids?) {
    return this.apollo
      .query({
        query: gql`
          query GetAllStudents($pagination: PaginationInput, $sorting: StudentSorting, $filter: FilterStudent, $student_ids: [ID], $is_permission_active: Boolean) {
            GetAllStudents(pagination: $pagination, sorting: $sorting, filter: $filter, student_ids: $student_ids, is_permission_active: $is_permission_active) {
              _id
              civility
              first_name
              last_name
              count_document
              candidate_id {
                _id
                student_id{
                  _id
                }
                is_program_assigned
                program_status
                candidate_admission_status
                jury_decision
                trial_date
                region
                civility
                first_name
                last_name
                telephone
                payment_method
                is_admitted
                email
                is_oscar_updated
                finance
                nationality
                candidate_unique_number
                candidate_admission_status
                financement
                school_mail
                diploma_status
                admission_document_process_status
                is_future_program_assigned
                billing_id {
                  _id
                  deposit_status
                  is_deposit_completed
                  deposit_pay_amount
                  deposit
                  account_number
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
                photo
                registration_email_due_date {
                  due_date
                  due_time
                }
                reg_n8_sent_date {
                  sent_date
                  sent_time
                }
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
                }
                type_of_formation_id {
                  _id
                  type_of_information
                  type_of_formation
                  sigle
                  admission_form_id {
                    _id
                    form_builder_name
                  }
                }
                registration_profile {
                  _id
                  name
                  is_down_payment
                  discount_on_full_rate
                  type_of_formation {
                    _id
                    type_of_information
                  }
                  additional_cost_ids {
                    additional_cost
                    amount
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
                  short_name
                  long_name
                  campuses {
                    _id
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
                # This one from 049
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
                program_desired
                trial_date
                date_added
                selected_payment_plan {
                  name
                  times
                  additional_expense
                  total_amount
                  payment_date {
                    date
                    amount
                  }
                  down_payment
                }
                registered_at {
                  date
                  time
                }
                resign_after_school_begins_at {
                  date
                  time
                }
                no_show_at {
                  date
                  time
                }
                hubspot_deal_id
                hubspot_contact_id
                is_hubspot_updated
                is_manual_updated
                continuous_formation_manager_id {
                  _id
                  first_name
                  last_name
                  civility
                  profile_picture
                  email
                  position
                }
                admission_process_id {
                  _id
                  steps {
                    _id
                    index
                    step_title
                    step_type
                    step_status
                    status
                    is_only_visible_based_on_condition
                  }
                }
                latest_previous_program {
                  _id
                  program
                  scholar_season_id {
                    _id
                    scholar_season
                  }
                }
                type_of_readmission
                previous_programs {
                  _id
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination,
          sorting,
          filter,
          student_ids: student_ids ? student_ids : null,
          is_permission_active: false,
        },
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }


  getOneCandidatesTabStudent(_id): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneCandidate($_id: ID!) {
            GetOneCandidate(_id: $_id) {
              _id
              region
              civility
              first_name
              last_name
              telephone
              payment_method
              is_admitted
              registration_certificate
              email
              registration_certificate
              nationality
              candidate_unique_number
              candidate_admission_status
              program_status
              jury_decision
              readmission_status
              reason_no_reinscription
              reinscription_yes_no {
                is_answer_yes
                answer_label
              }
              admission_process_id {
                _id
                steps {
                  step_type
                }
              }
              student_id {
                _id
                program_sequence_ids {
                  _id
                  name
                  program_id {
                    _id
                    program
                  }
                  program_sequence_groups {
                    _id
                    student_classes {
                      name
                      students_id {
                        _id
                      }
                      program_sequence_id {
                        program_modules_id {
                          program_subjects_id {
                            name
                          }
                        }
                      }
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
                  type_of_sequence
                }
              }
              billing_id {
                _id
                profil_rate
                account_number
                deposit
                deposit_pay_amount
                terms {
                  _id
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
                }
                accumulated_late
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
              photo
              registration_email_due_date {
                due_date
                due_time
              }
              reg_n8_sent_date {
                sent_date
                sent_time
              }
              announcement_call
              announcement_email {
                sent_date
                sent_time
              }
              intake_channel {
                _id
                program
                school_id {
                  short_name
                }
                campus {
                  name
                }
                level {
                  name
                }
                scholar_season_id {
                  _id
                  scholar_season
                }
                speciality_id {
                  name
                }
                course_sequence_id {
                  program_sequences_id {
                    program_sequence_groups {
                      _id
                      student_classes {
                        name
                        students_id {
                          _id
                        }
                        program_sequence_id {
                          program_modules_id {
                            program_subjects_id {
                              name
                            }
                          }
                        }
                      }
                    }
                    name
                    type_of_sequence
                    start_date {
                      date
                      time
                    }
                    end_date {
                      date
                      time
                    }
                  }
                }
              }
              type_of_formation_id {
                _id
                type_of_information
                type_of_formation
              }
              registration_profile {
                _id
                name
                discount_on_full_rate
                additional_cost_ids {
                  additional_cost
                  amount
                }
                type_of_formation {
                  _id
                  type_of_information
                }
                is_down_payment
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
                short_name
                long_name
                campuses {
                  _id
                  name
                  levels {
                    _id
                    name
                  }
                }
              }
              selected_payment_plan {
                total_amount
                down_payment
              }
              school_mail
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
              program_desired
              trial_date
              school_contract_pdf_link
              date_added
              engaged_at {
                date
                time
              }
              registered_at {
                date
                time
              }
              resigned_after_engaged_at {
                date
                time
              }
              resign_after_school_begins_at {
                date
                time
              }
              no_show_at {
                date
                time
              }
              resigned_after_registered_at {
                date
                time
              }
              inscription_at {
                date
                time
              }
              resigned_at {
                date
                time
              }
              candidate_sign_date {
                date
                time
              }
              school_contract_pdf_link
              bill_validated_at {
                date
                time
              }
              payment_transfer_check_data {
                s3_document_name
              }
              financement_validated_at {
                date
                time
              }
              initial_intake_channel
              latest_previous_program {
                _id
                program
                school_id {
                  short_name
                }
                campus {
                  name
                }
                level {
                  name
                }
                scholar_season_id {
                  _id
                  scholar_season
                }
                speciality_id {
                  name
                }
              }
              previous_programs {
                _id
                telephone
                payment_method
                is_admitted
                registration_certificate
                candidate_unique_number
                candidate_admission_status
                admission_process_id {
                  _id
                  steps {
                    step_type
                  }
                }
                billing_id {
                  _id
                  account_number
                  deposit
                  deposit_pay_amount
                  terms {
                    _id
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
                  }
                  accumulated_late
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
                registration_email_due_date {
                  due_date
                  due_time
                }
                reg_n8_sent_date {
                  sent_date
                  sent_time
                }
                announcement_call
                announcement_email {
                  sent_date
                  sent_time
                }
                intake_channel {
                  _id
                  program
                  school_id {
                    short_name
                  }
                  campus {
                    name
                  }
                  level {
                    name
                  }
                  scholar_season_id {
                    _id
                    scholar_season
                  }
                  speciality_id {
                    name
                  }
                }
                type_of_formation_id {
                  _id
                  type_of_information
                  type_of_formation
                }
                registration_profile {
                  _id
                  name
                  discount_on_full_rate
                  additional_cost_ids {
                    additional_cost
                    amount
                  }
                  type_of_formation {
                    _id
                    type_of_information
                  }
                  is_down_payment
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
                  short_name
                  long_name
                  campuses {
                    _id
                    name
                    levels {
                      _id
                      name
                    }
                  }
                }
                selected_payment_plan {
                  total_amount
                  down_payment
                }
                school_mail
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
                is_whatsapp
                participate_in_open_house_day
                participate_in_job_meeting
                count_document
                user_id
                payment_splits {
                  payer_name
                  percentage
                }
                program_desired
                trial_date
                school_contract_pdf_link
                date_added
                engaged_at {
                  date
                  time
                }
                registered_at {
                  date
                  time
                }
                resign_after_school_begins_at {
                  date
                  time
                }
                no_show_at {
                  date
                  time
                }
                resigned_after_engaged_at {
                  date
                  time
                }
                resigned_after_registered_at {
                  date
                  time
                }
                inscription_at {
                  date
                  time
                }
                resigned_at {
                  date
                  time
                }
                candidate_sign_date {
                  date
                  time
                }
                school_contract_pdf_link
                bill_validated_at {
                  date
                  time
                }
                payment_transfer_check_data {
                  s3_document_name
                }
                financement_validated_at {
                  date
                  time
                }
                initial_intake_channel
                latest_previous_program {
                  _id
                  program
                  school_id {
                    short_name
                  }
                  campus {
                    name
                  }
                  level {
                    name
                  }
                  scholar_season_id {
                    _id
                    scholar_season
                  }
                  speciality_id {
                    name
                  }
                }
              }
              mission_card_validated_at {
                date
                time
              }
              resignation_missing_prerequisites_at {
                date
                time
              }
              cvec_number
              ine_number
            }
          }
        `,
        variables: {
          _id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneCandidate']));
  }
}
