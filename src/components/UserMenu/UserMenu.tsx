import * as React from 'react';
const reactDDMenu = require('react-dd-menu');
const DropdownMenu = reactDDMenu.DropdownMenu;

import './UserMenu.css';
import Icon from '../Icon/Icon';
import Input from '../Input/Input';
import MenuItem from './MenuItem';

export interface UserMenuProps {
  onSignOut: () => void;
  onDeleteBoard: () => void;
  onExport: () => void;
  onOpenSettings: () => void;
  onOpenFeedback: () => void;
  onOpenDonate: () => void;
  onOpenShareDialog: () => void;
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

  handleDeleteBoard = (e: any) => {
    const warning =
      'Are you sure you want to delete the board? This action cannot be undone.';
    if (window.confirm(warning)) {
      this.props.onDeleteBoard();
    }
  };

  render() {
    const { isOpen } = this.state;
    const {
      onOpenSettings,
      onOpenFeedback,
      onOpenDonate,
      onOpenShareDialog,
      onExport,
      onSignOut,
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
        {(boardName || admin) && (
          <li key="user-menu__board-name" className="user-menu__board-name">
            <Icon
              className="user_menu__button-icon user_menu__button-icon--inverted"
              name={admin ? 'pencil' : 'board'}
            />
            {admin && (
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
              />
            )}
            {!admin && (
              <span className="user-menu__boardname dd-item-ignore">
                {boardName || ''}
              </span>
            )}
          </li>
        )}
        <li key="user-menu__settings" className="user_menu__li--hidden-mobile">
          <MenuItem name="Settings" icon="settings" onClick={onOpenSettings} />
        </li>
        <li key="user-menu__feedback" className="user_menu__li--hidden-mobile">
          <MenuItem name="Feedback" icon="feedback" onClick={onOpenFeedback} />
        </li>
        <li key="user-menu__donate" className="user_menu__li--hidden-mobile">
          <MenuItem name="Donate" icon="donate" onClick={onOpenDonate} />
        </li>
        <li key="user-menu__export" className="user_menu__li--hidden-mobile">
          <MenuItem name="Export" icon="download" onClick={onExport} />
        </li>
        <li key="user-menu__share" className="user_menu__li--hidden-mobile">
          <MenuItem name="Share" icon="share" onClick={onOpenShareDialog} />
        </li>
        {admin && (
          <li key="user-menu__delete" className="user_menu__li--hidden-mobile">
            <MenuItem
              name="Delete board"
              icon="trash"
              onClick={this.handleDeleteBoard}
            />
          </li>
        )}
        <li key="user-menu__logout" className="user-menu__logout">
          <MenuItem name="Sign Out" icon="logout" onClick={onSignOut} />
        </li>
      </DropdownMenu>
    );
  }
}

export default UserMenu;
