import * as React from 'react';

import './UsersModal.scss';
import Modal from '../Modal';
import { BoardUsers } from '../../../types';
import Icon from '../../Icon';
import Avatar from '../../Avatar';
import AdminToggle from '../../AdminToggle';

export interface UsersModalProps {
  boardUsers: BoardUsers;
  boardUrl: string;
  isAdmin: boolean;
  onClose: () => void;
}

export class UsersModal extends React.Component<UsersModalProps, {}> {
  render() {
    const { boardUsers, boardUrl, isAdmin, onClose } = this.props;

    const tUser = Object.keys(boardUsers).map(key => ({
      ...boardUsers[key],
      id: key
    }));

    return (
      <Modal onClose={onClose} onSubmit={onClose}>
        <div className="users-modal">
          <h2 className="modal__headline">Users</h2>
          <ul className="users-modal__users-list">
            {tUser.map(userInfo => (
              <li
                key={'ALL' + userInfo.id}
                aria-label={`User ${userInfo.name}`}
              >
                <div className="user-icon__user-name">{userInfo.name}</div>
                <div className="user-icon__user-image-wrapper">
                  <Icon
                    className="user-icon__user-image-border"
                    name={'circle-selection-grey'}
                    width={44}
                    height={44}
                    data-tip={userInfo.name}
                    data-for={'ALL' + userInfo.id}
                  />
                  <Avatar user={userInfo} className="user-list__avatar" />
                  {userInfo.ready && (
                    <span className="user-icon__ready-state-wrapper">
                      <Icon
                        name="check"
                        aria-hidden="true"
                        width={14}
                        height={14}
                        className="user-icon__ready-check-icon"
                      />
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <AdminToggle
                    boardUrl={boardUrl}
                    adminToggleIsVisible={isAdmin}
                    user={userInfo}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    );
  }
}

export default UsersModal;
