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
export class DocumentIntakeBuilderService {
  public isDocumentTemplateSaved: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public isTemplatePublish: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public scholarSeasonId: BehaviorSubject<any> = new BehaviorSubject<any>('');

  setDocumentTemplateSaved(value: boolean) {
    this.isDocumentTemplateSaved.next(value);
  }

  setTemplateIsPublished(value: boolean) {
    this.isTemplatePublish.next(value);
  }

  setScholarSeasonId(value: any) {
    this.scholarSeasonId.next(value);
  }

  constructor(public httpClient: HttpClient, private apollo: Apollo, private translate: TranslateService) {}

  //*************** QUERY ******************//
  getAllDocuments(pagination, sortValue, filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllDocumentBuilders($pagination: PaginationInput, $sorting: DocumentBuilderSortingInput) {
          GetAllDocumentBuilders(pagination: $pagination, sorting: $sorting, ${filter}) {
            _id
            scholar_season_id {
              _id
              scholar_season
            }
            document_type
            template_html
            is_published
            preview_pdf_url
            is_published
            creator {
              _id
              first_name
              last_name
              civility
            }
            document_builder_name
            date_created
            count_document
            hide_form
          }
        }
        `,
        variables: {
          pagination,
          sorting: sortValue ? sortValue : {},
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllDocumentBuilders']));
  }

  getAllDocumentsDropdown(filter): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
        query GetAllDocumentBuilders($filter: DocumentBuilderFilterInput) {
          GetAllDocumentBuilders(filter: $filter) {
            _id
            document_type
            is_published
            document_builder_name
            count_document
            hide_form
          }
        }
        `,
        variables: {
          filter: {
            ...filter,
            hide_form: false
          }
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetAllDocumentBuilders']));
  }

  getDocumentBuilderListOfKeys(document_type): Observable<any[]> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetDocumentBuilderListOfKeys($document_type: EnumDocumentBuilderType, $lang: String) {
            GetDocumentBuilderListOfKeys(document_type: $document_type, lang: $lang) {
              key
              description
            }
          }
        `,
        variables: {
          document_type,
          lang: this.translate.currentLang,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetDocumentBuilderListOfKeys']));
  }

  getOneDocumentBuilder(_id): Observable<any> {
    return this.apollo
      .watchQuery<any[]>({
        query: gql`
          query GetOneDocumentBuilder($_id: ID) {
            GetOneDocumentBuilder(_id: $_id) {
              _id
              scholar_season_id {
                _id
                scholar_season
              }
              document_type
              template_html
              is_published
              preview_pdf_url
              is_published
              creator {
                _id
                first_name
                last_name
                civility
              }
              document_builder_name
              date_created
              count_document
            }
          }
        `,
        variables: {
          _id,
        },
        fetchPolicy: 'network-only',
      })
      .valueChanges.pipe(map((resp) => resp.data['GetOneDocumentBuilder']));
  }

  // ***************** MUTATION *********************** //
  DeleteTemplate(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteDocumentBuilder($_id: ID!) {
            DeleteDocumentBuilder(_id: $_id) {
              _id
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['DeleteDocumentBuilder']));
  }

  DuplicateDocumentBuilder(_id, document_builder_name): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DuplicateDocumentBuilder($_id: ID!, $document_builder_name: String) {
            DuplicateDocumentBuilder(_id: $_id, document_builder_name: $document_builder_name) {
              _id
              document_builder_name
              scholar_season_id {
                _id
                scholar_season
              }
            }
          }
        `,
        variables: {
          _id,
          document_builder_name,
        },
      })
      .pipe(map((resp) => resp.data['DuplicateDocumentBuilder']));
  }

  CreateDocumentBuilder(document_builder_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateDocumentBuilder($document_builder_input: DocumentBuilderInput) {
            CreateDocumentBuilder(document_builder_input: $document_builder_input) {
              _id
              document_builder_name
            }
          }
        `,
        variables: {
          document_builder_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateDocumentBuilder']));
  }

  UpdateDocumentBuilder(_id, document_builder_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateDocumentBuilder($_id: ID, $document_builder_input: DocumentBuilderInput) {
            UpdateDocumentBuilder(_id: $_id, document_builder_input: $document_builder_input) {
              _id
              document_builder_name
            }
          }
        `,
        variables: {
          _id,
          document_builder_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateDocumentBuilder']));
  }

  PublishDocumentBuilder(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation PublishDocumentBuilder($_id: ID!) {
            PublishDocumentBuilder(_id: $_id) {
              _id
              document_builder_name
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['PublishDocumentBuilder']));
  }

  UnpublishDocumentBuilder(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UnpublishDocumentBuilder($_id: ID!) {
            UnpublishDocumentBuilder(_id: $_id) {
              _id
              document_builder_name
            }
          }
        `,
        variables: {
          _id,
        },
      })
      .pipe(map((resp) => resp.data['UnpublishDocumentBuilder']));
  }

  GeneratePreviewForDocumentBuilder(_id): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation GeneratePreviewForDocumentBuilder($_id: ID!, $lang: String) {
            GeneratePreviewForDocumentBuilder(_id: $_id, lang: $lang)
          }
        `,
        variables: {
          _id,
          lang: this.translate.currentLang,
        },
      })
      .pipe(map((resp) => resp.data['GeneratePreviewForDocumentBuilder']));
  }

  hideDocumentBuilder(templateId, document_builder_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation hideDocumentBuilder($templateId: ID!, $document_builder_input: DocumentBuilderInput) {
            UpdateDocumentBuilder(_id: $templateId, document_builder_input: $document_builder_input) {
              _id
              hide_form
            }
          }
        `,
        variables: {
          templateId,
          document_builder_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateDocumentBuilder']));
  }
}
