import { getFirebase } from 'react-redux-firebase';
import firebase from 'firebase';

export const getCurrentUser = () => {
    return getFirebase().auth().currentUser;
};

export const signInAnonymously = (displayName: string) => {
    return getFirebase()
        .auth()
        .signInAnonymously()
        .then((userCredential) => {
            updateProfile({ displayName });
        });
};

export const signInWithProvider = (provider: firebase.auth.AuthProvider) => {
    return getFirebase().auth().signInWithRedirect(provider);
};

export const signOut = () => {
    return getFirebase().auth().signOut();
};

export const updateProfile = (profile: { displayName?: string | null; photoURL?: string | null }) => {
    const currentUser = getFirebase().auth().currentUser;
    if (currentUser) {
        currentUser.updateProfile(profile).then(() => {
            const currentUser = getFirebase().auth().currentUser!;
            getFirebase().firestore().collection('users').doc(currentUser.uid).update(profile);
        });
    }
};
