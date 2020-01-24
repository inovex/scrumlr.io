import firebase from 'firebase';

const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID;
const config = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: `${projectId}.firebaseapp.com`,
    databaseURL: `https://${projectId}.firebaseio.com`,
    projectId: `${projectId}`
};

if (!firebase.apps.length) {
    firebase.initializeApp(config);
}

export { firebase };
export const auth = firebase.auth();
