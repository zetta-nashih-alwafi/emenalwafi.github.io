import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { BehaviorSubject, Observable } from 'rxjs';
import { SubSink } from 'subsink';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationBarService {
  private subs = new SubSink();

  private notificationCount: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  public notificationCount$ = this.notificationCount.asObservable();

  constructor(private apollo: Apollo) { }

  setNotificationCount(data) {
    if(data?.length) {
      this.notificationCount.next(data[0]?.unread_notification);
    } else {
      this.notificationCount.next(null);
    }
  }

  getAllNotificationForCount() {
    return this.apollo
      .query({
        query: gql`
          query getAllNotificationForCount($pagination: PaginationInput) {
            GetAllLiveNotifications(pagination: $pagination) {
              _id
              unread_notification
              count_document
            }
          }
        `,
        fetchPolicy: 'network-only',
        variables: {
          pagination: { limit: 1, page: 0 },
        }
      })
      .pipe(map((resp) => resp.data['GetAllLiveNotifications']));
  }

  getAllNotificationRelatedToUser(pagination, filter?) {
    return this.apollo
    .query({
      query: gql`
        query getAllNotificationRelatedToUser($pagination: PaginationInput, $filter: LiveNotificationFilterInput) {
          GetAllLiveNotifications(pagination: $pagination, filter: $filter) {
            _id
            unread_notification
            is_read
            is_removed
            comment_id {
              _id
              subject
              candidate_id {
                _id
              }
              created_by {
                _id
                first_name
                last_name
                civility
              }
              reply_for_comment_id {
                _id
              }
            }
            user_id {
              _id
            }
            status
            date_created
            count_document
          }
        }
      `,
      fetchPolicy: 'network-only',
      variables: {
        pagination,
        filter
      }
    })
    .pipe(map((resp) => resp.data['GetAllLiveNotifications']));
  }

  updateLiveNofication(payload, filter) {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateLiveNotification($payload: ID!, $filter: LiveNotificationInput) {
            UpdateLiveNotification(_id: $payload live_notification_input: $filter) {
              _id
            }
          }
        `,
        variables: {
          payload,
          filter,
        }
      })
      .pipe(map((resp) => resp.data['UpdateLiveNotification']));
  }
}
