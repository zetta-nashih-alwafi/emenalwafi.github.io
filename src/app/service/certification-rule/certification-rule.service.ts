import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CertificationRuleService {
  private isSaved = new BehaviorSubject<Boolean>(false);
  private isChanged = new BehaviorSubject<Boolean>(false);

  setDataCertificationStatus(isSave: Boolean) {
    this.isSaved.next(isSave);
  }

  getDataCertificationStatus() {
    return this.isSaved.value;
  }
  setDataCertificationChanged(isChange: Boolean) {
    this.isChanged.next(isChange);
  }

  getDataCertificationChanged() {
    return this.isChanged.value;
  }
  constructor(
    private apollo: Apollo
  ) { }

  getCertificationRule(titleId: string, classId: string): Observable<any> {
    return this.apollo.query({
      query: gql`
        query GetOneCertificationRule{
          GetOneCertificationRule(rncp_id: "${titleId}", class_id: "${classId}") {
            _id
            title
            message
            documents {
              s3_file_name
              document_name
              file_path
              document_id {
                _id
              }
            }
          }
        }
      `,
      fetchPolicy: 'network-only'
    })
    .pipe(map(resp => resp.data['GetOneCertificationRule']))
  }

  getCertificationRuleSent(titleId: string, classId: string): Observable<any> {
    return this.apollo.query({
      query: gql`
        query {
          GetOneCertificationRuleSent(rncp_id: "${titleId}", class_id: "${classId}") {
            _id
            title
            message
            documents {
              s3_file_name
              document_name
              file_path
              document_id {
                _id
              }
            }
            students_accepted {
              student_id {
                _id
              }
              acceptance_date {
                date_utc
                time_utc
              }
            }
          }
        }
      `,
      fetchPolicy: 'network-only'
    })
    .pipe(map(resp => resp.data['GetOneCertificationRuleSent']))
  }

  getCertificationRuleSentWithStudent(titleId: string, classId: string, studentId: string): Observable<any> {
    return this.apollo.query({
      query: gql`
        query {
          GetOneCertificationRuleSent(rncp_id: "${titleId}", class_id: "${classId}", user_id: "${studentId}") {
            _id
            title
            message
            documents {
              s3_file_name
              document_name
              file_path
              document_id {
                _id
              }
            }
          }
        }
      `,
      fetchPolicy: 'network-only'
    })
    .pipe(map(resp => resp.data['GetOneCertificationRuleSent']))
  }

  getAllCertificationRule(): Observable<any> {
    return this.apollo.query({
      query: gql`
        query {
          GetAllCertificationRule() {
            _id
            title
            message
            documents {
              file_name
              file_path
            }
          }
        }
      `,
      fetchPolicy: 'network-only'
    })
    .pipe(map(resp => resp.data['GetOneCertificationRule']))
  }

  createCertificationRuleSent(certRule: any): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation SentCertificationRule($dataInput: CertificationRuleSentInput) {
          SentCertificationRule(certification_rule_sent_input: $dataInput) {
            _id
          }
        }
      `,
      variables: {dataInput: certRule}
    })
    .pipe(map(resp => resp.data['SentCertificationRule']))
  }

  downloadDocumentAsZipFile(rncpId: string, classId: string): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
      mutation {
        DownloadDocumentAsZipFile (rncpId: "${rncpId}", classId: "${classId}") {
          pathName
        }
      }
      `,
    })
    .pipe(map(resp => resp.data['DownloadDocumentAsZipFile']))
  }

  studentAcceptCertificationRule(rncp_id: any, class_id: any, user_id: any): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation {
          StudentAcceptanceCertificationRule(rncp_id: "${rncp_id}", class_id: "${class_id}", user_id: "${user_id}") {
            _id
            students_accepted {
              student_id {
                _id
              }
              acceptance_date {
                date_utc
                time_utc
              }
            }
          }
        }
      `,
    })
    .pipe(map(resp => resp.data['StudentAcceptanceCertificationRule']))
  }

  createCertificationRule(certRule: any): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation CreateCertificationRule($dataInput: CertificationRuleInput) {
          CreateCertificationRule(certification_rule_input: $dataInput) {
            _id
          }
        }
      `,
      variables: {dataInput: certRule}
    })
    .pipe(map(resp => resp.data['CreateCertificationRule']))
  }

  updateCertificationRule(certId: string, certRule: any): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`
        mutation UpdateCertificationRule($id: ID!, $dataInput: CertificationRuleInput) {
          UpdateCertificationRule(_id: $id, certification_rule_input: $dataInput) {
            _id
          }
        }
      `,
      variables: {
        id: certId,
        dataInput: certRule
      }
    })
    .pipe(map(resp => resp.data['UpdateCertificationRule']))
  }
}
