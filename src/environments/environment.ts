// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  firebase: {
    projectId: 'ivg-latam',
    appId: '1:415708052404:web:fdc0a610e04544e78dd0e1',
    storageBucket: 'ivg-latam.appspot.com',
    locationId: 'us-central',
    apiKey: 'AIzaSyDGLJReof-poeiLblZdefDTsYOg2s7GfOY',
    authDomain: 'ivg-latam.firebaseapp.com',
    messagingSenderId: '415708052404',
    measurementId: 'G-E2CMJD9NF8',
  },

  API_URL: "http://localhost:3000/api/v1/",
  production: false
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
