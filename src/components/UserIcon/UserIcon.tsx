import * as React from 'react';
import { Component } from 'react';
import './UserIcon.scss';
import Icon, { IconNames } from '../Icon';
import * as ReactTooltip from 'react-tooltip';
import Avatar from '../Avatar';
import { UserInformation } from '../../types';
import Checkbox from '../Checkbox';

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
        className="user-icon__other-cursor"
        onClick={() => {
          this.setState({
            ...this.state,
            displayUserInformationDropdown: !this.state
              .displayUserInformationDropdown
          });
        }}
      >
        <Icon
          className="user-icon__user-image-border"
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

    var checked = false;

    const userPopup = (
      <li key="user-summary">
        <div className="user-icon__other-wrapper">
          <span className="user-icon__user-name">{user.name}</span>
          <div className="user-icon__user-image-wrapper">
            <Icon
              className="user-icon__user-image-border"
              name={iconName}
              width={44}
              height={44}
              data-tip={user.name}
              data-for={'ALL' + user.id}
            />
            <Avatar user={user} className="user-list__avatar" />
            {user.ready && (
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
        </div>
        <div className="user-admin__admin-state-wrapper">
          <Checkbox
            onChange={() => {
              checked = !checked;
            }}
            checked={checked}
            className="user-admin__admin-checkbox"
          >
            Admin Rights
          </Checkbox>
        </div>
      </li>
    );

    return (
      <div className="user-icon__user-image-wrapper">
        <DropdownMenu {...ddMenuProps}>{userPopup}</DropdownMenu>
      </div>
    );
  }
}

export default UserIcon;
