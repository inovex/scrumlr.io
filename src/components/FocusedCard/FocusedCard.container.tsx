import { BoardConfig, StoreState } from '../../types/index';
import { getVal, getFirebase, helpers } from 'react-redux-firebase';
import isLoaded = helpers.isLoaded;
import { FocusedCardProps, OwnFocusedCardProps } from './FocusedCard';
import Raven = require('raven-js');

export const mapStateToProps = (
  state: StoreState,
  ownProps: OwnFocusedCardProps
): FocusedCardProps => {
  const { fbState } = state;

  const boardUrl = ownProps.boardUrl;
  const auth = getVal(fbState, 'auth', {});
  const boardConfig: BoardConfig = getVal(
    fbState,
    `data/${boardUrl}/config`,
    {}
  );

  const isBoardAdmin =
    auth && isLoaded(boardConfig) ? auth.uid === boardConfig.creatorUid : false;

  function onClose() {
    getFirebase()
      .ref(`${ownProps.boardUrl}/config/focusedCardId`)
      .set(null)
      .catch((err: Error) => {
        Raven.captureMessage('Could not delete focus on', {
          extra: {
            reason: err.message,
            uid: auth.uid,
            boardId: ownProps.boardUrl
          }
        });
      });
  }

  return {
    isAdmin: isBoardAdmin,
    onClose,
    ...ownProps
  };
};
