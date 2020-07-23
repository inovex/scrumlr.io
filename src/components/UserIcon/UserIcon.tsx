import * as React from 'react';
import { Component } from 'react';
import './UserIcon.scss';
import Icon, { IconNames } from '../Icon';
import * as ReactTooltip from 'react-tooltip';
import Avatar from '../Avatar';
import { UserInformation } from '../../types';

const reactDDMenu = require('react-dd-menu');
const DropdownMenu = reactDDMenu.DropdownMenu;

export interface UserIconProps {
  user: UserInformation & { id: string };
  isCurrentUser: boolean;
}

export interface UserIconState {
  displayUserInformationDropdown: boolean;
}

export class UserIcon extends Component<UserIconProps, UserIconState> {
  state: UserIconState = {
    displayUserInformationDropdown: false
  };

  componentDidMount() {
    this.setState({
      ...this.state
    });
  }

  render() {
    const { user, isCurrentUser } = this.props;

    const iconName: IconNames = isCurrentUser
      ? 'circle-selection'
      : 'circle-selection-grey';

    const toggleIcon = (
      <div
        className="user-list__other-cursor"
        onClick={() => {
          this.setState({
            ...this.state,
            displayUserInformationDropdown: !this.state
              .displayUserInformationDropdown
          });
        }}
      >
        <Icon
          className="board__user-image-border"
          name={iconName}
          width={44}
          height={44}
          data-tip={user.name}
          data-for={'ALL' + user.id}
        />
        {!isCurrentUser && !this.state.displayUserInformationDropdown && (
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

    const ddMenuProps = {
      isOpen: this.state.displayUserInformationDropdown,
      close: () => {
        this.setState({ ...this.state, displayUserInformationDropdown: false });
      },
      toggle: toggleIcon,
      align: 'right',
      closeOnInsideClick: false
    };

    const userPopup = (
      <div className="user-list__other-wrapper">
        <span className="user-list__other-list-name">{user.name}</span>
        <div className="board__user-image-wrapper">
          <Icon
            className="board__user-image-border"
            name={iconName}
            width={44}
            height={44}
            data-tip={user.name}
            data-for={'ALL' + user.id}
          />
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
      </div>
    );

    return (
      <div className="board__user-image-wrapper">
        <DropdownMenu {...ddMenuProps}>{userPopup}</DropdownMenu>
      </div>
    );
  }
}

export default UserIcon;
