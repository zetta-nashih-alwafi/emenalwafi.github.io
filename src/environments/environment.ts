// The file for the current environment will overwrite this one during build.
// Different environments can be found in ./environment.{dev|prod}.ts, and
// you can create your own and use it with the --env flag.
// The build system defaults to the dev environment.

export const environment = {
  production: false,
  PDF_SERVER_URL: 'https://zetta-pdf.net/',
  apiUrl: 'https://api.sso.zetta-edh-testing.click/graphql',
  fileUrl: 'https://api.kandoo-mgt.pro/fileuploads/',
  apiUrlTask: 'https://task-service.zetta-demo.space/graphql',
  // local storage name to store  the token
  tokenKey: 'admtc-token-encryption',
  // Captcha site key
  // siteKey: '6LcnguwUAAAAAAbUk34XIUgI_vRy9CEhzSa39CqH'
  siteKey: '6Lf_OvQZAAAAAHl8OwsG9XOYjqtTj8gaFsvZ6_3I',
  timezoneDiff: 1,
  ADYEN_API_KEY: 'test_RICBLCIAFNCZPAJGK6V6NO5EQ4EVRZOU',
  studentEnvironment: 'https://student.features.zetta-staging.work/',
  microsoftSSO: 'https://api.sso.zetta-edh-testing.click/auth/microsoft'
};
