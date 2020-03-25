import { StoreState, BoardUsers, PrivateBoardData } from '../../types';
import { getVal, getFirebase, helpers } from 'react-redux-firebase';
import { OwnHeaderProps, StateHeaderProps } from './Header';
import isLoaded = helpers.isLoaded;
import * as Raven from 'raven-js';
import { debounce } from 'lodash';
import { getPhasesCount } from '../../constants/Retrospective';

export const mapStateToProps = (
  state: StoreState,
  ownProps: OwnHeaderProps
): StateHeaderProps => {
  const { fbState } = state;
  const firebase = getFirebase();

  const boardUrl = ownProps.boardId;
  const auth = getVal(fbState, 'auth', {});

  const boardConfig: PrivateBoardData = getVal(fbState, `data/${boardUrl}`, {});
  const presence: { [key: string]: boolean } = getVal(
    fbState,
    `data/${boardUrl}/presence`,
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
    auth && isLoaded(boardConfig)
      ? auth.uid === boardConfig.config.creatorUid
      : false;

  function onToggleReadyState() {
    firebase
      .ref(`${boardUrl}/users/${auth.uid}`)
      .update({
        ready: !boardConfig.users[auth.uid].ready
      })
      .catch((err: Error) => {
        Raven.captureMessage('Could not toggle user state', {
          extra: { reason: err.message, uid: auth.uid, boardId: boardUrl }
        });
      });
  }

  function onFocusCard(cardId: string) {
    const { focusedCardId } = boardConfig.config;
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

    firebase.ref(`${boardUrl}/config/timerExpiration`).set(null);

    const updateUsers = {};
    Object.keys(boardConfig.users).forEach(uid => {
      updateUsers[`${uid}/ready`] = false;
    });

    console.log(updateUsers);
    firebase
      .ref(`${boardUrl}/users`)
      .update(updateUsers)
      .catch((err: Error) => {
        Raven.captureMessage('Could reset ready status for users', {
          extra: { reason: err.message, boardId: boardUrl }
        });
      });

    const phasesWithSortedResults = [2, 3];
    if (
      phasesWithSortedResults.indexOf(boardConfig.config.guidedPhase + 1) > -1
    ) {
      if (!boardConfig.config.sorted) {
        // this.setSorted(true);
      }
    } else {
      if (boardConfig.config.sorted) {
        // this.setSorted(false);
      }
    }

    // Always remove card selection if new phase is entered.
    if (boardConfig.config.focusedCardId) {
      onFocusCard(boardConfig.config.focusedCardId);
    }
  }

  const onChangeBoardName = debounce((boardName: string) => {
    const { focusedCardId } = boardConfig.config;
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

  const onSetTimer = (seconds: number) => {
    firebase
      .ref(`${boardUrl}/config/timerExpiration`)
      .set(new Date(new Date().getTime() + seconds * 1000).toUTCString())
      .catch((err: any) => {
        Raven.captureMessage('Could not set timer', {
          extra: {
            reason: err.message,
            uid: auth.uid,
            boardId: boardUrl,
            seconds
          }
        });
      });
  };

  const onPrevPhase = () => {
    onSwitchPhaseIndex(-1);
  };
  const onNextPhase = () => {
    onSwitchPhaseIndex(1);
  };

  const isLastPhase =
    boardConfig.config.guidedPhase ===
    getPhasesCount(boardConfig.config.mode) - 1;

  return {
    admin: isBoardAdmin,
    boardName: boardConfig.config.name,
    mode: boardConfig.config.mode,
    phase: boardConfig.config.guidedPhase,
    isLastPhase,
    sorted: boardConfig.config.sorted,
    onPrevPhase,
    onNextPhase,
    onSetTimer,
    user: auth ? auth.uid : null,
    users: activeUsers,
    onToggleReadyState,
    onChangeBoardName,
    loggedIn: Boolean(firebase.auth()),
    onDeleteBoard
  };
};
