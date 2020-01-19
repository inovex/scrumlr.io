import firebase from 'firebase';

const config = {
    apiKey: 'AIzaSyAJj_W-oo-G9k4EU4SImBICuQlMWjRwxOA',
    authDomain: 'playground-73a29.firebaseapp.com',
    databaseURL: 'https://playground-73a29.firebaseio.com',
    projectId: 'playground-73a29'
};

if (!firebase.apps.length) {
    firebase.initializeApp(config);
}

export { firebase };
export const auth = firebase.auth();
