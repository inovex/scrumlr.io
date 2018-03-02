import { getVal, getFirebase } from 'react-redux-firebase';
const md5 = require('blueimp-md5');

import { Board, Boards, StoreState } from '../../types';
import { NewBoardProps } from './NewBoard';
import { AuthProvider, instantiateAuthProviders } from '../../constants/Auth';

function initialBoardConfig(creatorUid: string | null): Board {
  return {
    cards: {},
    config: {
      sorted: false,
      users: {},
      creatorUid,
      guided: true,
      guidedPhase: 0,
      created: new Date().toISOString()
    }
  };
}

let onSignIn = false;

export function mapStateToProps(
  state: StoreState,
  ownProps: NewBoardProps
): NewBoardProps {
  const { fbState } = state;
  const firebase = getFirebase();

  let uid: string | null = null;
  const auth = onSignIn ? {} : firebase.auth();

  const boards: Boards = getVal(fbState, 'data/boards', undefined);

  if (auth.currentUser) {
    uid = auth.currentUser.uid;
  }

  function onCreateNewBoard() {
    let creatorUid: string | null = null;
    const auth = getFirebase().auth();
    if (auth.currentUser) {
      creatorUid = auth.currentUser.uid;
    }
    const board: Board = initialBoardConfig(creatorUid);
    getFirebase().ref('/boards').push(board).then((item: any) => {
      const key = item.getKey();
      location.hash = `/board/${key}`;
    });
  }

  function onLogin(email: string) {
    onSignIn = true;

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
        const { state = { referrer: null } } = ownProps.location;
        if (state.referrer) {
          location.assign(state.referrer);
        } else {
          onCreateNewBoard();
        }

        onSignIn = false;
      });
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
    boards,
    uid,
    onCreateNewBoard,
    onLogin,
    onProviderLogin,
    onLogout
  };
}
