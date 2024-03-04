import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cacheable } from 'ngx-cacheable';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { map } from 'rxjs/operators';
import { NotificationHistory } from 'app/models/notification-history.model';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  constructor(private httpClient: HttpClient, private apollo: Apollo) {}

  getNotificationHistories(pagination, sortValue, filter): Observable<NotificationHistory[]> {
    return this.apollo.query({
      query: gql`
      query GetAllNotificationHistories(
        $page: PaginationInput, 
        $sort: NotificationHistorySorting,
        $sent_date: String,
        $sent_time: String,
        $notif_ref: String,
        $notif_sub: String,
        $program_ids: [ID],
        $from_user: String,
        $to_user: String,
        $notification_history_date: NotifHistoryDate,
        $offset: Int
        ) {
        GetAllNotificationHistories(
          pagination: $page,
          sorting: $sort,
          sent_date: $sent_date,
          sent_time: $sent_time,
          notif_ref: $notif_ref,
          notif_sub: $notif_sub,
          program_ids: $program_ids,
          from_user: $from_user,
          to_user: $to_user,
          notification_history_date: $notification_history_date,
          offset: $offset
        ) {
          count_document
          _id
          sent_date {
            date_utc
            time_utc
          }
          notification_reference
          notification_subject
          notification_message
          program {
            _id
            program
          }
          from {
            last_name
            first_name
            civility
          }
          to {
            last_name
            first_name
            civility
          }
          subject {
            subject_name
          }
          test {
            name
          }
          recipient_email
          recipient_civility
          recipient_first_name
          recipient_last_name
        }
      }
      `,
      variables: {
        page: pagination,
        sort: sortValue ? sortValue : {},
        sent_date: filter.sent_date ? filter.sent_date : null,
        sent_time: filter.sent_time ? filter.sent_time : null,
        notif_ref: filter.notif_ref ? filter.notif_ref : null,
        notif_sub: filter.notif_sub ? filter.notif_sub : null,
        program_ids: filter.program_ids ? filter.program_ids : null,
        from_user: filter.from_user ? filter.from_user : null,
        to_user: filter.to_user ? filter.to_user : null,
        notification_history_date: filter.notification_history_date,
        offset: filter.offset
      },
      fetchPolicy: 'network-only'
    })
    .pipe(map((resp) => resp.data['GetAllNotificationHistories']));
  }

  GetNotificationReferences(): Observable<string[]> {
    return this.apollo.query({
      query: gql`
      query GetNotificationReferences{
        GetNotificationReferences
      }
      `,
      fetchPolicy: 'network-only'
    })
    .pipe(map((resp) => resp.data['GetNotificationReferences']));
  }

  @Cacheable()
  getHistory(): Observable<any[]> {
    return this.httpClient.get<any[]>('assets/data/history.json');
  }

}
