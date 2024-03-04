import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { NgxPermissionsService } from 'ngx-permissions';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
import { TranslateService } from '@ngx-translate/core';
import _ from 'lodash';
import { UtilityService } from 'app/service/utility/utility.service';

export interface NotificationDetail {
  _id: string;
  when: string;
  notification_reference: string;
  module: string;
  context: string;
  signatory: {
    _id: string;
    name: string;
  };
  recipient_to: {
    _id: string;
    name: string;
  };
  triggered: string;
  related_task: string;
  financial_supports_cc: boolean;
  count_document: number;
}

export interface Templates {
  _id: string;
  template_name: string;
  program_seasons: {
    scholar_season: { _id: string; scholar_season: string };
    programs: { _id: string; program: string }[];
  }[];
  is_publish: boolean;
  is_default_template: boolean;
  count_document?: number;
  notification_reference_id?: {
    _id: string;
    notification_reference: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class NotificationManagementService {
  refresh: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private isHasDefaultTemplate: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public isHasDefaultTemplate$ = this.isHasDefaultTemplate.asObservable();

  setHasDefaultTemplate(value) {
    this.isHasDefaultTemplate.next(value);
  }

  triggerRefresh() {
    this.refresh.next(true);
  }

  constructor(private apollo: Apollo, private permissions: NgxPermissionsService, private translate: TranslateService, private utilService: UtilityService,) {}

  getAllNotificationReferencesForTable(
    filter?: { notification_reference: string; module: string },
    pagination?: { limit: number; page: number },
    sort?,
  ): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllNotificationReferences(
            $filter: NotificationReferenceFilter
            $pagination: PaginationInput
            $sort: NotificationReferenceSort
            $selectedLocalization: String
          ) {
            GetAllNotificationReferences(filter: $filter, pagination: $pagination, sort: $sort, selectedLocalization: $selectedLocalization) {
              _id
              when
              notification_reference
              module
              count_document
            }
          }
        `,
        variables: {
          filter: filter ? filter : null,
          pagination: pagination ? pagination : null,
          sort: sort ? sort : null,
          selectedLocalization: this.translate.currentLang,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllNotificationReferences']));
  }

  getOneNotificationReference(_id: string): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
        query GetOneNotificationReference{
          GetOneNotificationReference(_id: "${_id}") {
            _id
            when
            notification_reference
            financial_supports_cc
            module
            context
            signatory {
              _id
              name
            }
            recipient_to {
              _id
              name
            }
            recipient_cc {
              _id
              name
            }
            triggered
            related_task
            count_document
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneNotificationReference']));
  }

  getOneTemplateKey(_id: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneNotificationReference($_id: ID!, $selectedLocalization: String) {
            GetOneNotificationReference(_id: $_id, selectedLocalization: $selectedLocalization) {
              _id
              keys {
                key
                description
                static_value
              }
              key_groups {
                name_group
                _id
                keys {
                  key
                  en_description
                  fr_description
                }
              }
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          _id,
          selectedLocalization: this.translate.currentLang,
        },
      })
      .pipe(map((resp) => resp.data['GetOneNotificationReference']));
  }

  getOneTemplate(_id: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
        query GetOneNotificationTemplate{
          GetOneNotificationTemplate(_id: "${_id}") {
            _id
            notification_reference_id {
              _id
            }
            program_seasons {
              scholar_season {
                _id
                scholar_season
              }
              programs {
                _id
                program
              }
            }
            template_name
            is_default_template
            subject_en
            subject_fr
            en
            fr
            is_publish
            status
            attachments {
              _id
              document_type
              filename
              s3_file_name
              document_builder_id {
                _id
                document_builder_name
              }
            }
            is_attach_file_in_zip
          }
        }
      `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneNotificationTemplate']));
  }

  getAllModulesForDropdown(): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllModules {
            GetAllNotificationReferences {
              module
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllNotificationReferences']));
  }

  getAllReferencesForDropdown(): Observable<any[]> {
    return this.apollo
      .query({
        query: gql`
          query GetAllReferences {
            GetAllNotificationReferences {
              notification_reference
            }
          }
        `,
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllNotificationReferences']));
  }

  getAllNotificationTemplates(
    filter?: { notification_reference_id?: string; is_publish?: boolean; scholar_seasons?: any; programs?: any },
    pagination?: { page: number; limit: number },
    sort?: any,
  ) {
    return this.apollo
      .query({
        query: gql`
          query GetAllNotificationTemplates(
            $pagination: PaginationInput
            $filter: NotificationTemplateFilter
            $sort: NotificationTemplateSort,
            $lang: String
          ) {
            GetAllNotificationTemplates(pagination: $pagination, filter: $filter, sort: $sort, lang: $lang) {
              _id
              template_name
              program_seasons {
                scholar_season {
                  _id
                  scholar_season
                }
                programs {
                  _id
                  program
                }
              }
              is_default_template
              is_publish
              count_document
            }
          }
        `,
        variables: {
          pagination: pagination ? pagination : null,
          filter: filter ? filter : null,
          sort: sort ? sort : null,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllNotificationTemplates']));
  }

  updateNotificationReference(_id: string, notification_reference_input) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateNotificationReference($_id: ID!, $notification_reference_input: NotificationReferenceInput) {
            UpdateNotificationReference(_id: $_id, notification_reference_input: $notification_reference_input) {
              _id
            }
          }
        `,
        variables: {
          _id,
          notification_reference_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateNotificationReference']));
  }

  createNotificationTemplate(notification_template_input): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateNotificationTemplate($notification_template_input: NotificationTemplateInput) {
            CreateNotificationTemplate(notification_template_input: $notification_template_input) {
              _id
            }
          }
        `,
        variables: {
          notification_template_input,
        },
      })
      .pipe(map((resp) => resp.data['CreateNotificationTemplate']));
  }

  deleteNotificationTemplate(_id: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteNotificationTemplate{
            DeleteNotificationTemplate(_id: "${_id}") {
              _id
            }
          }
        `,
      })
      .pipe(map((resp) => resp.data['DeleteNotificationTemplate']));
  }

  sendNotificationPreview(notification_template_id: string): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation ($notification_template_id: ID!, $lang: String) {
            SendNotificationPreview(notification_template_id: $notification_template_id, lang: $lang)
          }
        `,
        variables: {
          notification_template_id,
          lang: localStorage.getItem('currentLang') ? localStorage.getItem('currentLang') : 'fr',
        },
      })
      .pipe(map((resp) => resp.data['DeleteNotificationTemplate']));
  }

  updateNotificationTemplate(_id, notification_template_input: any): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateNotificationTemplate($_id: ID!, $notification_template_input: NotificationTemplateInput) {
            UpdateNotificationTemplate(_id: $_id, notification_template_input: $notification_template_input) {
              _id
              attachments {
                _id
                document_type
                filename
                s3_file_name
                document_builder_id {
                  _id
                  document_builder_name
                }
              }
            }
          }
        `,
        variables: {
          _id,
          notification_template_input,
        },
      })
      .pipe(map((resp) => resp.data['UpdateNotificationTemplate']));
  }

  getAllAttachmentsData(dataSet, pagination, filter, sorting): Observable<any[]> {
    const origin = _.cloneDeep(dataSet);    
    const startIdx = (pagination?.page) * pagination?.limit;
    const endIdx = startIdx + pagination?.limit;

    let mappedData = [];

    if (origin){
      const totalData = origin?.length;
      const updatedData = origin.map(item => {
        const fileExtension = item?.filename?.substring(item?.filename.lastIndexOf('.'));
        return { ...item, file_extension: item?.document_type !== 'document_builder' ? fileExtension : '' };
      });

      // Filter the data
      const tempMappedData = updatedData.filter(data => {
        return (
          (!filter?.filename || this.utilService.simpleDiacriticSensitiveRegex(data?.filename).toLowerCase()?.includes(this.utilService.simpleDiacriticSensitiveRegex(filter?.filename).toLowerCase())) &&
          (!filter?.document_type || filter?.document_type?.includes(data?.document_type)) &&
          (!filter?.file_extension || filter?.file_extension?.includes(data?.file_extension))
        );
      });

      // Sort the data
      if (sorting) {
        const sortKey = Object.keys(sorting)[0];
        if (sortKey) {
          const compareFunction = (a, b) => a[sortKey].localeCompare(b[sortKey]);
      
          if (sorting[sortKey] === 'desc') {
            tempMappedData.sort((a, b) => compareFunction(b, a));
          } else {
            tempMappedData.sort(compareFunction);
          }
        }
      }

      mappedData = tempMappedData.map(item => ({ ...item, count_document: tempMappedData.length })).slice(startIdx, endIdx);
  
    }

    return of(mappedData);
  }
}
