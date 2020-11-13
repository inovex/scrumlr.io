import firebase from 'firebaseSetup';
import {Toast} from 'utils/Toast';

export const AuthenticationManager = {
    signInAnonymously,
};

async function updateProfile(displayName?: string, photoURL?: string) {
    try {
        await firebase.auth().currentUser?.updateProfile({displayName,photoURL});
        Toast.success("Successfully updated profile");
    } catch(err) {
        Toast.error("Your profile name and/or picture could not be updated");
    }    
}

async function signInAnonymously(displayName?: string, photoURL?: string) {
    try {
        await firebase.auth().signInAnonymously();
        updateProfile(displayName, photoURL);
        Toast.success("Successfully signed in");
    } catch(err) {
        Toast.error("There occured a problem while signing in");
    }   
}
