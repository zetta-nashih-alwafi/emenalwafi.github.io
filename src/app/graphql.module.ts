import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS, Apollo } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { environment } from 'environments/environment';
import { ApolloLink } from 'apollo-link';
import { onError } from 'apollo-link-error';

const uri = environment.apiUrl; // <-- add the URL of the GraphQL server here
const uriTask = environment.apiUrlTask;

export function createApollo(httpLink: HttpLink) {
  const http = httpLink.create({ uri: uri });

  const authLink = new ApolloLink((operation, forward) => {
    // Get the authentication token from local storage if it exists
    const token = localStorage.getItem(environment.tokenKey);

    // Use the setContext method to set the HTTP headers.
    operation.setContext({
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    });

    // Call the next link in the middleware chain.
    return forward(operation);
  });

  // ******** Handling an error for message if the jwt token got expired or any error about authorization
  const errorLink = onError(({ graphQLErrors, networkError, response }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message}) => {
        if (
          message?.includes('jwt expired') ||
          message?.toLowerCase().includes('jwt') ||
          message?.includes('invalid signature') ||
          message?.includes('str & salt required') ||
          message?.includes('Authorization header is missing') ||
          message?.includes('UnAuthenticated') ||
          message?.includes('salt')
        ) {
          response.errors = [] || null;
          // localStorage.clear();
          localStorage.removeItem('userProfile');
          localStorage.removeItem(environment.tokenKey);
          localStorage.removeItem('permissions');
          localStorage.removeItem('backupUser');
          localStorage.removeItem('backupToken');
          localStorage.removeItem('backupTemplateTable');
          localStorage.removeItem('templateTable');
          window.open(window.location.origin, '_self')
        }
      });
    }
    if (networkError) console.log(`[Network error]: ${networkError}`);
  });

  return {
    link: authLink.concat(errorLink).concat(http),
    cache: new InMemoryCache({
      addTypename: false,
    })
  };
}

// export function createApolloTask(httpLink: HttpLink) {
//   const http = httpLink.create({ uri: uriTask });

//   const authLink = new ApolloLink((operation, forward) => {
//     // Get the authentication token from local storage if it exists
//     const token = localStorage.getItem(environment.tokenKey);

//     // Use the setContext method to set the HTTP headers.
//     operation.setContext({
//       headers: {
//         Authorization: token ? `Bearer ${token}` : ''
//       }
//     });

//     // Call the next link in the middleware chain.
//     return forward(operation);
//   });

//   return {
//     link: authLink.concat(http),
//     cache: new InMemoryCache({
//       addTypename: false
//     })
//   };
// }

@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink]
    },
  ]
})

export class GraphQLModule {
  // private readonly URI1: string = uri;
  // private readonly URI2: string = uriTask;

  // constructor(
  //   apollo: Apollo,
  //   httpLink: HttpLink
  // ) {
  //   const options1: any = { uri: this.URI1 };
  //   apollo.createDefault({
  //     link: httpLink.create(options1),
  //     cache: new InMemoryCache({
  //       addTypename: false
  //     })
  //   });

  //   const options2: any = { uri: this.URI2 };
  //   apollo.createNamed('taskService', {
  //     link: httpLink.create(options2),
  //     cache: new InMemoryCache({
  //       addTypename: false
  //     })
  //   });
  // }
}
