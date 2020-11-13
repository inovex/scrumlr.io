import firebase from 'firebaseSetup';
import {Toast} from 'utils/Toast';

export const AuthenticationManager = {
    signInAnonymously,
};

/**
 * Update a user's profile.
 * 
 * @param displayName Display name of the firebase auth user.
 * @param photoURL Profile photo URL of the firebase auth user.
 */
async function updateProfile(displayName?: string, photoURL?: string) {
    try {
        await firebase.auth().currentUser?.updateProfile({displayName,photoURL});
        Toast.success("Successfully updated profile");
    } catch(err) {
        Toast.error("Your profile name and/or picture could not be updated");
    }    
}

/**
 * Sign in anonymously.
 * 
 * @param displayName Display name of the firebase auth user.
 * @param photoURL Profile photo URL of the firebase auth user.
 * 
 * @returns Promise with user credentials on successful sign in, null otherwise.
 */
async function signInAnonymously(displayName?: string, photoURL?: string) {
    try {
        const firebaseAuthUserCredentials  = await firebase.auth().signInAnonymously();
        await updateProfile(displayName, photoURL);
        firebase.auth().currentUser?.reload();
        Toast.success("Successfully signed in");
        return firebaseAuthUserCredentials;
    } catch(err) {
        Toast.error("There occured a problem while signing in");
        return null;
    }   
}
