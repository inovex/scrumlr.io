import { AnyAction, Dispatch } from 'redux';
import { getVal, isLoaded } from 'react-redux-firebase';
import * as Raven from 'raven-js';
import { debounce, difference } from 'lodash';

import { SETUP_COMPLETED } from '../../actions';
import { BoardProps } from './Board';
import {
  BoardCards,
  BoardConfig,
  Card,
  FirebaseProp,
  Optional,
  PrivateBoardData,
  PublicBoardData,
  StoreState
} from '../../types';
import { authController } from '../../controller/auth';
import { Crypto } from '../../util/crypto';
import { PhaseConfiguration } from '../../constants/Retrospective';
import retroModes from '../../constants/mode';

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

  if (!isLoaded(board) || !board) {
    return { boardSelector, boardConfig: undefined, auth } as any;
  }

  const cards: BoardCards = board.cards || {};
  const boardConfig: BoardConfig = board.config;
  const phasesConfig: {
    [key: string]: PhaseConfiguration;
  } = boardConfig.phasesConfig
    ? boardConfig.phasesConfig
    : retroModes[boardConfig.mode];

  const users = isLoaded(board) ? board.users : {};

  const adminUsers = boardConfig.adminUsers || {};

  //There should be only one board admin check - here!
  const isBoardAdmin = isLoaded(board)
    ? auth.uid === boardConfig.creatorUid || adminUsers[auth.uid]
    : false;

  let focusedCard: Optional<Card> = undefined;
  if (boardConfig.focusedCardId) {
    focusedCard = cards[boardConfig.focusedCardId];
  }

  let timerExpiration: Optional<string> = undefined;
  if (boardConfig.timerExpiration) {
    timerExpiration = boardConfig.timerExpiration;
  }

  const publicBoardSelector = `boards/${ownProps.match.params.id}/public`;
  const publicBoard: Optional<PublicBoardData> = getVal(
    fbState,
    `data/${publicBoardSelector}`,
    undefined
  );

  let waitingUsers: {
    uid: string;
    name: string;
    image: string;
    time: Date;
  }[] = [];
  if (isLoaded(publicBoard) && publicBoard) {
    const { accessAuthorized, applicants } = publicBoard;

    if (applicants) {
      const waitingUserUids = difference(
        Object.keys(applicants),
        Object.keys(accessAuthorized || {})
      );
      waitingUsers = waitingUserUids
        .map(uid => ({
          uid,
          ...applicants[uid],
          time: new Date(applicants[uid].time)
        }))
        .sort((a, b) => {
          if (a.time > b.time) {
            return 1;
          } else if (a.time < b.time) {
            return -1;
          }
          return 0;
        });
    }
  }

  function acceptUser(uid: string, accept: boolean) {
    firebase
      .set(`${publicBoardSelector}/accessAuthorized/${uid}`, accept)
      .catch((err: any) => {
        Raven.captureMessage('unable to accept user access', {
          extra: {
            reason: err.message,
            uid: auth.uid,
            boardId: boardSelector,
            user: uid,
            accept
          }
        });
      });
  }

  // TODO cleanup symmetric key sync
  if (isBoardAdmin && users) {
    const keyStore = board.keyStore;

    if (keyStore) {
      const crypto = new Crypto();
      crypto.initKeypair().then(() => {
        const key = keyStore[crypto.getPublicKey()!!];

        if (key) {
          crypto.importSymmetricKey(key).then(() => {
            for (let uid in users) {
              if (keyStore && !keyStore[users[uid].publicKey!!]) {
                crypto
                  .exportSymmetricKey(users[uid].publicKey!!)
                  .then(exportedKey => {
                    firebase.set(
                      `${boardSelector}/keyStore/${users[uid].publicKey}`,
                      exportedKey
                    );
                  });
              }
            }
          });
        }
      });
    }
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

  function onToggleShowCards() {
    firebase
      .update(`${boardSelector}/config`, {
        showCards: !boardConfig.showCards
      })
      .catch((err: Error) => {
        Raven.captureMessage('Could not toggle show content state', {
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

  const onDeleteTimer = () => {
    firebase
      .set(`${boardSelector}/config/timerExpiration`, null)
      .catch((err: any) => {
        Raven.captureMessage('Unable to delete timer', {
          extra: {
            reason: err.message,
            uid: auth.uid,
            boardId: boardSelector
          }
        });
      });
  };

  function onDeleteBoard() {
    firebase
      .ref(`${boardSelector}`)
      .remove()
      .then(() => {
        location.hash = '/';
      })
      .catch((err: Error) => {
        Raven.captureMessage('Could not delete board', {
          extra: { reason: err.message, uid: auth.uid, boardId: boardSelector }
        });
      });
  }

  function onSwitchPhaseIndex(delta: number) {
    firebase
      .ref(`${boardSelector}/config/guidedPhase`)
      .transaction((phase: number) => phase + delta)
      .catch((err: Error) => {
        Raven.captureMessage('Could not switch phase index', {
          extra: { reason: err.message, uid: auth.uid, boardId: boardSelector }
        });
      });

    const updateUsers = {};
    Object.keys(board!!.users).forEach(uid => {
      updateUsers[`${uid}/ready`] = false;
    });

    console.log(updateUsers);
    firebase
      .ref(`${boardSelector}/users`)
      .update(updateUsers)
      .catch((err: Error) => {
        Raven.captureMessage('Could reset ready status for users', {
          extra: { reason: err.message, boardId: boardSelector }
        });
      });

    // Always remove card selection if new phase is entered.
    if (boardConfig.focusedCardId) {
      onFocusCard(boardConfig.focusedCardId);
    }
  }

  function onUpdateColumnName(columnId: string, newName: string) {
    let newConfig = phasesConfig;

    // Change name of column with columnId in every phase
    Object.keys(newConfig).forEach(key => {
      if (newConfig[key].columns[columnId]) {
        newConfig[key].columns[columnId].name = newName;
      }
    });

    firebase
      .set(`${boardSelector}/config/phasesConfig`, newConfig)
      .catch((err: any) => {
        Raven.captureMessage('unable to update phase configurations', {
          extra: {
            reason: err.message,
            uid: auth.uid,
            boardId: boardSelector
          }
        });
      });
  }

  return {
    ...ownProps,
    cards,
    boardSelector,
    boardConfig,
    phasesConfig,
    boardPrintUrl,
    users,
    focusedCard,
    isBoardAdmin,
    username,
    email,
    timerExpiration,
    isAnonymous,
    uid: auth.uid,
    onToggleReadyState,
    onFocusCard,
    onSwitchPhaseIndex,
    isShowAuthor: Boolean(boardConfig.showAuthor),
    isShowCards: Boolean(boardConfig.showCards),
    onSignOut: authController(firebase).signOut,
    onChangeBoardName,
    onChangeUsername,
    onDeleteTimer,
    onDeleteBoard,
    onToggleShowAuthor,
    onToggleShowCards,
    onUpdateColumnName,
    onRegisterCurrentUser: () => null, // will be filled in mergeProps
    waitingUsers,
    acceptUser,
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
  function onRegisterCurrentUser() {
    dispatch({ type: SETUP_COMPLETED });
  }

  return {
    ...ownProps,
    ...stateProps,
    onRegisterCurrentUser
  };
}
