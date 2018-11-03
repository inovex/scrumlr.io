import { getVal, getFirebase } from 'react-redux-firebase';

import { Board, Boards, StoreState } from '../../types';
import { OwnNewBoardProps, StateNewBoardProps } from './NewBoard';
import { AuthProvider, instantiateAuthProviders } from '../../constants/Auth';
import { authController } from '../../controller/auth';
import { RetroMode } from '../../constants/mode';

function initialBoardConfig(creatorUid: string | null, mode: RetroMode): Board {
  return {
    cards: {},
    config: {
      sorted: false,
      users: {},
      creatorUid,
      guided: true,
      guidedPhase: 0,
      created: new Date().toISOString(),
      showAuthor: false,
      mode
    },
    public: {
      secure: false
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
    let creatorUid: string | null = null;
    const auth = getFirebase().auth();
    if (auth.currentUser) {
      creatorUid = auth.currentUser.uid;
    }
    const board: Board = initialBoardConfig(creatorUid, mode);
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
