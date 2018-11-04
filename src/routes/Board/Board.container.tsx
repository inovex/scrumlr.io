import { AnyAction, Dispatch } from 'redux';
import { isLoaded, getVal } from 'react-redux-firebase';
import * as Raven from 'raven-js';
import { debounce } from 'lodash';

import { SETUP_COMPLETED } from '../../actions';
import { BoardProps } from './Board';
import {
  BoardConfig,
  UserInformation,
  FirebaseProp,
  StoreState,
  BoardCards,
  Card,
  Optional,
  PrivateBoardData
} from '../../types';
import { authController } from '../../controller/auth';
import { getGravatar } from '../../controller/gravatar';

export const mapStateToProps = (
  state: StoreState,
  ownProps: BoardProps
): BoardProps => {
  const { app, fbState } = state;
  const firebase = ownProps.firebase as FirebaseProp;

  const boardSelector = `boards/${ownProps.match.params.id}/private`;
  const boardPrintUrl = `/print/${ownProps.match.params.id}`;
  const auth: firebase.User | any = firebase.auth().currentUser || {};

  const board: Optional<PrivateBoardData> = getVal(
    fbState,
    `data/${boardSelector}`,
    undefined
  );
  if (!board) {
    return { boardSelector, boardConfig: undefined, auth } as any;
  }

  const cards: BoardCards = board.cards || {};
  const boardConfig: BoardConfig = board.config;

  const users = isLoaded(board) ? board.users : {};
  const isBoardAdmin = isLoaded(board)
    ? auth.uid === boardConfig.creatorUid
    : false;

  let focusedCard: Optional<Card> = undefined;
  if (boardConfig.focusedCardId) {
    focusedCard = cards[boardConfig.focusedCardId];
  }

  function onToggleShowAuthor() {
    firebase
      .update(`${boardSelector}/config`, {
        showAuthor: !boardConfig.showAuthor
      })
      .catch((err: Error) => {
        Raven.captureMessage('Could not toggle show author state', {
          extra: { reason: err.message, uid: auth.uid, boardId: boardSelector }
        });
      });
  }

  function onToggleReadyState() {
    firebase
      .update(`${boardSelector}/users/${auth.uid}`, {
        ready: !board!!.users[auth.uid].ready
      })
      .catch((err: Error) => {
        Raven.captureMessage('Could not toggle user state', {
          extra: { reason: err.message, uid: auth.uid, boardId: boardSelector }
        });
      });
  }

  function onFocusCard(cardId: string) {
    const { focusedCardId } = boardConfig;
    firebase
      .set(
        `${boardSelector}/config/focusedCardId`,
        focusedCardId !== cardId ? cardId : null
      )
      .catch((err: any) => {
        Raven.captureMessage('Could not focus card', {
          extra: {
            reason: err.message,
            uid: auth.uid,
            boardId: boardSelector,
            focusedCardId
          }
        });
      });
  }

  const username = auth.displayName || undefined;
  const email = auth.email || undefined;
  const isAnonymous = auth.isAnonymous;

  const onChangeEmail = debounce((email: string) => {
    const user = firebase.auth().currentUser;
    if (user) {
      const imageUrl = getGravatar(auth.uid, email);
      user
        .updateProfile({
          displayName: user.displayName,
          photoURL: imageUrl
        })
        .then(() => {
          firebase.update(`${boardSelector}/users/${auth.uid}`, {
            image: imageUrl
          });
        });
    }
  }, 2000);

  const onChangeUsername = debounce((username: string) => {
    const user = firebase.auth().currentUser;
    if (user) {
      user
        .updateProfile({
          displayName: username,
          photoURL: user.photoURL
        })
        .then(() => {
          firebase.update(`${boardSelector}/users/${auth.uid}`, {
            name: username
          });
        });
    }
  }, 2000);

  const onChangeBoardName = debounce((boardName: string) => {
    const { focusedCardId } = boardConfig;
    firebase
      .set(`${boardSelector}/config/name`, boardName)
      .catch((err: any) => {
        Raven.captureMessage('Could not set boardname', {
          extra: {
            reason: err.message,
            uid: auth.uid,
            boardId: boardSelector,
            focusedCardId
          }
        });
      });
  }, 2000);

  function onSwitchPhaseIndex(delta: number) {
    firebase
      .ref(`${boardSelector}/config/guidedPhase`)
      .transaction((phase: number) => phase + delta)
      .catch((err: Error) => {
        Raven.captureMessage('Could not switch phase index', {
          extra: { reason: err.message, uid: auth.uid, boardId: boardSelector }
        });
      });

    Object.keys(board!!.users).forEach(uid => {
      firebase
        .update(`${boardSelector}/users/${uid}`, {
          ready: false
        })
        .catch((err: Error) => {
          Raven.captureMessage('Could reset ready status for users', {
            extra: { reason: err.message, uid, boardId: boardSelector }
          });
        });
    });

    // Always remove card selection if new phase is entered.
    if (boardConfig.focusedCardId) {
      onFocusCard(boardConfig.focusedCardId);
    }
  }

  return {
    ...ownProps,
    cards,
    boardSelector,
    boardConfig,
    boardPrintUrl,
    users,
    focusedCard,
    isBoardAdmin,
    username,
    email,
    isAnonymous,
    uid: auth.uid,
    onToggleReadyState,
    onFocusCard,
    onSwitchPhaseIndex,
    isShowAuthor: Boolean(boardConfig.showAuthor),
    onSignOut: authController(firebase).signOut,
    onChangeBoardName,
    onChangeUsername,
    onChangeEmail,
    onToggleShowAuthor,
    onRegisterCurrentUser: () => null, // will be filled in mergeProps
    ...app,

    // other props, only used in mergeProps
    auth
  };
};

export function mapDispatchToProps(dispatch: Dispatch<AnyAction>) {
  return {
    dispatch
  };
}

export function mergeProps(
  stateProps: BoardProps,
  { dispatch }: { dispatch: Dispatch<any> },
  ownProps: BoardProps
): BoardProps {
  const { auth, boardSelector } = stateProps;
  const { firebase } = ownProps;

  function onRegisterCurrentUser() {
    if (!auth.uid) {
      return;
    }
    const promises: Promise<any>[] = [];

    // FIXME is this needed?
    /*if (!boardConfig || !boardConfig.creatorUid) {
      promises.push(
        firebase
          .set(`${boardSelector}/config/creatorUid`, auth.uid)
          .catch(() => {
            // Nothing to do. An admin has been set already for this board.
          })
      );
    }*/

    const user: UserInformation = {
      name: auth.displayName,
      image: auth.photoURL,
      ready: false
    };
    promises.push(firebase.set(`${boardSelector}/users/${auth.uid}`, user));

    Promise.all(promises)
      .then(() => {
        dispatch({ type: SETUP_COMPLETED });
      })
      .catch((err: PromiseRejectionEvent) => {
        Raven.captureMessage('Could not register current user', {
          extra: { reason: err.reason, uid: auth.uid, boardId: boardSelector }
        });
      });
  }

  return {
    ...ownProps,
    ...stateProps,
    onRegisterCurrentUser
  };
}
