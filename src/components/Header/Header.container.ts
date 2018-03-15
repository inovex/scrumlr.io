import { BoardConfig, StoreState, BoardUsers } from '../../types';
import { getVal, getFirebase, helpers } from 'react-redux-firebase';
import { OwnHeaderProps, StateHeaderProps } from './Header';
import isLoaded = helpers.isLoaded;
import * as Raven from 'raven-js';
import { debounce } from 'lodash';

export const mapStateToProps = (
  state: StoreState,
  ownProps: OwnHeaderProps
): StateHeaderProps => {
  const { fbState } = state;
  const firebase = getFirebase();

  const boardUrl = ownProps.boardId;
  const auth = getVal(fbState, 'auth', {});
  const boardConfig: BoardConfig = getVal(
    fbState,
    `data/${boardUrl}/config`,
    {}
  );
  const presence: { [key: string]: boolean } = getVal(
    fbState,
    `data/presence`,
    {}
  );
  // Get a list of all users that have been interacted with this board.
  const users = isLoaded(boardConfig) ? boardConfig.users : {};

  // Not all users must be neccessarily online right know. Determine which users
  // are online and remove those users that are not connected right now.
  const userIds = users ? Object.keys(users) : [];
  let activeUsers: BoardUsers = userIds
    .filter(id => Object.prototype.hasOwnProperty.call(presence, id))
    .reduce((acc, id) => {
      acc[id] = users[id];
      return acc;
    }, {});

  const isBoardAdmin =
    auth && isLoaded(boardConfig) ? auth.uid === boardConfig.creatorUid : false;

  function onToggleReadyState() {
    firebase
      .ref(`${boardUrl}/config/users/${auth.uid}`)
      .set({
        ...boardConfig.users[auth.uid],
        ready: !boardConfig.users[auth.uid].ready
      })
      .catch((err: Error) => {
        Raven.captureMessage('Could not toggle user state', {
          extra: { reason: err.message, uid: auth.uid, boardId: boardUrl }
        });
      });
  }

  function onFocusCard(cardId: string) {
    const { focusedCardId } = boardConfig;
    firebase
      .ref(`${boardUrl}/config/focusedCardId`)
      .set(focusedCardId !== cardId ? cardId : null)
      .catch((err: any) => {
        Raven.captureMessage('Could not focus card', {
          extra: {
            reason: err.message,
            uid: auth.uid,
            boardId: boardUrl,
            focusedCardId
          }
        });
      });
  }

  function onDeleteBoard() {
    firebase
      .ref(`${boardUrl}`)
      .remove()
      .then(() => {
        location.hash = '/';
      })
      .catch((err: Error) => {
        Raven.captureMessage('Could not delete board', {
          extra: { reason: err.message, uid: auth.uid, boardId: boardUrl }
        });
      });
  }

  function onSwitchPhaseIndex(delta: number) {
    firebase
      .ref(`${boardUrl}/config/guidedPhase`)
      .transaction((phase: number) => phase + delta)
      .catch((err: Error) => {
        Raven.captureMessage('Could not switch phase index', {
          extra: { reason: err.message, uid: auth.uid, boardId: boardUrl }
        });
      });

    Object.keys(boardConfig.users).forEach(uid => {
      firebase
        .ref(`${boardUrl}/config/users/${uid}`)
        .set({
          ...boardConfig.users[uid],
          ready: false
        })
        .catch((err: Error) => {
          Raven.captureMessage('Could reset ready status for users', {
            extra: { reason: err.message, uid, boardId: boardUrl }
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

  const onChangeBoardName = debounce((boardName: string) => {
    const { focusedCardId } = boardConfig;
    firebase
      .ref(`${boardUrl}/config/name`)
      .set(boardName)
      .catch((err: any) => {
        Raven.captureMessage('Could not set boardname', {
          extra: {
            reason: err.message,
            uid: auth.uid,
            boardId: boardUrl,
            focusedCardId
          }
        });
      });
  }, 2000);

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

  const onPrevPhase = () => {
    onSwitchPhaseIndex(-1);
  };
  const onNextPhase = () => {
    onSwitchPhaseIndex(1);
  };

  return {
    admin: isBoardAdmin,
    boardName: boardConfig.name,
    mode: boardConfig.mode,
    phase: boardConfig.guidedPhase,
    sorted: boardConfig.sorted,
    onPrevPhase,
    onNextPhase,
    user: auth ? auth.uid : null,
    users: activeUsers,
    onToggleReadyState,
    onChangeBoardName,
    loggedIn: Boolean(firebase.auth()),
    onDeleteBoard,
    onSignOut
  };
};
