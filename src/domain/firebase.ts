import firebase from 'firebase';

const projectId = 'playground-73a29';
const config = {
    apiKey: 'AIzaSyAJj_W-oo-G9k4EU4SImBICuQlMWjRwxOA',
    authDomain: `${projectId}.firebaseapp.com`,
    databaseURL: `https://${projectId}.firebaseio.com`,
    projectId: `${projectId}`
};

if (!firebase.apps.length) {
    firebase.initializeApp(config);
}

export { firebase };
export const auth = firebase.auth();
