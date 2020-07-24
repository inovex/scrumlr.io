import * as React from 'react';

import './UsersModal.scss';
import Modal from '../Modal';
import UserIcon from '../../UserIcon';
import { BoardUsers } from '../../../types';

export interface UsersModalProps {
  boardUsers: BoardUsers;
  boardUrl: string;
  isAdmin: boolean;
  onClose: () => void;
}

export class UsersModal extends React.Component<UsersModalProps, {}> {
  render() {
    const { boardUsers, isAdmin, boardUrl, onClose } = this.props;

    const tUser = Object.keys(boardUsers).map(key => ({
      ...boardUsers[key],
      id: key
    }));

    return (
      <Modal onClose={onClose} onSubmit={onClose}>
        <h2 className="modal__headline">Users</h2>
        {tUser.map(userInfo => (
          <li key={'ALL' + userInfo.id} aria-label={`User ${userInfo.name}`}>
            <UserIcon
              adminToggleIsVisible={isAdmin}
              boardUrl={boardUrl}
              user={userInfo}
              isCurrentUser={false}
            />
          </li>
        ))}
      </Modal>
    );
  }
}

export default UsersModal;
