import { getFirebase } from 'react-redux-firebase';

import { AuthProvider, instantiateAuthProviders } from '../../constants/Auth';
import { ImportKeysProps, ImportKeysState } from './ImportKeys';

export function mapStateToProps(
  state: ImportKeysState,
  ownProps: ImportKeysProps
): ImportKeysProps {
  const firebase = getFirebase();

  let uid: string | null = null;
  const auth = firebase.auth();

  if (auth.currentUser) {
    uid = auth.currentUser.uid;
  }

  const onProviderLogin = (provider: AuthProvider) => () => {
    const AUTH_PROVIDERS = instantiateAuthProviders(firebase);

    firebase.auth().signInWithRedirect(AUTH_PROVIDERS[provider]);
  };

  return {
    ...ownProps,
    uid,
    onProviderLogin
  };
}
