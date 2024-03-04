import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cacheable } from 'ngx-cacheable';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class JuryOrganizationService {
  // behaviourservice for grand oral jury parameter
  private grandOralParameterSource = new BehaviorSubject<any[]>([]);
  public grandOralParameterData$ = this.grandOralParameterSource.asObservable();

  juryId = null;

  constructor(private httpClient: HttpClient, private apollo: Apollo) {}

  setGrandOralParameter(data) {
    this.grandOralParameterSource.next(data);
  }

  getGrandOralParameter() {
    return this.grandOralParameterSource.getValue();
  }

  removeGrandOralParameter() {
    this.grandOralParameterSource.next(null);
  }

  @Cacheable()
  getAssignJury(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/assign-jury.json');
  }

  @Cacheable()
  getPresidentJury(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/assign-president-jury.json');
  }

  @Cacheable()
  getSchedule(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/schedule-juries.json');
  }

  @Cacheable()
  getMarkGrandOral(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/grand-oral.json');
  }

  @Cacheable()
  getAllGrandOral(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/grand-oral-full.json');
  }

  getGlobalJuriesSchedulesDropdown(user_type_login_id, filter, student_id = null): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
      query GetAllScheduleJuries(
        $user_type_login_id: ID!
        $filter: FilterScheduleJury
      ) {
        GetAllScheduleJurys(
          user_type_login_id: $user_type_login_id
          mark_entry_not_done: true
          for_global_schedule: true
          filter: $filter
          ${student_id ? `student_id: "${student_id}"` : ``}
        ) {
          _id
          school {
            _id
            short_name
          }
          rncp_title {
            _id
            short_name
          }
          president_of_jury {
            _id
            last_name
            first_name
          }
          professional_jury_member {
            _id
            last_name
            first_name
          }
          academic_jury_member {
            _id
            last_name
            first_name
          }
          substitution_jury_member {
            _id
            last_name
            first_name
          }
          students{
            professional_jury_member {
              _id
              first_name
              last_name
            }
            academic_jury_member {
              _id
              first_name
              last_name
            }
            substitution_jury_member {
              _id
              first_name
              last_name
            }
          }
        }
      }
      `,
        variables: { user_type_login_id, filter },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllScheduleJurys']));
  }

  // getJuriesSchedulesDropdown(user_type_login_id, jury_id, filter = null, student_id = null): Observable<any[]> {
  //   return this.apollo
  //     .query({
  //       query: gql`
  //     query GetAllScheduleJuries(
  //       $user_type_login_id: ID!
  //       $jury_id: ID
  //       $filter: FilterScheduleJury
  //     ) {
  //       GetAllScheduleJurys(
  //         user_type_login_id: $user_type_login_id
  //         jury_id: $jury_id
  //         filter: $filter
  //         for_global_schedule: true
  //         ${student_id ? `student_id: "${student_id}"` : ``}
  //       ) {
  //         _id
  //         school {
  //           _id
  //           short_name
  //         }
  //         rncp_title {
  //           _id
  //           short_name
  //         }
  //         president_of_jury {
  //           _id
  //           last_name
  //           first_name
  //         }
  //         professional_jury_member {
  //           _id
  //           last_name
  //           first_name
  //         }
  //         academic_jury_member {
  //           _id
  //           last_name
  //           first_name
  //         }
  //         substitution_jury_member {
  //           _id
  //           last_name
  //           first_name
  //         }
  //         students{
  //           professional_jury_member {
  //             _id
  //             first_name
  //             last_name
  //           }
  //           academic_jury_member {
  //             _id
  //             first_name
  //             last_name
  //           }
  //           substitution_jury_member {
  //             _id
  //             first_name
  //             last_name
  //           }
  //         }
  //       }
  //     }
  //     `,
  //       variables: { user_type_login_id, jury_id, filter },
  //       fetchPolicy: 'network-only',
  //     })
  //     .pipe(map((resp) => resp.data['GetAllScheduleJurys']));
  // }

  getJuriesSchedulesDropdown(user_type_login_id, filter, jury_id?): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetScheduleJuryDropdown($user_type_login_id: ID!, $jury_id: ID, $filter: FilterScheduleJury) {
            GetScheduleJuryDropdown(
              user_type_login_id: $user_type_login_id
              filter: $filter
              jury_id: $jury_id
              already_submit_assign_student: true
            ) {
              schools {
                _id
                short_name
              }
              rncp_titles {
                _id
                short_name
              }
              president_of_jurys {
                _id
                first_name
                last_name
                email
              }
              professional_jury_members {
                _id
                first_name
                last_name
                email
              }
              academic_jury_members {
                _id
                first_name
                last_name
                email
              }
              substitution_jury_members {
                _id
                first_name
                last_name
                email
              }
            }
          }
        `,
        variables: {
          user_type_login_id,
          filter,
          jury_id: jury_id ? jury_id : null,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetScheduleJuryDropdown']));
  }

  getGrandOralPDFData(school_id, rncp_title_id, student_id): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query  {
            GetGrandOralPDFData(
              school_id: "${school_id}"
              rncp_title_id: "${rncp_title_id}"
              student_id: "${student_id}"
            ) {
              certifierSchoolLogo
              rncpTitleLongName
              rncpTitleShortName
              schoolCertifierShortName
              schoolPreparationCenterShortName
              studentCivility
              studentFirstName
              studentLastName
              dateOfBirth
              placeOfBirth
              tableOfContents {
                refBlock
                blockName
                detailBlocks
              }
              markEntryBlocks {
                refBlock
                blockName
                scoreConversions {
                  _id
                  sign
                  score
                  phrase
                  letter
                }
                competences {
                  lengthCriteria
                  refComp
                  compName
                  firstCriteria {
                    _id
                    refCriteria
                    criteriaName
                    testCorrections {
                      rating
                      justification
                      level
                      isBilan
                      isAutoPro
                      isGrandOral
                    }
                    finalRating
                    finalLevel
                    scoreConversion {
                      _id
                      sign
                      score
                      phrase
                      letter
                    }
                  }
                  criterias {
                    _id
                    refCriteria
                    criteriaName
                    testCorrections {
                      rating
                      justification
                      level
                      isBilan
                      isAutoPro
                      isGrandOral
                    }
                    finalRating
                    finalLevel
                    scoreConversion {
                      _id
                      sign
                      score
                      phrase
                      letter
                    }
                  }
                  passFail
                }
                testsCC {
                  name
                  score
                }
                autoEvaluations {
                  lengthCriteria
                  refComp
                  compName
                  firstCriteria {
                    _id
                    refCriteria
                    criteriaName
                    testCorrections {
                      rating
                      justification
                      level
                      isBilan
                      isAutoPro
                      isGrandOral
                    }
                    finalRating
                    finalLevel
                    scoreConversion {
                      _id
                      sign
                      score
                      phrase
                      letter
                    }
                  }
                  criterias {
                    _id
                    refCriteria
                    criteriaName
                    testCorrections {
                      rating
                      justification
                      level
                      isBilan
                      isAutoPro
                      isGrandOral
                    }
                    finalRating
                    finalLevel
                    scoreConversion {
                      _id
                      sign
                      score
                      phrase
                      letter
                    }
                  }
                  passFail
                }
                proEvaluations {
                  lengthCriteria
                  refComp
                  compName
                  firstCriteria {
                    _id
                    refCriteria
                    criteriaName
                    testCorrections {
                      rating
                      justification
                      level
                      isBilan
                      isAutoPro
                      isGrandOral
                    }
                    finalRating
                    finalLevel
                    scoreConversion {
                      _id
                      sign
                      score
                      phrase
                      letter
                    }
                  }
                  criterias {
                    _id
                    refCriteria
                    criteriaName
                    testCorrections {
                      rating
                      justification
                      level
                      isBilan
                      isAutoPro
                      isGrandOral
                    }
                    finalRating
                    finalLevel
                    scoreConversion {
                      _id
                      sign
                      score
                      phrase
                      letter
                    }
                  }
                  passFail
                }
                grandOrals {
                  lengthCriteria
                  refComp
                  compName
                  firstCriteria {
                    _id
                    refCriteria
                    criteriaName
                    testCorrections {
                      rating
                      justification
                      level
                      isBilan
                      isAutoPro
                      isGrandOral
                    }
                    finalRating
                    finalLevel
                    scoreConversion {
                      _id
                      sign
                      score
                      phrase
                      letter
                    }
                  }
                  criterias {
                    _id
                    refCriteria
                    criteriaName
                    testCorrections {
                      rating
                      justification
                      level
                      isBilan
                      isAutoPro
                      isGrandOral
                    }
                    finalRating
                    finalLevel
                    scoreConversion {
                      _id
                      sign
                      score
                      phrase
                      letter
                    }
                  }
                  passFail
                }
                radars {
                  lengthCriteria
                  refComp
                  compName
                  firstCriteria {
                    _id
                    refCriteria
                    criteriaName
                    testCorrections {
                      rating
                      justification
                      level
                      isBilan
                      isAutoPro
                      isGrandOral
                    }
                    finalRating
                    finalLevel
                    scoreConversion {
                      _id
                      sign
                      score
                      phrase
                      letter
                    }
                  }
                  criterias {
                    _id
                    refCriteria
                    criteriaName
                    testCorrections {
                      rating
                      justification
                      level
                      isBilan
                      isAutoPro
                      isGrandOral
                    }
                    finalRating
                    finalLevel
                    scoreConversion {
                      _id
                      sign
                      score
                      phrase
                      letter
                    }
                  }
                  passFail
                }
                tests
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetGrandOralPDFData']));
  }

  getGlobalJuriesSchedules(user_type_login_id, pagination, student_id = null, sorting = null, filter = null): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllScheduleJuries(
            $user_type_login_id: ID!
            $pagination: PaginationInput,
            $sorting: SortingScheduleJury
            $filter: FilterScheduleJury
          ) {
            GetAllScheduleJurys(
              user_type_login_id: $user_type_login_id
              pagination: $pagination
              sorting: $sorting
              filter: $filter
              already_submit_assign_student: true
              ${student_id ? `student_id: "${student_id}"` : ``}
            ) {
              _id
              jury_organization_id{
                _id
                name
                type
                is_google_meet
              }
              mark_entry_task_status
              jury_serial_number
              school{
                _id
                short_name
                school_address{
                  address1
                  city
                }
              }
              rncp_title{
                _id
                short_name
              }
              class {
                _id
              }
              students{
                student_id {
                  _id
                  first_name
                  last_name
                  civility
                  student_address{
                    address
                    city
                  }
                  jury_organizations{
                    jury_id{
                      _id
                    }
                    already_open_rehearsal_room
                    already_contact_whatsapp
                  }
                  grand_oral_pdfs {
                    grand_oral_id {
                      _id
                      name
                    }
                    grand_oral_pdf_student
                    grand_oral_pdf_jury
                  }
                }
                professional_jury_member {
                  _id
                  first_name
                  last_name
                }
                academic_jury_member {
                  _id
                  first_name
                  last_name
                }
                substitution_jury_member {
                  _id
                  first_name
                  last_name
                }
                google_meet_url
              }
              test_groups{
                group_id{
                  _id
                  name
                }
                google_meet_url
              }
              time {
                date
                start
                finish
              }
              president_of_jury{
                _id
                first_name
                last_name
              }
              professional_jury_member{
                _id
                first_name
                last_name
              }
              academic_jury_member{
                _id
                first_name
                last_name
              }
              substitution_jury_member{
                _id
                first_name
                last_name
              }
              mark_entry_assigned{
                assigned_at {
                  date_utc
                  time_utc
                }
                assigned_to{
                  _id
                  first_name
                  last_name
                }
                task_id{
                  _id
                }
              }
              replay_visible_for_student
              replay_visible_for_certifier
              replay_visible_for_jury_member
              replay_visible_for_academic_director
              recorded_video_link
              mark_entry_task_status
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          user_type_login_id,
          pagination,
          sorting,
          filter,
        },
      })
      .pipe(map((resp) => resp.data['GetAllScheduleJurys']));
  }

  getJuriesSchedules(user_type_login_id, jury_id, pagination, student_id = null, sorting = null, filter = null): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllScheduleJuries(
            $user_type_login_id: ID!
            $jury_id: ID
            $pagination: PaginationInput,
            $sorting: SortingScheduleJury
            $filter: FilterScheduleJury
          ) {
            GetAllScheduleJurys(
              user_type_login_id: $user_type_login_id
              jury_id: $jury_id
              pagination: $pagination
              sorting: $sorting
              filter: $filter
              already_submit_assign_student: true
              ${student_id ? `student_id: "${student_id}"` : ``}
            ) {
              _id
              jury_organization_id{
                _id
                is_google_meet
                certifier {
                  _id
                  short_name
                  logo
                  }
                rncp_titles {
                  blocks_for_grand_oral {
                    block_id {
                      _id
                    }
                    is_selected
                  }
                }
              }
              mark_entry_task_status
              jury_serial_number
              school{
                _id
                short_name
                school_address{
                  address1
                  city
                }
              }
              rncp_title{
                _id
                short_name
              }
              class {
                _id
              }
              students{
                student_id {
                  _id
                  first_name
                  last_name
                  civility
                  date_of_birth
                  place_of_birth
                  student_address{
                    address
                    city
                  }
                  grand_oral_pdfs {
                    grand_oral_id {
                      _id
                      name
                    }
                    grand_oral_pdf_student
                    grand_oral_pdf_jury
                  }
                  jury_organizations{
                    jury_id{
                      _id
                    }
                    already_open_rehearsal_room
                    already_contact_whatsapp
                  }
                }
                professional_jury_member {
                  _id
                  first_name
                  last_name
                }
                academic_jury_member {
                  _id
                  first_name
                  last_name
                }
                substitution_jury_member {
                  _id
                  first_name
                  last_name
                }
                google_meet_url
              }
              test_groups{
                group_id{
                  _id
                  name
                }
                professional_jury_member {
                  _id
                  first_name
                  last_name
                }
                academic_jury_member {
                  _id
                  first_name
                  last_name
                }
                substitution_jury_member {
                  _id
                  first_name
                  last_name
                }
                google_meet_url
              }
              time {
                date
                start
                finish
              }
              president_of_jury{
                _id
                first_name
                last_name
              }
              professional_jury_member{
                _id
                first_name
                last_name
              }
              academic_jury_member{
                _id
                first_name
                last_name
              }
              substitution_jury_member{
                _id
                first_name
                last_name
              }
              mark_entry_assigned{
                assigned_at {
                  date_utc
                  time_utc
                }
                assigned_to{
                  _id
                  first_name
                  last_name
                }
                task_id{
                  _id
                }
              }
              replay_visible_for_student
              replay_visible_for_certifier
              replay_visible_for_jury_member
              replay_visible_for_academic_director
              recorded_video_link
              mark_entry_task_status
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          user_type_login_id,
          jury_id,
          pagination,
          sorting,
          filter,
        },
      })
      .pipe(map((resp) => resp.data['GetAllScheduleJurys']));
  }

  getOneScheduleJuryJoinRoom(jury_id, student_id = null): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneScheduleJury($jury_id: ID!, $student_id: ID!) {
            GetOneScheduleJury(jury_id: $jury_id, student_id: $student_id) {
              _id
              jury_organization_id {
                _id
                certifier {
                  _id
                  short_name
                  logo
                }
                rncp_titles {
                  blocks_for_grand_oral {
                    block_id {
                      _id
                    }
                    is_selected
                  }
                }
              }
              mark_entry_task_status
              jury_serial_number
              school {
                _id
                short_name
                school_address {
                  address1
                  city
                }
              }
              rncp_title {
                _id
                short_name
              }
              class {
                _id
              }
              students {
                student_id {
                  _id
                  first_name
                  last_name
                  civility
                  date_of_birth
                  place_of_birth
                  student_address {
                    address
                    city
                  }
                  grand_oral_pdfs {
                    grand_oral_id {
                      _id
                      name
                    }
                    grand_oral_pdf_student
                    grand_oral_pdf_jury
                  }
                }
                professional_jury_member {
                  _id
                  first_name
                  last_name
                }
                academic_jury_member {
                  _id
                  first_name
                  last_name
                }
                substitution_jury_member {
                  _id
                  first_name
                  last_name
                }
              }
              test_groups {
                group_id {
                  _id
                  name
                }
                professional_jury_member {
                  _id
                  first_name
                  last_name
                }
                academic_jury_member {
                  _id
                  first_name
                  last_name
                }
                substitution_jury_member {
                  _id
                  first_name
                  last_name
                }
              }
              time {
                date
                start
                finish
              }
              president_of_jury {
                _id
                first_name
                last_name
              }
              professional_jury_member {
                _id
                first_name
                last_name
              }
              academic_jury_member {
                _id
                first_name
                last_name
              }
              substitution_jury_member {
                _id
                first_name
                last_name
              }
              mark_entry_assigned {
                assigned_at {
                  date_utc
                  time_utc
                }
                assigned_to {
                  _id
                  first_name
                  last_name
                }
                task_id {
                  _id
                }
              }
              replay_visible_for_student
              replay_visible_for_certifier
              replay_visible_for_jury_member
              replay_visible_for_academic_director
              recorded_video_link
              mark_entry_task_status
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          jury_id,
          student_id,
        },
      })
      .pipe(map((resp) => resp.data['GetOneScheduleJury']));
  }

  checkStudentJuriesExist(student_id, user_type_login_id, pagination = { limit: 1, page: 0 }): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetAllScheduleJuries(
          $user_type_login_id: ID!
          $pagination: PaginationInput,
        ) {
          GetAllScheduleJurys(
            user_type_login_id: $user_type_login_id
            pagination: $pagination
            ${student_id ? `student_id: "${student_id}"` : ``}
          ) {
            _id
            count_document
          }
        }
      `,
        fetchPolicy: 'network-only',
        variables: {
          user_type_login_id,
          pagination,
        },
      })
      .pipe(map((resp) => resp.data['GetAllScheduleJurys']));
  }

  CreateJuryOrganizationSurvivalKit(juryOrgId: string, survivalKit: string[]) {
    return this.apollo.mutate({
      mutation: gql`
        mutation CreateJuryOrganizationSurvivalKit($juryOrgId: ID!, $survivalKit: [ID]) {
          CreateJuryOrganizationSurvivalKit(jury_organization_id: $juryOrgId, survival_kit: $survivalKit) {
            _id
            name
          }
        }
      `,
      variables: { juryOrgId, survivalKit },
    });
  }

  submitStepOne(_id: string) {
    return this.apollo.mutate({
      mutation: gql`
        mutation SubmitGrandOralParameter($_id: ID!) {
          SubmitGrandOralParameter(_id: $_id) {
            _id
          }
        }
      `,
      variables: { _id },
    });
  }

  getStudentJuriesSchedules(student_id, user_type_login_id, pagination, sorting): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllScheduleJuriesStudent(
            $user_type_login_id: ID!
            $pagination: PaginationInput,
            $sorting: SortingScheduleJury,
          ) {
            GetAllScheduleJurys(
              user_type_login_id: $user_type_login_id
              pagination: $pagination
              sorting: $sorting
              ${student_id ? `student_id: "${student_id}"` : ``}
            ) {
              _id
              mark_entry_task_status
              jury_serial_number
              jury_organization_id{
                _id
                online_jury_organization
                jury_member_required
                name
                is_google_meet
              }
              school{
                _id
                short_name
                school_address{
                  address1
                  city
                }
              }
              rncp_title{
                _id
                short_name
              }
              class {
                _id
              }
              students{
                student_id {
                  _id
                  first_name
                  last_name
                  civility
                  student_address{
                    address
                    city
                  }
                  grand_oral_pdfs {
                    grand_oral_id {
                      _id
                      name
                    }
                    grand_oral_pdf_student
                    grand_oral_pdf_jury
                  }
                }
                professional_jury_member {
                  _id
                  first_name
                  last_name
                }
                academic_jury_member {
                  _id
                  first_name
                  last_name
                }
                substitution_jury_member {
                  _id
                  first_name
                  last_name
                }
                google_meet_url
              }
              test_groups{
                group_id{
                  _id
                  name
                }
                professional_jury_member {
                  _id
                  first_name
                  last_name
                }
                academic_jury_member {
                  _id
                  first_name
                  last_name
                }
                substitution_jury_member {
                  _id
                  first_name
                  last_name
                }
              }
              time {
                date
                start
                finish
              }
              president_of_jury{
                _id
                first_name
                last_name
              }
              professional_jury_member{
                _id
                first_name
                last_name
              }
              academic_jury_member{
                _id
                first_name
                last_name
              }
              substitution_jury_member{
                _id
                first_name
                last_name
              }
              mark_entry_assigned{
                assigned_at {
                  date_utc
                  time_utc
                }
                assigned_to{
                  _id
                  first_name
                  last_name
                }
                task_id{
                  _id
                }
              }
              replay_visible_for_student
              replay_visible_for_certifier
              replay_visible_for_jury_member
              replay_visible_for_academic_director
              recorded_video_link
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          user_type_login_id,
          pagination,
          sorting,
        },
      })
      .pipe(map((resp) => resp.data['GetAllScheduleJurys']));
  }

  getJuryOrganizationParameter(titleId: string, classId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query {
        GetOneJuryParameter(rncp_id: "${titleId}", class_id: "${classId}") {
          _id
          standard_duration
          allow_use_text_jury_n7_phrase
          jury_n7_phrase_1
          jury_n7_phrase_2
          replay_visible_for_student
          replay_visible_for_academic_director
          replay_visible_for_certifier
          replay_visible_for_jury_member
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneJuryParameter']));
  }

  CreateJuryOrganizationParameter(juryOrgParam: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateJuryParameter($inputData: JuryParameterInput) {
            CreateJuryParameter(jury_parameter_input: $inputData) {
              _id
            }
          }
        `,
        variables: {
          inputData: juryOrgParam,
        },
      })
      .pipe(map((resp) => resp.data['CreateJuryParameter']));
  }

  updateJuryOrganizationParameter(juryOrgParamId: string, juryOrgParam: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateJuryParameter($id: ID!, $inputData: JuryParameterInput) {
            UpdateJuryParameter(_id: $id, jury_parameter_input: $inputData) {
              _id
            }
          }
        `,
        variables: {
          id: juryOrgParamId,
          inputData: juryOrgParam,
        },
      })
      .pipe(map((resp) => resp.data['UpdateJuryParameter']));
  }

  updateJuryOrganizationParameteSlider(id, payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateJuryOrganizationParameter($_id: ID!, $payload: JuryInput) {
            UpdateJuryOrganizationParameter(_id: $_id, jury_input: $payloadt) {
              _id
              jury_input
            }
          }
        `,
        variables: {
          _id: id,
          jury_input: payload,
        },
      })
      .pipe(map((resp) => resp));
  }

  getAllJuryOrganizationsList(pagination, sorting, filter, userTypeLoginId: string) {
    return this.apollo
      .query({
        query: gql`
          query getAllJuryOrganizationsList(
            $pagination: PaginationInput
            $sorting: SortingJuryOrganizationInput
            $filter: FilterJuryOrganizationInput
            $userType: ID
          ) {
            GetAllJuryOrganizationParameters(pagination: $pagination, sorting: $sorting, filter: $filter, user_type_login_id: $userType) {
              _id
              name
              type
              certifier {
                _id
              }
              is_published
              jury_created_by {
                _id
              }
              rncp_titles {
                rncp_id {
                  _id
                  short_name
                }
                class_id {
                  _id
                  name
                }
                test_id {
                  _id
                  name
                }
              }
              online_jury_organization
              jury_member_required
              current_status
              safety_room
              count_document
            }
          }
        `,
        variables: {
          pagination: pagination,
          sorting: sorting,
          filter: filter,
          userType: userTypeLoginId,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllJuryOrganizationParameters']));
  }

  getOneJuryOrganizationForMainSchedule(juryOrgId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query getOneJuryOrganizationData {
            GetOneJuryOrganizationParameter(_id: "${juryOrgId}"){
              _id
              name
              current_status
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneJuryOrganizationParameter']));
  }

  getOneJuryOrganizationDataById(juryOrgId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query getOneJuryOrganizationData {
            GetOneJuryOrganizationParameter(_id: "${juryOrgId}"){
              _id
              name
              type
              certifier {
                _id
              }
              is_published
              jury_created_by {
                _id
              }
              survival_kit {
                _id
                document_name
                s3_file_name
              }
              current_status
              online_jury_organization
              jury_member_required
              rncp_titles {
                rncp_id {
                  _id
                  short_name
                }
                class_id {
                  _id
                  name
                }
                test_id {
                  _id
                  name
                  is_published
                  group_test
                }
                schools {
                  school {
                    _id
                    short_name
                    school_address {
                      city
                    }
                  }
                  number_of_jury
                  retake_center {
                    _id
                    short_name
                  }
                  date_start
                  date_finish
                  students {
                    _id
                  }
                  is_jury_assigned
                  test_groups {
                    _id
                    name
                  }
                  students {
                    _id
                    first_name
                    last_name
                  }
                  is_school_selected_for_grand_oral
                  backup_date_start
                  backup_time_start
                  backup_date_finish
                  backup_time_finish
                  time_start
                  time_finish
                }
                blocks_for_grand_oral {
                  block_id {
                    _id
                    block_of_competence_condition
                    subjects {
                      _id
                      subject_name
                      evaluations {
                        _id
                        evaluation
                      }
                    }
                  }
                  is_selected
                }
                send_grand_oral_pdf_to_student
                send_grand_oral_pdf_to_student_schedule
                send_grand_oral_pdf_to_jury
                send_grand_oral_pdf_to_jury_schedule
                student_required_upload_presentation
                student_required_upload_presentation_schedule
                student_required_upload_cv
                student_required_upload_cv_schedule
                grand_oral_proposition
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          _id: juryOrgId,
        },
      })
      .pipe(map((resp) => resp.data['GetOneJuryOrganizationParameter']));
  }

  getOneJuryOrganizationClassesById(juryOrgId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query getOneJuryOrganizationData {
            GetOneJuryOrganizationParameter(_id: "${juryOrgId}"){
              _id
              current_status
              rncp_titles {
                rncp_id {
                  _id
                  short_name
                }
                class_id {
                  _id
                  name
                }
                test_id{
                  _id
                }
                schools {
                  _id
                  school {
                    _id
                    short_name
                  }
                  students {
                    _id
                    first_name
                    last_name
                  }
                  is_school_selected_for_grand_oral
                }
                blocks_for_grand_oral {
                  block_id {
                    _id
                    block_of_competence_condition
                    subjects {
                      _id
                      subject_name
                      evaluations {
                        _id
                        evaluation
                      }
                    }
                  }
                  is_selected
                }
                send_grand_oral_pdf_to_student
                send_grand_oral_pdf_to_student_schedule
                send_grand_oral_pdf_to_jury
                send_grand_oral_pdf_to_jury_schedule
                student_required_upload_presentation
                student_required_upload_presentation_schedule
                student_required_upload_cv
                student_required_upload_cv_schedule
                grand_oral_proposition
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneJuryOrganizationParameter']));
  }

  getJuries(userType: string[], schools: string[], rncpTitle: string[]): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllUsers($userType: [ID!], $schools: [ID], $rncpTitle: [ID!]) {
            GetAllUsers(user_type: $userType, schools: $schools, title: $rncpTitle) {
              _id
              first_name
              last_name
              entities {
                school {
                  _id
                  short_name
                }
              }
            }
          }
        `,
        variables: {
          userType,
          schools,
          rncpTitle,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getJuriesPC(userType: string[], schools: string[], rncpTitle: string[]): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllUsers($userType: [ID!], $schools: [ID], $rncpTitle: [ID!]) {
            GetAllUsers(user_type: $userType, schools: $schools, title: $rncpTitle, school_type: preparation_center) {
              _id
              first_name
              last_name
              entities {
                school {
                  _id
                  short_name
                }
              }
            }
          }
        `,
        variables: {
          userType,
          schools,
          rncpTitle,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getJuriesCertifier(userType: string[], schools: string[], rncpTitle: string[]): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllUsers($userType: [ID!], $schools: [ID], $rncpTitle: [ID!]) {
            GetAllUsers(user_type: $userType, schools: $schools, title: $rncpTitle, school_type: certifier) {
              _id
              first_name
              last_name
              entities {
                school {
                  _id
                  short_name
                }
              }
            }
          }
        `,
        variables: {
          userType,
          schools,
          rncpTitle,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllUsers']));
  }

  getAllJuryMembers(juryOrgId: string, filter_by_acadir = null): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
      query GetAllJuryMembersInAssignMemberTab($filter_by_acadir: Boolean) {
        GetAllJuryMembers(jury_id: "${juryOrgId}", filter_by_acadir: $filter_by_acadir) {
          _id
          jury_serial_number
          date_start
          school {
            _id
            short_name
            school_address {
              city
            }
          }
          rncp_title {
            short_name
          }
          students {
            student_id {
              _id
            }
          }
          president_of_jury {
            _id
            first_name
            last_name
          }
          professional_jury_member {
            _id
            first_name
            last_name
          }
          academic_jury_member {
            _id
            first_name
            last_name
          }
          substitution_jury_member {
            _id
            first_name
            last_name
          }
        }
      }
      `,
        fetchPolicy: 'network-only',
        variables: {
          filter_by_acadir,
        },
      })
      .pipe(map((resp) => resp.data['GetAllJuryMembers']));
  }

  getAllJuryMembersAssignStudentTab(juryOrgId: string, pagination, sorting, filter_by_acadir = null): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
      query getAllJuryMembersAssignStudentTab($pagination: PaginationInput, $sorting: SortingJuryMember, $filter_by_acadir: Boolean){
        GetAllJuryMembers(jury_id: "${juryOrgId}", pagination: $pagination, sorting: $sorting, filter_by_acadir: $filter_by_acadir) {
          _id
          rncp_title{
            _id
            short_name
          }
          class{
            _id
            name
          }
          school{
            _id
            short_name
            school_address{
              address1
              city
            }
          }
          students{
            student_id{
              _id
              first_name
              last_name
            }
          }
          test_id{
            _id
            name
            group_test
            is_published
          }
          jury_organization_id{
            _id
            name
          }
          break_duration
          break_time
          date_start
          date_finish
          start_time
          end_time
          is_backup_schedule
          is_student_assigned
          jury_serial_number
          mark_entry_assigned{
            assigned_at {
              date_utc
              time_utc
            }
            assigned_to {
              _id
              first_name
              last_name
            }
          }
          number_students
          president_of_jury{
            _id
            first_name
            last_name
          }
          professional_jury_member{
            _id
            first_name
            last_name
          }
          academic_jury_member{
            _id
            first_name
            last_name
          }
          substitution_jury_member{
            _id
            first_name
            last_name
          }
          test_groups{
            group_id{
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
          sorting,
          filter_by_acadir,
        },
      })
      .pipe(map((resp) => resp.data['GetAllJuryMembers']));
  }

  getAllJuryMembersAssignStudentTabNoPagination(juryOrgId: string, sorting, filter_by_acadir = null): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
      query getAllJuryMembersAssignStudentTab($sorting: SortingJuryMember, $filter_by_acadir: Boolean){
        GetAllJuryMembers(jury_id: "${juryOrgId}", sorting: $sorting, filter_by_acadir: $filter_by_acadir) {
          _id
          rncp_title{
            _id
            short_name
          }
          class{
            _id
            name
          }
          school{
            _id
            short_name
            school_address{
              address1
              city
            }
          }
          students{
            student_id{
              _id
              first_name
              last_name
            }
          }
          test_id{
            _id
            name
            group_test
            is_published
          }
          jury_organization_id{
            _id
            name
          }
          break_duration
          break_time
          date_start
          date_finish
          start_time
          end_time
          is_backup_schedule
          is_student_assigned
          jury_serial_number
          mark_entry_assigned{
            assigned_at {
              date_utc
              time_utc
            }
            assigned_to {
              _id
              first_name
              last_name
            }
          }
          number_students
          president_of_jury{
            _id
            first_name
            last_name
          }
          professional_jury_member{
            _id
            first_name
            last_name
          }
          academic_jury_member{
            _id
            first_name
            last_name
          }
          substitution_jury_member{
            _id
            first_name
            last_name
          }
          test_groups{
            group_id{
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
          sorting,
          filter_by_acadir,
        },
      })
      .pipe(map((resp) => resp.data['GetAllJuryMembers']));
  }

  getOneJuryMembersAssignStudentPerJury(juryOrgId: string, titleId, schoolId): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
      query getAllJuryMembersAssignStudentPerJury{
        GetAllJuryMembers(jury_id: "${juryOrgId}", rncp_title_id: "${titleId}", school_id: "${schoolId}") {
          _id
          rncp_title{
            _id
            short_name
          }
          class{
            _id
            name
          }
          school{
            _id
            short_name
            school_address{
              address1
              city
            }
          }
          students{
            student_id{
              _id
              first_name
              last_name
            }
            date_test
            test_hours_start
            test_hours_finish
            professional_jury_member {
              _id
              first_name
              last_name
            }
            academic_jury_member {
              _id
              first_name
              last_name
            }
            substitution_jury_member {
              _id
              first_name
              last_name
            }
          }
          test_id{
            _id
            name
            group_test
            is_published
          }
          jury_organization_id{
            _id
            name
          }
          break_duration
          break_time
          date_start
          date_finish
          start_time
          end_time
          is_backup_schedule
          is_student_assigned
          jury_serial_number
          mark_entry_assigned{
            assigned_at {
              date_utc
              time_utc
            }
            assigned_to {
              _id
              first_name
              last_name
            }
          }
          number_students
          president_of_jury{
            _id
            first_name
            last_name
          }
          professional_jury_member{
            _id
            first_name
            last_name
          }
          academic_jury_member{
            _id
            first_name
            last_name
          }
          substitution_jury_member{
            _id
            first_name
            last_name
          }
          test_groups{
            group_id{
              _id
              name
            }
            date_test
            test_hours_start
            test_hours_finish
          }
          count_document
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllJuryMembers']));
  }

  assignPresidentOfJury(lang: string, juryOrgId: string, juryMembers: any[], isSubmit: boolean) {
    return this.apollo.mutate({
      mutation: gql`
        mutation AssignPresidentOfJury($lang: String, $juryOrgId: ID, $juryMembers: [JuryMemberInput], $isSubmit: Boolean) {
          AssignPresidentOfJury(lang: $lang, jury_id: $juryOrgId, jury_members_input: $juryMembers, is_submit: $isSubmit) {
            _id
          }
        }
      `,
      variables: { lang, juryOrgId, juryMembers, isSubmit },
    });
  }

  assignMemberOfJury(lang: string, juryOrgId: string, juryMembers: any[], isSubmit: boolean) {
    return this.apollo.mutate({
      mutation: gql`
        mutation AssignMemberOfJury($lang: String, $juryOrgId: ID, $juryMembers: [JuryMemberInput], $isSubmit: Boolean) {
          AssignMemberOfJury(lang: $lang, jury_id: $juryOrgId, jury_members_input: $juryMembers, is_submit: $isSubmit) {
            _id
          }
        }
      `,
      variables: { lang, juryOrgId, juryMembers, isSubmit },
    });
  }

  getTitleDropdownFilterList(): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query {
            GetAllTitles {
              _id
              short_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTitles']));
  }

  getCertifierSchoolJury(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query getCertifierSchoolJury {
            GetAllSchools(school_type: certifier) {
              _id
              short_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getCertifierSchoolGrandOral(): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query getCertifierSchoolJury {
            GetAllSchools(school_type: certifier, class_evaluation_type: expertise) {
              _id
              short_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllSchools']));
  }

  getTitleListJury(certId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query getTitleListJury{
            GetRncpHavingMemoireOralTest(certifier_school: "${certId}"){
              _id
              short_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetRncpHavingMemoireOralTest']));
  }

  getTitleListGrand(school_id): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query getTitleListJury($school_id: [String]) {
            GetAllTitles(school_type: "certifier", school_id: $school_id, class_evaluation_type: expertise) {
              _id
              short_name
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          school_id: school_id,
        },
      })
      .pipe(map((resp) => resp.data['GetAllTitles']));
  }

  getTitleListGrandOral(certId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query getTitleListGrandOral{
            GetTitleDropdownList(school_id: "${certId}", type_evaluation: expertise, should_have_class: true){
              _id
              short_name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetTitleDropdownList']));
  }

  getClassListJury(titleId, isForRetake): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query getClassListJury{
            GetAllClasses(rncp_id: "${titleId}", is_for_retake_jury: ${isForRetake}, is_for_jury_organization: true){
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllClasses']));
  }

  getClassOralListJury(titleId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query getClassOralListJury{
            GetAllClasses(rncp_id: "${titleId}", is_for_retake_jury: false, type_evaluation: expertise){
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllClasses']));
  }

  getClassGrandOralListJury(titleId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query getClassOralListJury{
            GetAllClasses(rncp_id: "${titleId}"){
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllClasses']));
  }

  getTestsListJury(titleId, classId, isForRetake): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query getTestsListJury {
            GetAllTests(rncp_title_id: "${titleId}", class_id:"${classId}", is_for_retake_jury: ${isForRetake}, type:memoire_oral){
              _id
              name
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllTests']));
  }

  createJuryOrganization(payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation createJuryOrganization($payload: JuryInput) {
            CreateJuryOrganizationParameter(jury_input: $payload) {
              _id
              name
            }
          }
        `,
        variables: {
          payload: payload,
        },
      })
      .pipe(map((resp) => resp));
  }

  updateJuryOrganization(juryOrgId: string, payload: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation updateJuryOrganization($juryId: ID!, $payload: JuryInput) {
            UpdateJuryOrganizationParameter(_id: $juryId, jury_input: $payload) {
              _id
              name
            }
          }
        `,
        variables: {
          payload: payload,
          juryId: juryOrgId,
        },
      })
      .pipe(map((resp) => resp));
  }

  deleteJuryOrganization(juryId): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
      mutation deleteJuryOrganization{
        DeleteJuryOrganizationParameter(_id: "${juryId}") {
          _id
        }
      }
      `,
      })
      .pipe(map((resp) => resp));
  }

  findSchoolOnjuryOrganization(juryOrgId: string, titleId: string, schoolId: string): Observable<{ _id: string; short_name: string }> {
    return this.apollo
      .query({
        query: gql`
      query {
        getSchoolByJuryOrganizationAndTitle(jury_id: "${juryOrgId}", rncp_title_id: "${titleId}", school_id: "${schoolId}") {
          rncp_id{
            _id
            short_name
          }
          class_id {
            _id
            name
          }
          test_id {
            _id
            name
            group_test
          }
          schools {
            _id
            school{
              _id
              short_name
              school_address{
                city
                is_main_address
              }
            }
            students{
              _id
              first_name
              last_name
            }
            test_groups{
              _id
              name
            }
          }
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['getSchoolByJuryOrganizationAndTitle']));
  }

  getAssignedStudentsPerJury(juryOrgId: string, titleId: string, schoolId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query {
          GetAllStudentAssigned(jury_id: "${juryOrgId}", rncp_title_id: "${titleId}", school_id: "${schoolId}") {
            test_hours_start
            student_id{
              _id
              first_name
              last_name
            }
            jury_member_id{
              _id
            }
            professional_jury_member {
              _id
              first_name
              last_name
            }
            academic_jury_member {
              _id
              first_name
              last_name
            }
            substitution_jury_member {
              _id
              first_name
              last_name
            }
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudentAssigned']));
  }

  getStudentToAssignPerJury(juryOrgId: string, titleId: string, schoolId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query {
          GetAllStudents(jury_organization_id: "${juryOrgId}", rncp_title: "${titleId}", school: "${schoolId}", status: active_completed) {
            _id
            first_name
            last_name
            companies {
              is_active
              mentor {
                _id
                first_name
                last_name
              }
            }
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllStudents']));
  }

  countEndate(payload): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query {
        GetPredictJuryEnded(
          rncp_title_id: "${payload.rncp_title_id}",
          class_id: "${payload.class_id}",
          start_time: "${payload.start_time}",
          break_duration: ${payload.break_duration},
          number_student: ${payload.number_student})
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetPredictJuryEnded']));
  }

  saveMainSchedule(jury_id, rncp_title_id, class_id, school_id, number_of_jury, payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
        mutation SaveJuryMemberGroup($jury_members_input: [JuryMemberInput]){
          SaveJuryMemberGroup(
            jury_id: "${jury_id}",
            rncp_title_id: "${rncp_title_id}",
            class_id: "${class_id}",
            school_id: "${school_id}",
            number_of_jury: ${number_of_jury},
            jury_members_input: $jury_members_input
          ) {
            _id
          }
      }
      `,
        variables: {
          jury_members_input: payload,
        },
      })
      .pipe(map((resp) => resp));
  }

  getJuryNumberEachSchool(juryId, titleId, classId, schoolId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
      query {
        GetAllJuryMembers(
          jury_id: "${juryId}"
          rncp_title_id: "${titleId}",
          class_id: "${classId}",
          school_id: "${schoolId}") {
            number_students
            end_time
            start_time
            break_time
            break_duration
            start_time
            date_start
            date_finish
            test_id {
              _id
            }
          }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllJuryMembers']));
  }

  sendAssignNumberJuryToCertifier(jury_id, lang, sent_to_certifier, rncp_titles): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
        mutation SaveScheduleOfJury($rncp_titles: [JuryRncpTitleInput]){
          SaveScheduleOfJury(
            jury_id: "${jury_id}",
            lang: "${lang}",
            sent_to_certifier: ${sent_to_certifier},
            rncp_titles: $rncp_titles
          ) {
            _id
          }
      }
      `,
        variables: {
          rncp_titles: rncp_titles,
        },
      })
      .pipe(map((resp) => resp));
  }

  getBackupSchedules(juryId, titleId, classId, schoolId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query {
          GetBackupSchedules(
            jury_id: "${juryId}"
            rncp_id: "${titleId}",
            class_id: "${classId}",
            school_id: "${schoolId}") {
              number_students
              end_time
              start_time
              break_time
              break_duration
              start_time
              date_start
              date_finish
              test_id {
                _id
              }
            }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetBackupSchedules']));
  }

  saveBackupSchedule(jury_id, rncp_id, class_id, school_id, payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
        mutation SaveBackupSchedules($backup_schedules: [BackUpScheduleInput]){
          SaveBackupSchedules(
            jury_id: "${jury_id}",
            rncp_id: "${rncp_id}",
            class_id: "${class_id}",
            school_id: "${school_id}",
            backup_schedules: $backup_schedules
          ) {
            _id
          }
      }
      `,
        variables: {
          backup_schedules: payload,
        },
      })
      .pipe(map((resp) => resp));
  }

  saveAssignStudent(jury_id, rncp_title_id, school_id, lang, is_submit, students_input, test_groups_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SaveAssignedStudentAndLeave($students_input: [JuryMemberStudentInput], $test_groups_input: [JuryMemberGroupInput]) {
            SaveAssignedStudent(
              jury_id: "${jury_id}",
              rncp_title_id: "${rncp_title_id}",
              school_id: "${school_id}",
              lang: "${lang}",
              is_submit: ${is_submit},
              students_input: $students_input,
              test_groups_input:$test_groups_input
              ) {
              _id
            }
          }
        `,
        variables: {
          students_input,
          test_groups_input,
        },
      })
      .pipe(map((resp) => resp.data['SaveAssignedStudent']));
  }

  JoinRehearsalRoom(jury_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
        mutation JoinRehearsalRoom{
          JoinRehearsalRoom(
            jury_id: "${jury_id}"
          ) {
            meetingURL
          }
      }
      `,
      })
      .pipe(map((resp) => resp.data['JoinRehearsalRoom']));
  }

  JoinStudentRehearsalRoom(jury_member_id, studentGroupId, duration): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
        mutation JoinRehearsalRoomStudent{
          JoinRehearsalRoomStudent(
            jury_member_id: "${jury_member_id}"
            student_or_test_group_id: "${studentGroupId}"
            duration: "${duration}"
          ) {
            meetingURL
          }
      }
      `,
      })
      .pipe(map((resp) => resp.data['JoinRehearsalRoomStudent']));
  }

  launchJurySessionForJury(jury_member_id, student_id, duration): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
        mutation JuryJoinRoom{
          JuryJoinRoom(
            jury_member_id: "${jury_member_id}"
            student_id: "${student_id}"
            duration: "${duration}"
          ) {
            meetingURL
          }
      }
      `,
      })
      .pipe(map((resp) => resp.data['JuryJoinRoom']));
  }

  launchJurySessionForJuryGroup(jury_member_id, group_id, duration): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
        mutation JuryJoinRoomTestGroup{
          JuryJoinRoomTestGroup(
            jury_member_id: "${jury_member_id}"
            group_id: "${group_id}"
            duration: "${duration}"
          ) {
            meetingURL
          }
      }
      `,
      })
      .pipe(map((resp) => resp.data['JuryJoinRoomTestGroup']));
  }

  launchJurySessionForStudent(jury_member_id, student_user_id, duration): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
        mutation StudentJoinRoom{
          StudentJoinRoom(
            jury_member_id: "${jury_member_id}"
            student_user_id: "${student_user_id}"
            duration: ${duration}
          ) {
            meetingURL
          }
      }
      `,
      })
      .pipe(map((resp) => resp.data['StudentJoinRoom']));
  }

  getSurvivalKitZipUrl(juryId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query {
          GetSurvivalKitZipUrl(jury_id: "${juryId}")
        }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetSurvivalKitZipUrl']));
  }

  getBackupSchedulesForPostpone(juryId, titleId, classId, schoolId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query {
          GetBackupSchedules(
            jury_id: "${juryId}"
            rncp_id: "${titleId}",
            class_id: "${classId}",
            school_id: "${schoolId}") {
              _id
              date_start
              date_finish
              end_time
              start_time
              break_duration
              break_time
              jury_serial_number
              number_students
              is_backup_schedule
              is_student_assigned
              rncp_title{
                _id
                short_name
              }
              class{
                _id
                name
              }
              school{
                _id
                short_name
              }
              test_id{
                _id
                name
              }
              jury_organization_id{
                _id
                name
              }
              students{
                date_test
                test_hours_start
                test_hours_finish
              }
              test_groups{
                date_test
                test_hours_start
                test_hours_finish
              }
            }
        }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetBackupSchedules']));
  }

  savePostponeSchedule(payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SavePostponeSchedule(
            $lang: String
            $jury_id: ID
            $student_id: ID
            $test_group_id: ID
            $jury_member_id: ID
            $backup_schedule_id: ID
            $test_hours_start: String
            $test_hours_finish: String
            $date_test: String
            $reason: String
          ) {
            SavePostponeSchedule(
              lang: $lang
              jury_id: $jury_id
              jury_member_id: $jury_member_id
              student_id: $student_id
              test_group_id: $test_group_id
              backup_schedule_id: $backup_schedule_id
              test_hours_start: $test_hours_start
              test_hours_finish: $test_hours_finish
              date_test: $date_test
              reason: $reason
            ) {
              _id
            }
          }
        `,
        variables: {
          lang: payload && payload.lang ? payload.lang : null,
          jury_id: payload && payload.jury_id ? payload.jury_id : null,
          jury_member_id: payload && payload.jury_member_id ? payload.jury_member_id : null,
          student_id: payload && payload.student_id ? payload.student_id : null,
          test_group_id: payload && payload.test_group_id ? payload.test_group_id : null,
          backup_schedule_id: payload && payload.backup_schedule_id ? payload.backup_schedule_id : null,
          test_hours_start: payload && payload.test_hours_start ? payload.test_hours_start : null,
          test_hours_finish: payload && payload.test_hours_finish ? payload.test_hours_finish : null,
          date_test: payload && payload.date_test ? payload.date_test : null,
          reason: payload && payload.reason ? payload.reason : null,
        },
      })
      .pipe(map((resp) => resp));
  }

  getAllBlocksForTranscriptForGrandOral(rncpId: string, classId: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
      query getAllBlocksForTranscriptForGrandOral {
        GetAllBlockOfCompetenceConditions(rncp_title_id:"${rncpId}", class_id:"${classId}", is_retake_by_block: false, is_automatic_created_block: true){
          _id
          block_of_competence_condition
          block_rncp_reference
          description
          count_for_title_final_score
          subjects {
            _id
            subject_name
            is_subject_transversal_block
            subject_transversal_block_id {
              _id
              subject_name
            }
            evaluations {
              _id
              evaluation
            }
          }
          block_of_tempelate_competence{
            _id
            ref_id
          }
          block_of_tempelate_soft_skill{
            _id
            ref_id
          }
          block_type
        }
      }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllBlockOfCompetenceConditions']));
  }

  getSchoolPCList(rncp_title_ids, class_id): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query getSchoolPcListFirstStep($rncp_title_ids: [ID], $class_id: ID) {
            GetAllSchools(school_type: preparation_center, rncp_title_ids: $rncp_title_ids, class_id: $class_id) {
              _id
              short_name
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          rncp_title_ids,
          class_id,
        },
      })
      .pipe(map((resp) => resp.data['GetAllSchools']));
  }

  updateJuryOrganizationGrandOralParameter(juryOrgParamId, juryOrgParam): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateJuryOrganizationParameter($id: ID!, $inputData: JuryInput) {
            UpdateJuryOrganizationParameter(_id: $id, jury_input: $inputData) {
              _id
            }
          }
        `,
        variables: {
          id: juryOrgParamId,
          inputData: juryOrgParam,
        },
      })
      .pipe(map((resp) => resp.data['UpdateJuryOrganizationParameter']));
  }

  submitGrandOralParameter(_id) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SubmitGrandOralParameter($_id: ID!) {
            SubmitGrandOralParameter(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['SubmitGrandOralParameter']));
  }

  getOneScheduleJury(jury_id, student_id) {
    return this.apollo
      .query({
        query: gql`
          query GetOneScheduleJury($jury_id: ID!, $student_id: ID!) {
            GetOneScheduleJury(jury_id: $jury_id, student_id: $student_id) {
              _id
              jury_member_id
              jury_organization_id {
                _id
                certifier {
                  _id
                  short_name
                  logo
                }
                rncp_titles {
                  blocks_for_grand_oral {
                    block_id {
                      _id
                      block_of_tempelate_soft_skill {
                        _id
                        ref_id
                        name
                        class_id {
                          _id
                          score_conversions_soft_skill {
                            _id
                            sign
                            score
                            phrase
                            letter
                            already_used_in_test
                          }
                        }
                        competence_softskill_templates_id {
                          _id
                          ref_id
                          name
                          criteria_of_evaluation_softskill_templates_id {
                            _id
                            ref_id
                            name
                          }
                          phrase_names {
                            _id
                            name
                          }
                        }
                      }
                      block_of_tempelate_competence {
                        _id
                        ref_id
                        name
                        class_id {
                          _id
                          score_conversions_competency {
                            _id
                            sign
                            score
                            phrase
                            letter
                            already_used_in_test
                          }
                        }
                        competence_templates_id {
                          _id
                          ref_id
                          name
                          criteria_of_evaluation_templates_id {
                            _id
                            ref_id
                            name
                          }
                          phrase_names {
                            _id
                            name
                          }
                        }
                      }
                      block_type
                    }
                    is_selected
                  }
                }
                type
              }
              school {
                _id
                short_name
                school_address {
                  address1
                  city
                }
              }
              rncp_title {
                _id
                short_name
                long_name
              }
              class {
                _id
              }
              students {
                student_id {
                  _id
                  first_name
                  last_name
                  civility
                  date_of_birth
                  place_of_birth
                  student_address {
                    address
                    city
                  }
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          jury_id,
          student_id,
        },
      })
      .pipe(map((resp) => resp.data['GetOneScheduleJury']));
  }

  getAllGrandOralCorrections(student_id, rncp_title_id, class_id, school_id) {
    return this.apollo
      .query({
        query: gql`
          query {
            GetAllGrandOralCorrections
            (filter: {
              student_id: "${student_id}",
              rncp_title_id: "${rncp_title_id}",
              class_id: "${class_id}",
              school_id: "${school_id}"
            }
              ) {
              _id
              grand_oral_id
              is_submitted {
                grand_oral_id {
                  _id
                }
                is_submitted
              }
              block_of_competence_templates {
                block_id {
                  _id
                  ref_id
                  name
                }
                phrase_obtained_id {
                  _id
                  name
                }
                competence_templates {
                  competence_template_id {
                    _id
                    ref_id
                    name
                    phrase_names {
                      _id
                      name
                    }
                  }
                  score_conversion_id {
                    _id
                    name
                  }
                  justification
                  criteria_of_evaluation_templates_id {
                    _id
                  }
                }
              }
              block_of_soft_skill_templates {
                block_id {
                  _id
                  ref_id
                  name
                }
                competence_templates {
                  competence_template_id {
                    _id
                    ref_id
                    name
                    phrase_names {
                      _id
                      name
                    }
                  }
                  score_conversion_id {
                    _id
                    name
                  }
                  justification
                  criteria_of_evaluation_templates_id {
                    _id
                  }
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllGrandOralCorrections']));
  }

  getTestCorrectionForControlContinue(block_id, student_id) {
    return this.apollo
      .query({
        query: gql`
          query GetTestCorrectionForControlContinue($block_id: ID!, $student_id: ID!) {
            GetTestCorrectionForControlContinue(block_id: $block_id, student_id: $student_id) {
              _id
              test {
                name
                max_score
              }
              correction_grid {
                correction {
                  additional_total
                  total
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          block_id,
          student_id,
        },
      })
      .pipe(map((resp) => resp.data['GetTestCorrectionForControlContinue']));
  }

  createGrandOralCorrection(grand_oral_correction_input) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateGrandOralCorrection($grand_oral_correction_input: GrandOralCorrectionInput) {
            CreateGrandOralCorrection(grand_oral_correction_input: $grand_oral_correction_input) {
              _id
            }
          }
        `,
        variables: {
          grand_oral_correction_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateGrandOralCorrection']));
  }

  updateGrandOralCorrection(grand_oral_correction_input, _id) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateGrandOralCorrection($grand_oral_correction_input: GrandOralCorrectionInput, $_id: ID!) {
            UpdateGrandOralCorrection(grand_oral_correction_input: $grand_oral_correction_input, _id: $_id) {
              _id
            }
          }
        `,
        variables: {
          grand_oral_correction_input,
          _id,
        },
      })
      .pipe(map((resp) => resp.data['UpdateGrandOralCorrection']));
  }

  generateGrandOralPDF(jury_organization_id, student_id) {
    return this.apollo
      .mutate({
        mutation: gql`
        mutation {
          GenerateGrandOralPDF(
            jury_organization_id: "${jury_organization_id}"
            student_id: "${student_id}"
          )
        }
        `,
      })
      .pipe(map((resp) => resp.data['GenerateGrandOralPDF']));
  }

  SubmitMarksEntryForJuryGrandOral(school_id: string, jury_id: string, jury_member_id: string, student_id: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SubmitMarksEntryForJury($school_id: ID!, $jury_id: ID!, $jury_member_id: ID!, $student_id: ID) {
            SubmitMarksEntryForJury(
              school_id: $school_id
              is_submit_from_acad_kit: true
              jury_id: $jury_id
              jury_member_id: $jury_member_id
              student_id: $student_id
            ) {
              _id
            }
          }
        `,
        variables: { school_id, jury_id, jury_member_id, student_id },
      })
      .pipe(map((resp) => resp.data['SubmitMarksEntryForJury']));
  }

  validateTestCorrection(school_id: string) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ValidateMarksEntry($school_id: ID!) {
            ValidateMarksEntry(school_id: $school_id) {
              _id
            }
          }
        `,
        variables: {
          school_id: school_id,
        },
      })
      .pipe(map((resp) => resp.data['ValidateMarksEntry']));
  }

  checkOneGlobalBackupSchedulePublished(juryOrgId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneGlobalBackupSchedule {
            GetOneGlobalBackupSchedule(jury_id: "${juryOrgId}") {
              _id
              is_published
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneGlobalBackupSchedule']));
  }

  getPresidentJuryListGlobalBackupSchedule(juryOrgId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetPresidentJuryListGlobalBackupSchedule {
            GetOneGlobalBackupSchedule(jury_id: "${juryOrgId}") {
              _id
              president_of_juries {
                president_of_jury_id {
                  _id
                  first_name
                  last_name
                  civility
                  full_name
                }
                dates {
                  number_of_session
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneGlobalBackupSchedule']));
  }

  publishGlobalBackupSchedule(juryOrgId): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation PublishGlobalBackupSchedule {
            PublishGlobalBackupSchedule(jury_id: "${juryOrgId}") {
              _id
            }
          }
        `,
      })
      .pipe(map((resp) => resp));
  }

  getBackupScheduleOfPresidentJury(juryOrgId, presidentId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetBackupScheduleOfPresidentJury {
            GetAllGlobalBackupSchedulePresidentJuries(jury_id: "${juryOrgId}", president_of_jury_id: "${presidentId}") {
              president_of_jury_id {
                _id
                first_name
                last_name
                civility
              }
              dates {
                start_date
                start_hour
                break_time
                break_duration
                number_of_session
                finish_hour
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllGlobalBackupSchedulePresidentJuries']));
  }

  getTitleClassOfJuryOrganization(juryOrgId: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetTitleClassOfJuryOrganization {
            GetOneJuryOrganizationParameter(_id: "${juryOrgId}"){
              _id
              name
              rncp_titles {
                rncp_id {
                  _id
                  short_name
                }
                class_id {
                  _id
                  name
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          _id: juryOrgId,
        },
      })
      .pipe(map((resp) => resp.data['GetOneJuryOrganizationParameter']));
  }

  savePresidentBackupSchedule(global_backup_id, president_of_jury_id, payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
        mutation SaveGlobalBackupSchedulePresidentJury($backup_schedules: [GlobalBackupScheduleListOfDateInput]){
          SaveGlobalBackupSchedulePresidentJury(
            global_backup_id: "${global_backup_id}",
            president_of_jury_id: "${president_of_jury_id}",
            backup_schedules: $backup_schedules
          ) {
            _id
          }
      }
      `,
        variables: {
          backup_schedules: payload,
        },
      })
      .pipe(map((resp) => resp));
  }

  CheckPresidentJuryHaveBackupDate(juryMemberId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query checkPresidentJuryHaveBackupDate {
            CheckPresidentJuryHaveBackupDate(jury_member_id: "${juryMemberId}")
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['CheckPresidentJuryHaveBackupDate']));
  }

  GetAllGlobalBackupScheduleDates(juryId, select_from_current_president_of_jury, studentId, group_id): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllGlobalBackupScheduleDates(
            $jury_id: ID
            $select_from_current_president_of_jury: Boolean
            $student_id: ID
            $group_id: ID
          ) {
            GetAllGlobalBackupScheduleDates(
              jury_id: $jury_id
              select_from_current_president_of_jury: $select_from_current_president_of_jury
              student_id: $student_id
              group_id: $group_id
            ) {
              date
              start_time
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          jury_id: juryId,
          select_from_current_president_of_jury: select_from_current_president_of_jury ? true : false,
          student_id: studentId,
          group_id: group_id,
        },
      })
      .pipe(map((resp) => resp.data['GetAllGlobalBackupScheduleDates']));
  }

  GetAllGlobalBackupScheduleTimes(juryId, date, select_from_current_president_of_jury, studentId, group_id): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllGlobalBackupScheduleTimes(
            $jury_id: ID
            $date: [String]
            $select_from_current_president_of_jury: Boolean
            $student_id: ID
            $group_id: ID
          ) {
            GetAllGlobalBackupScheduleTimes(
              jury_id: $jury_id
              date: $date
              select_from_current_president_of_jury: $select_from_current_president_of_jury
              student_id: $student_id
              group_id: $group_id
            ) {
              start_hour
              finish_hour
              date_test
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          date: date,
          jury_id: juryId,
          select_from_current_president_of_jury: select_from_current_president_of_jury ? true : false,
          student_id: studentId,
          group_id: group_id,
        },
      })
      .pipe(map((resp) => resp.data['GetAllGlobalBackupScheduleTimes']));
  }

  SavePostponeScheduleGlobal(payload): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SavePostponeScheduleGlobal(
            $lang: String
            $jury_id: ID
            $student_id: ID
            $test_group_id: ID
            $jury_member_id: ID
            $test_hours_start: String
            $test_hours_finish: String
            $date_test: String
            $reason: String
          ) {
            SavePostponeScheduleGlobal(
              lang: $lang
              jury_id: $jury_id
              jury_member_id: $jury_member_id
              student_id: $student_id
              test_group_id: $test_group_id
              test_hours_start: $test_hours_start
              test_hours_finish: $test_hours_finish
              date_test: $date_test
              reason: $reason
            ) {
              _id
            }
          }
        `,
        variables: {
          lang: payload && payload.lang ? payload.lang : null,
          jury_id: payload && payload.jury_id ? payload.jury_id : null,
          jury_member_id: payload && payload.jury_member_id ? payload.jury_member_id : null,
          student_id: payload && payload.student_id ? payload.student_id : null,
          test_group_id: payload && payload.test_group_id ? payload.test_group_id : null,
          test_hours_start: payload && payload.test_hours_start ? payload.test_hours_start : null,
          test_hours_finish: payload && payload.test_hours_finish ? payload.test_hours_finish : null,
          date_test: payload && payload.date_test ? payload.date_test : null,
          reason: payload && payload.reason ? payload.reason : null,
        },
      })
      .pipe(map((resp) => resp));
  }

  whatsappButtonClicked(studentId, juryOrgId) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation WhatsappButtonClicked($student_id: ID!, $jury_id: ID!) {
            WhatsappButtonClicked(student_id: $student_id, jury_id: $jury_id)
          }
        `,
        variables: {
          student_id: studentId,
          jury_id: juryOrgId,
        },
      })
      .pipe(map((resp) => resp.data['WhatsappButtonClicked']));
  }

  updateSendRehearsalReminderFlagRehearsal(juryOrgId, studentId): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateSendRehearsalRoomReminderFlag($jury_id: ID, $student_id: ID) {
            UpdateSendRehearsalRoomReminderFlag(jury_id: $jury_id, student_id: $student_id) {
              _id
            }
          }
        `,
        variables: {
          jury_id: juryOrgId,
          student_id: studentId,
        },
      })
      .pipe(map((resp) => resp.data['UpdateSendRehearsalRoomReminderFlag']));
  }

  updateSendRehearsalReminderFlagWhatsapp(juryOrgId, studentId): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateSendRehearsalReminderFlag($jury_id: ID, $student_id: ID) {
            UpdateSendRehearsalReminderFlag(jury_id: $jury_id, student_id: $student_id) {
              _id
            }
          }
        `,
        variables: {
          jury_id: juryOrgId,
          student_id: studentId,
        },
      })
      .pipe(map((resp) => resp.data['UpdateSendRehearsalReminderFlag']));
  }

  saveGoogleMeetURL(jury_member_id, student_id, google_meet_url): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation SaveGoogleMeetURL($jury_member_id: ID, $student_id: ID, $google_meet_url: String) {
            SaveGoogleMeetURL(jury_member_id: $jury_member_id, student_id: $student_id, google_meet_url: $google_meet_url) {
              students {
                google_meet_url
              }
            }
          }
        `,
        variables: {
          jury_member_id: jury_member_id,
          student_id: student_id,
          google_meet_url: google_meet_url,
        },
      })
      .pipe(map((resp) => resp.data['SaveGoogleMeetURL']));
  }
}
