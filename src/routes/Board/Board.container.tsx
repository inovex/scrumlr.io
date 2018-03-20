import { Dispatch } from 'redux';
import { getFirebase, isLoaded, getVal } from 'react-redux-firebase';
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
  Card
} from '../../types';
import md5 = require('blueimp-md5');

export const getImageURL = (uid: string, email?: string) => {
  const mailHash = email ? md5(email) : md5(`${uid}@scrumlr.io`);
  return `https://www.gravatar.com/avatar/${mailHash}?s=32&d=retro`;
};

export const mapStateToProps = (
  state: StoreState,
  ownProps: BoardProps
): BoardProps => {
  const { app, fbState } = state;
  const firebase = ownProps.firebase as FirebaseProp;

  const boardSelector = `boards/${ownProps.match.params.id}`;
  const boardUrl = `/board/${ownProps.match.params.id}`;
  const boardPrintUrl = `/print/${ownProps.match.params.id}`;
  const auth: firebase.User | any = firebase.auth().currentUser || {};
  const cards: BoardCards = getVal(fbState, `data/${boardSelector}/cards`, {});
  const boardConfig: BoardConfig = getVal(
    fbState,
    `data/${boardSelector}/config`,
    {}
  );
  const users = isLoaded(boardConfig) ? boardConfig.users : {};
  const isBoardAdmin =
    auth && isLoaded(boardConfig) ? auth.uid === boardConfig.creatorUid : false;

  let focusedCard: Card | undefined = undefined;
  if (boardConfig.focusedCardId) {
    focusedCard = getVal(
      fbState,
      `data/${boardSelector}/cards/${boardConfig.focusedCardId}`,
      undefined
    );
  }

  function onToggleReadyState() {
    firebase
      .ref(`${boardSelector}/config/users/${auth.uid}`)
      .set({
        ...boardConfig.users[auth.uid],
        ready: !boardConfig.users[auth.uid].ready
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
      .ref(`${boardSelector}/config/focusedCardId`)
      .set(focusedCardId !== cardId ? cardId : null)
      .catch(err => {
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
      const imageUrl = getImageURL(auth.uid, email);
      user
        .updateProfile({
          displayName: user.displayName,
          photoURL: imageUrl
        })
        .then(() => {
          firebase.ref(`${boardSelector}/config/users/${auth.uid}`).update({
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
          firebase.ref(`${boardSelector}/config/users/${auth.uid}`).update({
            name: username
          });
        });
    }
  }, 2000);

  const onChangeBoardName = debounce((boardName: string) => {
    const { focusedCardId } = boardConfig;
    firebase
      .ref(`${boardSelector}/config/name`)
      .set(boardName)
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

    Object.keys(boardConfig.users).forEach(uid => {
      firebase
        .ref(`${boardSelector}/config/users/${uid}`)
        .set({
          ...boardConfig.users[uid],
          ready: false
        })
        .catch((err: Error) => {
          Raven.captureMessage('Could reset ready status for users', {
            extra: { reason: err.message, uid, boardId: boardSelector }
          });
        });
    });

    const phasesWithSortedResults = [2, 3];
    if (phasesWithSortedResults.indexOf(boardConfig.guidedPhase + 1) > -1) {
      if (!boardConfig.sorted) {
        // this.setSorted(true);
      }
    } else {
      if (boardConfig.sorted) {
        // this.setSorted(false);
      }
    }

    // Always remove card selection if new phase is entered.
    if (boardConfig.focusedCardId) {
      onFocusCard(boardConfig.focusedCardId);
    }
  }

  function onSignOut() {
    // Note that the `onSignOut` method given via `ownProps` could be avaiable and should
    // be called in case it is defined as a function. If it is defined, it has been defined
    // in the BoardGuard and passed from there.
    if (typeof ownProps.onSignOut === 'function') {
      ownProps.onSignOut();
    }
    // User is still signed in at this point. Sign out the user and redirect to home page.
    getFirebase()
      .auth()
      .signOut()
      .then(() => {
        location.hash = '/';
      });
  }

  return {
    ...ownProps,
    cards,
    boardSelector,
    boardUrl,
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
    onSignOut,
    onChangeBoardName,
    onChangeUsername,
    onChangeEmail,
    onRegisterCurrentUser: () => null, // will be filled in mergeProps
    ...app,

    // other props, only used in mergeProps
    auth
  };
};

export function mapDispatchToProps(dispatch: Dispatch<any>) {
  return {
    dispatch
  };
}

export function mergeProps(
  stateProps: BoardProps,
  { dispatch }: { dispatch: Dispatch<any> },
  ownProps: BoardProps
): BoardProps {
  const { uid, auth, boardConfig, boardSelector } = stateProps;
  const { firebase } = ownProps;

  function onRegisterCurrentUser() {
    if (!auth.uid) {
      return;
    }
    const promises: Promise<any>[] = [];

    if (!boardConfig || !boardConfig.creatorUid) {
      promises.push(
        firebase
          .ref(`${boardSelector}/config/creatorUid`)
          .set(uid)
          .catch(() => {
            // Nothing to do. An admin has been set already for this board.
          })
      );
    }

    const user: UserInformation = {
      name: auth.displayName,
      image: auth.photoURL,
      ready: false
    };
    promises.push(
      firebase.ref(`${boardSelector}/config/users/${uid}`).set(user)
    );

    Promise.all(promises)
      .then(() => {
        dispatch({ type: SETUP_COMPLETED });
      })
      .catch((err: PromiseRejectionEvent) => {
        Raven.captureMessage('Could not register current user', {
          extra: { reason: err.reason, uid, boardId: boardSelector }
        });
      });
  }

  return {
    ...ownProps,
    ...stateProps,
    onRegisterCurrentUser
  };
}
