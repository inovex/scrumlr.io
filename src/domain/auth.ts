import { getFirebase } from 'react-redux-firebase';
import firebase from 'firebase';

export const getCurrentUser = () => {
  return getFirebase().auth().currentUser;
};

export const updateProfile = (profile: { displayName?: string | null; photoURL?: string | null }) => {
  const { currentUser } = getFirebase().auth();
  if (currentUser) {
    currentUser.updateProfile(profile).then(() => {
      getFirebase().firestore().collection('users').doc(currentUser.uid).update(profile);
    });
  }
};

export const signInAnonymously = (displayName: string) => {
  return getFirebase()
    .auth()
    .signInAnonymously()
    .then(() => {
      updateProfile({ displayName });
    });
};

export const signInWithProvider = (provider: firebase.auth.AuthProvider) => {
  return getFirebase().auth().signInWithRedirect(provider);
};

export const signOut = () => {
  return getFirebase().auth().signOut();
};
