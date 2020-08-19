import { getFirebase } from 'react-redux-firebase';

import { AuthProvider, instantiateAuthProviders } from '../../constants/Auth';
import { ImportKeysProps, ImportKeysState } from './ImportKeys';
import firebase = require('firebase');
import GoogleAuthProvider = firebase.auth.GoogleAuthProvider;

export function mapStateToProps(
  state: ImportKeysState,
  ownProps: ImportKeysProps
): ImportKeysProps {
  const firebase = getFirebase();

  let uid: string | null = null;
  let user: { name: string; image: string | undefined } = {
    name: '',
    image: undefined
  };
  const auth = firebase.auth();

  if (auth.currentUser) {
    uid = auth.currentUser.uid;
    user = {
      name: auth.currentUser.displayName || auth.currentUser.email,
      image: auth.currentUser.photoURL
    };
  }

  const onProviderLogin = (provider: AuthProvider) => () => {
    const p = instantiateAuthProviders(firebase)[provider];

    // Give an opportunity to select the google account which was used to create the transfer link
    if (p instanceof GoogleAuthProvider) {
      p.setCustomParameters({ prompt: 'select_account' });
    }

    firebase.auth().signInWithRedirect(p);
  };

  const onLogout = () => {
    firebase.auth().signOut();
  };

  return {
    ...ownProps,
    uid,
    user,
    onLogout,
    onProviderLogin
  };
}
