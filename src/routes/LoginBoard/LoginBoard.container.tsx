import { dataToJS, getFirebase, isLoaded } from 'react-redux-firebase';

import { BoardConfig, BoardUsers, StoreState } from '../../types';
import { LoginBoardProps } from './LoginBoard';
import { AuthProvider, instantiateAuthProviders } from '../../constants/Auth';
import { authController } from '../../controller/auth';

export function mapStateToProps(
  state: StoreState,
  ownProps: LoginBoardProps
): LoginBoardProps {
  const { fbState } = state;
  const firebase = getFirebase();

  let uid: string | null = null;
  const auth = firebase.auth();

  if (auth.currentUser) {
    uid = auth.currentUser.uid;
  }

  const boardUrl = `/boards/${(ownProps.match.params as any).id}`;
  const boardConfig: BoardConfig = dataToJS(fbState, `${boardUrl}/config`, {});

  const users: BoardUsers = isLoaded(boardConfig) ? boardConfig.users : {};

  function onLogin(email: string) {
    if (!uid) {
      authController(firebase).signInAnonymously(email).then(() => {
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
    firebase.auth().signOut().then(() => {
      location.hash = '/new';
    });
  }

  return {
    ...ownProps,
    boards: {},
    uid,
    name: boardConfig.name,
    users,
    onLogin,
    onProviderLogin,
    onLogout
  };
}
