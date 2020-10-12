import firebase from 'firebaseSetup';

export const AuthenticationManager = {
    signInAnonymously,
};

function updateProfile(displayName?: string, photoURL?: string) {
    firebase.auth().currentUser?.updateProfile({
        displayName,
        photoURL
    });
}

function signInAnonymously(displayName?: string, photoURL?: string) {
    return firebase.auth().signInAnonymously().then(_ => {
        updateProfile(displayName, photoURL);
    }).catch(error => console.log(error));
}
