import * as React from 'react';
import * as cx from 'classnames';

import { BoardUsers, ModalType } from '../../types';
import Icon from '../Icon';
import './UserList.scss';
import * as ReactTooltip from 'react-tooltip';
import Avatar from '../Avatar';
import ReadyButton from './ReadyButton';
import UserIcon from '../UserIcon';

export interface UserListProps {
  boardUrl: string;
  currentUserId: string;
  users: BoardUsers;
  onToggleReadyState: () => void;
  onOpenModal: (modal: ModalType) => void;
  userDisplayLimit?: number;
  className?: string;
}

export interface UserListState {
  showAllUsers: boolean;
  displayUserInformationDropdown: boolean;
}

export class UserList extends React.Component<UserListProps, UserListState> {
  constructor(props: UserListProps) {
    super(props);

    const showAllUsers = this.showAllUsers();
    this.state = {
      showAllUsers,
      displayUserInformationDropdown: false
    };
  }

  updateDimensions = () => {
    const showAllUsers = this.showAllUsers();
    if (showAllUsers !== this.state.showAllUsers) {
      this.setState({ ...this.state, showAllUsers });
    }
  };

  showAllUsers = () => {
    return (
      Boolean(this.props.userDisplayLimit) ||
      (window.innerWidth > 768 &&
        this.props.users &&
        Object.keys(this.props.users).length < (window.innerWidth - 768) / 50)
    );
  };

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  }

  componentDidUpdate(prevProps: Readonly<UserListProps>): void {
    if (
      Object.keys(prevProps.users).length !=
      Object.keys(this.props.users).length
    ) {
      this.updateDimensions();
    }
  }

  renderUserSummary = () => {
    const onOpenModal = this.props.onOpenModal;

    const tUser = Object.keys(this.props.users).map(key => ({
      ...this.props.users[key],
      id: key
    }));

    const otherUsers = tUser.filter(
      ({ id }) => id !== this.props.currentUserId
    );
    const otherUser = otherUsers[0];

    const readyCount = otherUsers.filter(user => user.ready).length;

    let otherUserNames = tUser.map(({ name }) => name).join(', ');
    if (otherUserNames.length > 64) {
      otherUserNames = otherUserNames.slice(0, 64);
      otherUserNames += '...';
    }

    return (
      <div
        className="user-icon__user-image-wrapper"
        data-tip={otherUserNames}
        data-for="user-list-summary-icon"
      >
        <div
          className="user-icon__other-cursor"
          onClick={() => onOpenModal('settings')}
        >
          <Icon
            className="user-icon__user-image-border"
            name="circle-selection-grey"
            width={44}
            height={44}
          />
          <ReactTooltip
            id="user-list-summary-icon"
            place="bottom"
            effect="solid"
          />
          <Avatar user={otherUser} className="user-list__avatar" faded />
          <span className="board__user-count">{otherUsers.length}</span>
          <span className="user-icon__ready-state-wrapper">
            <span className="board__user-ready-count">{readyCount}</span>
            <Icon
              name="check"
              aria-hidden="true"
              width={14}
              height={14}
              className="user-icon__ready-check-icon"
            />
          </span>
        </div>
      </div>
    );
  };

  render() {
    const { currentUserId, users, onToggleReadyState } = this.props;

    if (!users) {
      return null;
    }

    const tUser = Object.keys(users).map(key => ({
      ...users[key],
      id: key
    }));

    const filteredList = tUser.filter(({ id }) => id !== currentUserId);
    const slicedList = Boolean(this.props.userDisplayLimit)
      ? filteredList.slice(0, this.props.userDisplayLimit)
      : filteredList;

    const currentUser = tUser.find(({ id }) => id === currentUserId);
    if (!currentUser) {
      return <></>;
    }

    return (
      <>
        <ul className={cx('board__user-list', this.props.className)}>
          {!this.state.showAllUsers &&
            tUser.length > 1 &&
            this.renderUserSummary()}

          {this.state.showAllUsers &&
            slicedList.map(userInfo => (
              <li
                key={'ALL' + userInfo.id}
                aria-label={`User ${userInfo.name}`}
              >
                <UserIcon
                  boardUrl={this.props.boardUrl}
                  user={userInfo}
                  isCurrentUser={false}
                />
              </li>
            ))}

          <li key="OWN" aria-label="Yourself">
            <UserIcon
              boardUrl={this.props.boardUrl}
              user={currentUser}
              isCurrentUser={true}
            />
          </li>
        </ul>
        <ReadyButton
          onToggleReadyState={onToggleReadyState}
          ready={currentUser.ready}
        />
      </>
    );
  }
}

export default UserList;
