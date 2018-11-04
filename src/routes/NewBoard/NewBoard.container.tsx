import { getVal, getFirebase } from 'react-redux-firebase';

import { Board, Boards, StoreState } from '../../types';
import { OwnNewBoardProps, StateNewBoardProps } from './NewBoard';
import { AuthProvider, instantiateAuthProviders } from '../../constants/Auth';
import { authController } from '../../controller/auth';
import { RetroMode } from '../../constants/mode';
import * as firebase from 'firebase/app';
import { generateKeypair } from '../../util/encrypt';

function initialBoardConfig(
  user: firebase.User,
  mode: RetroMode,
  secure: boolean = false
): Board {
  let publicKey: string | null = null;
  let privateKey: string | null = null;
  if (secure) {
    const keypair = generateKeypair();
    publicKey = keypair.publicKey;
    privateKey = keypair.privateKey || null;
  }

  return {
    public: {
      config: {
        secure,
        key: publicKey
      }
    },
    private: {
      config: {
        key: privateKey,
        sorted: false,
        users: {},
        creatorUid: user.uid,
        guided: true,
        guidedPhase: 0,
        created: new Date().toISOString(),
        showAuthor: false,
        mode
      },
      cards: {},
      users: {
        [user.uid]: {
          name: user.displayName || '',
          image: user.photoURL || '',
          ready: false
        }
      },
      presence: {}
    }
  };
}

let onSignIn = false;

export function mapStateToProps(
  state: StoreState,
  ownProps: OwnNewBoardProps
): StateNewBoardProps {
  const { fbState } = state;
  const firebase = getFirebase();

  let uid: string | null = null;
  const auth = onSignIn ? {} : firebase.auth();

  const boards: Boards = getVal(fbState, 'data/boards', undefined);

  if (auth.currentUser) {
    uid = auth.currentUser.uid;
  }

  function onCreateNewBoard(mode: RetroMode) {
    const auth = getFirebase().auth();
    const board: Board = initialBoardConfig(auth.currentUser!!, mode);
    getFirebase()
      .ref('/boards')
      .push(board)
      .then((item: any) => {
        const key = item.getKey();
        location.hash = `/board/${key}`;
      });
  }

  function onLogin(email: string, mode: RetroMode) {
    onSignIn = true;

    authController(firebase)
      .signInAnonymously(email)
      .then(() => {
        const { state = { referrer: null } } = ownProps.location;
        if (state.referrer) {
          location.assign(state.referrer);
        } else {
          onCreateNewBoard(mode);
        }

        onSignIn = false;
      });
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
    boards,
    uid,
    onCreateNewBoard,
    onLogin,
    onProviderLogin,
    onLogout
  };
}
