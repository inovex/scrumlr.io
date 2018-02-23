import { dataToJS, getFirebase, isLoaded } from 'react-redux-firebase';
const md5 = require('blueimp-md5');

import { BoardConfig, BoardUsers, StoreState } from '../../types';
import { LoginBoardProps } from './LoginBoard';
import { AuthProvider, instantiateAuthProviders } from '../../constants/Auth';

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
      firebase
        .auth()
        .signInAnonymously()
        .then((auth: firebase.UserInfo) => {
          const mailHash = email ? md5(email) : md5(`${auth.uid}@scrumlr.io`);
          return firebase.auth().currentUser.updateProfile({
            displayName: email,
            photoURL: `https://www.gravatar.com/avatar/${mailHash}?s=32&d=retro`
          });
        })
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
