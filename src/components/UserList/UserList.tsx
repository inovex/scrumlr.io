import * as React from 'react';
import * as cx from 'classnames';

import { BoardUsers, UserInformation } from '../../types';
import Icon, { IconNames } from '../Icon';
import './UserList.scss';
import * as ReactTooltip from 'react-tooltip';
import Avatar from '../Avatar';

const reactDDMenu = require('react-dd-menu');
const DropdownMenu = reactDDMenu.DropdownMenu;

export interface UserListProps {
  currentUserId: string;
  users: BoardUsers;
  onToggleReadyState: () => void;
  userDisplayLimit?: number;
  isTimerSet: boolean;
  className?: string;
}

export interface UserListState {
  showAllUsers: boolean;
  displayUserListDropdown: boolean;
  focusedAvatar: boolean;
}

export class UserList extends React.Component<UserListProps, UserListState> {
  constructor(props: UserListProps) {
    super(props);

    const showAllUsers = this.showAllUsers();
    this.state = {
      showAllUsers,
      displayUserListDropdown: false,
      focusedAvatar: false
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

  renderUserContent(
    user: UserInformation & { id: string },
    isCurrentUser: boolean
  ) {
    const iconName: IconNames = isCurrentUser
      ? 'circle-selection'
      : 'circle-selection-grey';

    return (
      <div className="board__user-image-wrapper">
        <Icon
          className="board__user-image-border"
          name={iconName}
          width={44}
          height={44}
          data-tip={user.name}
          data-for={'ALL' + user.id}
        />
        {!isCurrentUser && (
          <ReactTooltip
            id={'ALL' + user.id}
            place="bottom"
            effect="solid"
            isCapture={false}
          />
        )}
        <Avatar user={user} className="user-list__avatar" />
        {user.ready && (
          <span className="user-list__ready-state-wrapper">
            <Icon
              name="check"
              aria-hidden="true"
              width={14}
              height={14}
              className="user-list__ready-check-icon"
            />
          </span>
        )}
      </div>
    );
  }

  renderUserSummary = () => {
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

    const toggleIcon = (
      <div
        className="user-list__other-cursor"
        onClick={() => {
          this.setState({
            ...this.state,
            displayUserListDropdown: !this.state.displayUserListDropdown
          });
        }}
      >
        <Icon
          className="board__user-image-border"
          name="circle-selection-grey"
          width={44}
          height={44}
        />
        {!this.state.displayUserListDropdown && (
          <ReactTooltip
            id="user-list-summary-icon"
            place="bottom"
            effect="solid"
          />
        )}
        <Avatar user={otherUser} className="user-list__avatar" faded />
        <span className="board__user-count">{otherUsers.length}</span>
        <span className="user-list__ready-state-wrapper">
          <span className="board__user-ready-count">{readyCount}</span>
          <Icon
            name="check"
            aria-hidden="true"
            width={14}
            height={14}
            className="user-list__ready-check-icon"
          />
        </span>
      </div>
    );

    const ddMenuProps = {
      isOpen: this.state.displayUserListDropdown,
      close: () => {
        this.setState({ ...this.state, displayUserListDropdown: false });
      },
      toggle: toggleIcon,
      align: 'right',
      closeOnInsideClick: false
    };

    const userList = otherUsers.map(user => (
      <li key={user.id + 'otherList'}>
        <div className="user-list__other-wrapper">
          <span className="user-list__other-list-name">{user.name}</span>
          {this.renderUserContent(user, false)}
        </div>
      </li>
    ));

    return (
      <li key="user-summary">
        <div
          className="board__user-image-wrapper"
          data-tip={otherUserNames}
          data-for="user-list-summary-icon"
        >
          <DropdownMenu {...ddMenuProps}>{userList}</DropdownMenu>
        </div>
      </li>
    );
  };

  render() {
    const { currentUserId, users, onToggleReadyState, isTimerSet } = this.props;

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
    const readyText = currentUser.ready ? 'Unmark as done' : 'Mark as done';

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
                {this.renderUserContent(userInfo, false)}
              </li>
            ))}

          <li key="OWN" aria-label="Yourself">
            {this.renderUserContent(currentUser, true)}
          </li>
        </ul>
        {isTimerSet && (
          <span className="user-list__ready-toggle-wrapper">
            <button
              className={cx('user-list__ready-toggle', {
                'user-list__ready-toggle--ready': currentUser.ready
              })}
              onClick={() => {
                onToggleReadyState();
                this.setState({ ...this.state, focusedAvatar: true });
              }}
              title={readyText}
            >
              <Icon
                name="check"
                aria-hidden="true"
                width={16}
                height={16}
                className="user-list__ready-toggle-icon"
              />
              {!currentUser.ready && (
                <span className="user-list__ready-toggle-text">
                  {readyText}
                </span>
              )}
            </button>
          </span>
        )}
      </>
    );
  }
}

export default UserList;
