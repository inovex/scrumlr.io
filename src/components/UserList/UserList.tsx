import * as React from 'react';
import * as cx from 'classnames';

import { BoardUsers, UserInformation } from '../../types/index';
import Icon, { IconNames } from '../Icon';
import './UserList.css';
import * as ReactTooltip from 'react-tooltip';

const reactDDMenu = require('react-dd-menu');
const DropdownMenu = reactDDMenu.DropdownMenu;

export interface UserListProps {
  currentUserId: string;
  users: BoardUsers;
  onToggleReadyState: () => void;
  userDisplayLimit?: number;
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

  renderUserContent(
    user: UserInformation & { id: string },
    isCurrentUser: boolean
  ) {
    const { onToggleReadyState } = this.props;
    const altText = user.name + (user.ready ? ' (ready)' : '');
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
          {...isCurrentUser && { onClick: onToggleReadyState }}
        />
        {!isCurrentUser && (
          <ReactTooltip
            id={'ALL' + user.id}
            place="bottom"
            effect="solid"
            isCapture={false}
          />
        )}
        <img
          className="board__user-image"
          src={
            user.image ||
            'https://www.gravatar.com/avatar/00000000000000000000000000000000?s=32&d=retro'
          }
          alt={altText}
          title={altText}
        />
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

    const otherUserNames = tUser.map(({ name }) => name).join(', ');

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
        <img
          className={cx('board__user-image', 'board__user-image--faded')}
          src={
            otherUser.image ||
            'https://www.gravatar.com/avatar/912ec803b2ce49e4a541068d495ab570?s=32&d=retro'
          }
        />
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
    //const slicedList = filteredList;

    return (
      <ul className={cx('board__user-list', this.props.className)}>
        {!this.state.showAllUsers &&
          tUser.length > 1 &&
          this.renderUserSummary()}

        {this.state.showAllUsers &&
          slicedList.map(userInfo => (
            <li key={'ALL' + userInfo.id} aria-label={`User ${userInfo.name}`}>
              {this.renderUserContent(userInfo, false)}
            </li>
          ))}

        {tUser.filter(({ id }) => id === currentUserId).map(userInfo => (
          <li key="OWN" aria-label="Yourself">
            <button
              type="button"
              className={cx('board__user-ready-toggle', {
                ['board__user-ready-toggle-focused']: this.state.focusedAvatar
              })}
              onClick={() => {
                onToggleReadyState();
                this.setState({ ...this.state, focusedAvatar: true });
              }}
              onBlur={() =>
                this.setState({ ...this.state, focusedAvatar: false })
              }
            >
              {this.renderUserContent(userInfo, true)}
            </button>
          </li>
        ))}
      </ul>
    );
  }
}

export default UserList;
