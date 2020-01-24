import firebase from 'firebase';

const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;
const config = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: `${projectId}.firebaseapp.com`,
    databaseURL: `https://${projectId}.firebaseio.com`,
    projectId: `${projectId}`,
    storageBucket: `${projectId}.appspot.com`,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

if (!firebase.apps.length) {
    firebase.initializeApp(config);
    firebase.analytics();
    firebase.analytics().setAnalyticsCollectionEnabled(false);
}

export { firebase };
export const auth = firebase.auth();
export const analytics = firebase.analytics();
