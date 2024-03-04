import { Apollo } from 'apollo-angular';
import { Injectable } from '@angular/core';
import gql from 'graphql-tag';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NewsService {
  public userNewsConfigSubject = new BehaviorSubject<any>(null);
  userNewsConfig$: Observable<any> = this.userNewsConfigSubject.asObservable();

  public userNewsDataSubject = new BehaviorSubject<any>(null);
  userNewsDataConfig$: Observable<any> = this.userNewsDataSubject.asObservable();

  private resetFormSubject = new BehaviorSubject<boolean>(null);
  resetForm$ = this.resetFormSubject.asObservable();

  private newsIdSubject = new BehaviorSubject<any>({});
  newsId$ = this.newsIdSubject.asObservable();

  private comparisonForm = new BehaviorSubject<any>({});
  comparisonForm$ = this.comparisonForm.asObservable();

  constructor(private apollo: Apollo) {}

  setComparisonForm(isSame: boolean) {
    this.comparisonForm.next(isSame);
  }

  getCurrentFormStatus() {
    return this.comparisonForm.getValue();
  }

  getCurrentIdSubject() {
    return this.newsIdSubject.getValue();
  }

  // Method to update the user news configuration
  updateUserNewsConfig(config: any) {
    this.userNewsConfigSubject.next(config);
  }

  updateUserNewsDataConfig(config: any) {
    const currData = this.userNewsDataSubject.value;

    // Check if currData is iterable (e.g., an array)
    if (Array.isArray(currData)) {
      const updatedData = [config, ...currData];
      this.userNewsDataSubject.next(updatedData);
    } else {
      // Handle the case where currData is not iterable
      console.error('currData is not iterable:', currData);
      this.userNewsDataSubject.next('');
      // You may choose to handle this error in a way that makes sense for your application
    }
  }

  triggerFormReset(resp) {
    this.resetFormSubject.next(resp);
  }

  updateNewsId(id) {
    this.newsIdSubject.next(id);
  }

  getOneNews(newsId): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetOneNews($_id: ID!) {
            GetOneNews(_id: $_id) {
              _id
              title
              description
              published_date {
                time
                date
              }
              created_by {
                _id
                first_name
                last_name
                civility
              }
              is_published
              total_like
              is_current_user_like_the_news
            }
          }
        `,
        variables: {
          _id: newsId,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetOneNews']));
  }

  getAllNews(pagination, filter, sort): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query GetAllNews($pagination: PaginationInput, $filter: NewsFilterInput, $sort: NewsSortingInput) {
            GetAllNews(pagination: $pagination, filter: $filter, sorting: $sort) {
              _id
              title
              description
              is_published
              created_by {
                _id
                first_name
                last_name
                civility
              }
              published_date {
                date
                time
              }
              count_document
            }
          }
        `,
        variables: {
          pagination: pagination,
          filter: filter,
          sort: sort,
        },
        fetchPolicy: 'network-only',
      })
      .pipe(map((resp) => resp.data['GetAllNews']));
  }

  createNews(newsInput): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation CreateNews($inputValue: NewsInput) {
            CreateNews(news_input: $inputValue) {
              _id
              title
              description
              is_published
              created_by {
                _id
                first_name
                last_name
                civility
              }
            }
          }
        `,
        variables: {
          inputValue: newsInput,
        },
      })
      .pipe(map((dataCreateNews) => dataCreateNews.data['CreateNews']));
  }

  updateNews(_id, newsInput): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UpdateNews($_id: ID!, $news_input: NewsInput) {
            UpdateNews(_id: $_id, news_input: $news_input) {
              _id
              title
              description
              is_published
            }
          }
        `,
        variables: {
          _id: _id,
          news_input: newsInput,
        },
      })
      .pipe(map((dataCreateNews) => dataCreateNews.data['UpdateNews']));
  }

  publishNews(newsId): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation PublishNews($_id: ID!) {
            PublishNews(_id: $_id) {
              _id
              is_published
            }
          }
        `,
        variables: {
          _id: newsId,
        },
      })
      .pipe(map((dataCreateNews) => dataCreateNews.data['PublishNews']));
  }

  unPublishNews(newsId): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation UnpublishNews($_id: ID!) {
            UnpublishNews(_id: $_id) {
              _id
              title
            }
          }
        `,
        variables: {
          _id: newsId,
        },
      })
      .pipe(map((dataCreateNews) => dataCreateNews.data['UnpublishNews']));
  }

  deleteNews(newsId): Observable<any> {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation DeleteNews($_id: ID!) {
            DeleteNews(_id: $_id) {
              _id
              title
            }
          }
        `,
        variables: {
          _id: newsId,
        },
      })
      .pipe(map((dataCreateNews) => dataCreateNews.data['DeleteNews']));
  }

  getAllNewsDiscussion(pagination, filter){
    return this.apollo.query({
      query: gql `
        query GetAllNewsDiscussion($pagination: PaginationInput, $filter: NewsDiscussionFilterInput){
          GetAllNewsDiscussion(pagination: $pagination, filter: $filter){
            _id
            comment
            created_by{
              first_name
              last_name
              civility
              profile_picture
            }
            news_id{
              _id
            }
            created_at
            count_document
          }
        }
      `, variables:{
          pagination : pagination,
          filter: filter
        },
        fetchPolicy: 'network-only',
    }).pipe(map((dataCreateNews) => dataCreateNews.data['GetAllNewsDiscussion']));
  }

  createNewsDiscussion(news_discussion_input){
    return this.apollo.mutate({
      mutation: gql `
        mutation CreateNewsDiscussion($news_discussion_input: NewsDiscussionInput){
          CreateNewsDiscussion(news_discussion_input: $news_discussion_input){
            _id
          }
        }
      `, variables:{
        news_discussion_input : news_discussion_input,
      },
    }).pipe(map((CreateNewsDiscussion) => CreateNewsDiscussion.data['CreateNewsDiscussion']));
  }

  likeNews(id){
    return this.apollo.mutate({
      mutation: gql `
        mutation LikeNews($_id:ID!){
          LikeNews(_id:$_id){
            title
          }
        }
      `, variables:{
        _id : id,
      },
    }).pipe(map((LikeNews) => LikeNews.data['LikeNews']));
  }

  unLikeNews(id){
    return this.apollo.mutate({
      mutation: gql `
      mutation UnlikeNews($_id:ID!){
        UnlikeNews(_id:$_id){
          title
        }
      }
      `, variables:{
        _id : id,
      },
    }).pipe(map((UnlikeNews) => UnlikeNews.data['UnlikeNews']));
  }

  GetAllNews = gql`
    query GetAllNews($pagination: PaginationInput, $filter: NewsFilterInput, $sort: NewsSortingInput) {
      GetAllNews(pagination: $pagination, filter: $filter, sorting: $sort) {
        _id
        title
        description
        is_published
        created_by {
          _id
          first_name
          last_name
          civility
        }
        published_date {
          date
          time
        }
        count_document
      }
    }
  `;

  GetOneNews = gql`
    query GetOneNews($_id: ID!) {
      GetOneNews(_id: $_id) {
        _id
        title
        description
        published_date {
          time
          date
        }
        created_by {
          _id
          first_name
          last_name
          civility
        }
        total_like
        is_current_user_like_the_news
      }
    }
  `;
}
