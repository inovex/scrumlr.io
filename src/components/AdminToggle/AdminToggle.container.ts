import { StoreState } from '../../types';
import { getVal, getFirebase } from 'react-redux-firebase';
import Raven = require('raven-js');
import { OwnAdminToggleProps, StateAdminToggleProps } from './AdminToggle';

export const mapStateToProps = (
  state: StoreState,
  ownProps: OwnAdminToggleProps
): StateAdminToggleProps => {
  const currentUserId = getVal(state.fbState, 'auth', undefined).uid;

  const admins: { [key: string]: boolean } = getVal(
    state.fbState,
    `data/${ownProps.boardUrl}/config/adminUsers`,
    {}
  );

  const creatorId = getVal(
    state.fbState,
    `data/${ownProps.boardUrl}/config/creatorUid`,
    undefined
  );

  const isUserAdmin = (userId: string) => {
    return creatorId === userId || admins[userId];
  };

  const isAdmin = isUserAdmin(ownProps.user.id);

  const disabled =
    ownProps.user.id == creatorId || ownProps.user.id == currentUserId;

  function onToggleAdmin() {
    if (ownProps.adminToggleIsVisible && !disabled) {
      getFirebase()
        .ref(`${ownProps.boardUrl}/config/adminUsers/${ownProps.user.id}`)
        .set(!isAdmin)
        .catch((err: Error) => {
          Raven.captureMessage('Could not add admin to board', {
            extra: {
              reason: err.message,
              uid: ownProps.user.id,
              boardId: ownProps.boardUrl
            }
          });
        });
    }
  }

  return {
    isAdmin,
    onToggleAdmin,
    disabled
  };
};
