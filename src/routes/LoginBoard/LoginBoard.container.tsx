import { getFirebase } from 'react-redux-firebase';

import { StoreState } from '../../types';
import { LoginBoardProps } from './LoginBoard';
import { AuthProvider, instantiateAuthProviders } from '../../constants/Auth';
import { authController } from '../../controller/auth';

export function mapStateToProps(
  state: StoreState,
  ownProps: LoginBoardProps
): LoginBoardProps {
  const firebase = getFirebase();

  let uid: string | null = null;
  const auth = firebase.auth();

  if (auth.currentUser) {
    uid = auth.currentUser.uid;
  }

  function onLogin(email: string) {
    if (!uid) {
      authController(firebase)
        .signInAnonymously(email)
        .then(() => {
          location.assign(`/#/board/${(ownProps.match.params as any).id}`);
        });
    } else {
      location.assign(`/#/board/${(ownProps.match.params as any).id}`);
    }
  }

  const onProviderLogin = (provider: AuthProvider) => () => {
    const AUTH_PROVIDERS = instantiateAuthProviders(firebase);

    firebase.auth().signInWithRedirect(AUTH_PROVIDERS[provider]);
  };

  function onLogout() {
    firebase
      .auth()
      .signOut()
      .then(() => {
        location.hash = '/new';
      });
  }

  return {
    ...ownProps,
    uid,
    onLogin,
    onProviderLogin,
    onLogout
  };
}
