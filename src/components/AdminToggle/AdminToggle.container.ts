import { StoreState } from '../../types';
import { getVal, getFirebase } from 'react-redux-firebase';
import Raven = require('raven-js');
import { OwnAdminToggleProps, StateAdminToggleProps } from './AdminToggle';

export const mapStateToProps = (
  state: StoreState,
  ownProps: OwnAdminToggleProps
): StateAdminToggleProps => {
  const currentUser = getVal(state.fbState, 'auth', undefined);

  const admins: { [key: string]: boolean } = getVal(
    state.fbState,
    `data/${ownProps.boardUrl}/config/adminUsers`,
    {}
  );

  const creator = getVal(
    state.fbState,
    `data/${ownProps.boardUrl}/config/creatorUid`,
    undefined
  );

  const isUserAdmin = (userId: string) => {
    return creator === userId || admins[userId];
  };

  const isAdmin = isUserAdmin(ownProps.user.id);

  function onToggleAdmin() {
    if (
      ownProps.adminToggleIsVisible &&
      ownProps.user.id !== creator &&
      ownProps.user.id !== currentUser
    ) {
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
    onToggleAdmin
  };
};
