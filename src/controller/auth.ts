//import { getGravatar } from './gravatar';
import { FirebaseProp } from '../types';

export const authController = (firebase: FirebaseProp) => ({
  signInAnonymously: (email: string) => {
    return firebase
      .auth()
      .signInAnonymously()
      .then((auth: firebase.auth.UserCredential) => {
        return (firebase.auth().currentUser as firebase.User).updateProfile({
          displayName: email,
          photoURL: null
        });
      });
  },
  signOut: () => {
    // User is still signed in at this point. Sign out the user and redirect to home page.
    //const { uid } = firebase.auth().currentUser as firebase.User;
    //firebase.remove(`/presence/${uid}`).then(() => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        location.hash = '/';
      });
    //});
  }
});
