import { StoreState } from '../../types';
import { getVal, getFirebase } from 'react-redux-firebase';
import Raven = require('raven-js');
import { OwnUserIconProps, StateUserIconProps } from './UserIcon';

export const mapStateToProps = (
  state: StoreState,
  ownProps: OwnUserIconProps
): StateUserIconProps => {
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

  const adminToggleIsVisible = isUserAdmin(currentUser.uid);

  const isAdmin = isUserAdmin(ownProps.user.id);

  function onToggleAdmin() {
    if (
      adminToggleIsVisible &&
      creator !== ownProps.user.id &&
      currentUser !== ownProps.user.id
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
    adminToggleIsVisible,
    isAdmin,
    onToggleAdmin
  };
};
