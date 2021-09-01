/* Imports local configuration objects from ./config folder. Make sure tsconfig.json contains the following options:
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "esModuleInterop": true  
  }
}
*/
import firebase from "./config/firebase.json";

// Defines the environment object
export const environment = {

  appname: 'wizdm-places',

  firebase/*: { 
    apiKey: "Your api key",
    authDomain: "domain.firebaseapp.com",
    databaseURL: "https://yourapp.firebaseio.com",
    projectId: "Your project id",
    storageBucket: "yourapp.appspot.com",
    messagingSenderId: "Your sender id"
  }// to get the actual values go: https://console.firebase.google.com */,

  // Enable production mode
  production: true
};