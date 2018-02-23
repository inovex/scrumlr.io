import * as React from 'react';
const reactDDMenu = require('react-dd-menu');
const DropdownMenu = reactDDMenu.DropdownMenu;

import './UserMenu.css';
import Icon from '../Icon/Icon';
import Input from '../Input/Input';

export interface UserMenuProps {
  onSignOut: () => void;
  onDeleteBoard: () => void;
  onExport: () => void;
  onOpenSettings: () => void;
  onOpenFeedback: () => void;
  onOpenDonate: () => void;
  onChangeBoardName: (boardName: string) => void;
  boardName?: string;
  admin: boolean;
}

export interface UserMenuState {
  isOpen: boolean;
}

export class UserMenu extends React.Component<UserMenuProps, UserMenuState> {
  constructor(props: UserMenuProps) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  closeUserMenu = () => {
    this.setState({ isOpen: false });
  };

  toggleUserMenu = () => {
    this.setState(state => ({ ...state, isOpen: !state.isOpen }));
  };

  handleBoardNameChange = (e: any) => {
    this.props.onChangeBoardName(e.target.value);
  };

  render() {
    const { isOpen } = this.state;
    const {
      onOpenSettings,
      onOpenFeedback,
      onOpenDonate,
      onExport,
      onSignOut,
      onDeleteBoard,
      boardName,
      admin
    } = this.props;

    const toggleIcon = (
      <button
        className="user-menu__toggle-button"
        onClick={this.toggleUserMenu}
        type="button"
      >
        <Icon
          name="more"
          className="user-menu__toggle-icon"
          aria-hidden="true"
        />
        <Icon
          name="circle"
          className="user-menu__toggle-icon user-menu__toogle-icon-hover-circle"
          aria-hidden="true"
        />
      </button>
    );

    const ddMenuProps = {
      isOpen,
      close: this.closeUserMenu,
      toggle: toggleIcon,
      align: 'right',
      closeOnInsideClick: false
    };

    return (
      <DropdownMenu {...ddMenuProps}>
        {(boardName || admin) &&
          <li key="user-menu__board-name" className="user-menu__board-name">
            <Icon
              className="user_menu__button-icon user_menu__button-icon--inverted"
              name={admin ? 'pencil' : 'board'}
            />
            {admin &&
              <Input
                type="text"
                className="user-menu__input dd-item-ignore"
                placeholder="Boardname"
                defaultValue={this.props.boardName}
                onClick={(e: any) => e.preventDefault()}
                onKeyDown={(e: any) => {
                  if (e.keyCode === 13) {
                    this.closeUserMenu();
                  }
                }}
                onChange={this.handleBoardNameChange}
                showUnderline={true}
                focusTheme="mint"
                invertPlaceholder={true}
              />}
            {!admin &&
              <span className="user-menu__boardname dd-item-ignore">
                {boardName || ''}
              </span>}
          </li>}
        <li key="user-menu__settings" className="user_menu__li--hidden-mobile">
          <button
            className="user-menu__button"
            onClick={() => {
              onOpenSettings();
            }}
          >
            <Icon className="user_menu__button-icon" name="settings" />
            <span className="user_menu__button-text">Settings</span>
          </button>
        </li>
        <li key="user-menu__feedback" className="user_menu__li--hidden-mobile">
          <button
            className="user-menu__button"
            onClick={() => {
              onOpenFeedback();
            }}
          >
            <Icon className="user_menu__button-icon" name="feedback" />
            <span className="user_menu__button-text">Feedback</span>
          </button>
        </li>
        <li key="user-menu__donate" className="user_menu__li--hidden-mobile">
          <button
            className="user-menu__button"
            onClick={() => {
              onOpenDonate();
            }}
          >
            <Icon className="user_menu__button-icon" name="donate" />
            <span className="user_menu__button-text">Donate</span>
          </button>
        </li>
        <li key="user-menu__export" className="user_menu__li--hidden-mobile">
          <button
            className="user-menu__button"
            onClick={() => {
              onExport();
            }}
          >
            <Icon className="user_menu__button-icon" name="download" />
            <span className="user_menu__button-text">Export</span>
          </button>
        </li>
        <li key="user-menu__delete">
          <button className="user-menu__button" onClick={onDeleteBoard}>
            <Icon className="user_menu__button-icon" name="close" />
            <span className="user_menu__button-text">Delete board</span>
          </button>
        </li>
        <li key="user-menu__logout" className="user-menu__logout">
          <button className="user-menu__button" onClick={onSignOut}>
            <Icon className="user_menu__button-icon" name="logout" />
            <span className="user_menu__button-text">Sign Out</span>
          </button>
        </li>
      </DropdownMenu>
    );
  }
}

export default UserMenu;
