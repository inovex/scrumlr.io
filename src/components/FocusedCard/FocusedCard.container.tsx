import { StoreState } from '../../types/index';
import { getVal, getFirebase } from 'react-redux-firebase';
import { FocusedCardProps, OwnFocusedCardProps } from './FocusedCard';
import Raven = require('raven-js');

export const mapStateToProps = (
  state: StoreState,
  ownProps: OwnFocusedCardProps
): FocusedCardProps => {
  const { fbState } = state;

  const auth = getVal(fbState, 'auth', {});

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
    onClose,
    ...ownProps
  };
};
