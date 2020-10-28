import firebase from 'firebaseSetup';

export const AuthenticationManager = {
    signInAnonymously,
};

function updateProfile(displayName?: string, photoURL?: string) {
    firebase.auth().currentUser?.updateProfile({
        displayName,
        photoURL
    });

    //TODO: Add Toast to display Success/Error Messages
}

async function signInAnonymously(displayName?: string, photoURL?: string) {
    await firebase.auth().signInAnonymously();
    updateProfile(displayName, photoURL);

    //TODO: Add Toast to display Success/Error Messages
}
