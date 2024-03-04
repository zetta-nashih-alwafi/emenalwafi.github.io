import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class ExportDownloaderService {

  constructor(private apollo: Apollo) { }

  checkFileExpirationTokenForExport(fileToken: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query checkFileExpirationTokenForExport($token: String!) {
            CheckFileExpirationToken(token: $token)
          }
        `,
        variables: {
          token: fileToken,
        },
        fetchPolicy: 'network-only',
        errorPolicy: 'all'
      })
      .pipe(map((resp) => resp.data['CheckFileExpirationToken']));
  }
}
