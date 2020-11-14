import * as React from 'react';
import './UserMenu.scss';
import Icon from '../Icon/Icon';
import Input from '../Input/Input';
import MenuItem from './MenuItem';
import { ModalType } from '../../types';

const reactDDMenu = require('react-dd-menu');
const DropdownMenu = reactDDMenu.DropdownMenu;

import classNames = require('classnames');

export interface UserMenuProps {
  onSignOut: () => void;
  onDeleteBoard: () => void;
  onPdfExport: () => void;
  onCsvExport: () => void;
  onOpenModal: (modal: ModalType) => void;
  onChangeBoardName: (boardName: string) => void;
  onSetTimer: (seconds: number) => void;
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
      onOpenModal,
      onPdfExport,
      onCsvExport,
      onSignOut,
      onSetTimer,
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
          width={24}
          height={24}
        />
        <Icon
          name="circle"
          className="user-menu__toggle-icon user-menu__toogle-icon-hover-circle"
          aria-hidden="true"
          width={24}
          height={24}
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
          <MenuItem
            name="Settings"
            icon="settings"
            onClick={() => {
              onOpenModal('settings');
            }}
          />
        </li>
        <li key="user-menu__share" className="user_menu__li--hidden-mobile">
          <MenuItem
            name="Share"
            icon="share"
            onClick={() => {
              onOpenModal('share');
            }}
          />
        </li>

        <li key="user-menu__export" className="user_menu__li--hidden-mobile">
          <div className="user-menu__with-buttons">
            <Icon className="menu-item__button-icon" name="download" />
            <span
              className={classNames(
                'menu-item__button-text',
                'user-menu__with-buttons__text'
              )}
            >
              Export
            </span>
            <button
              className="user-menu__with-buttons__button"
              name="Pdf"
              onClick={onPdfExport}
            >
              PDF
            </button>
            <button
              className="user-menu__with-buttons__button"
              name="Csv"
              onClick={onCsvExport}
            >
              CSV
            </button>
          </div>
        </li>

        {admin && (
          <>
            <li key="user-menu__timer" className="user_menu__li-hidden-mobile">
              <div className="user-menu__with-buttons">
                <Icon className="menu-item__button-icon" name="timer" />
                <span
                  className={classNames(
                    'menu-item__button-text',
                    'user-menu__with-buttons__text'
                  )}
                >
                  Timer
                </span>
                <button
                  className="user-menu__with-buttons__button"
                  onClick={() => {
                    onSetTimer(3 * 60);
                    this.setState({ isOpen: false });
                  }}
                >
                  3 min.
                </button>
                <button
                  className="user-menu__with-buttons__button"
                  onClick={() => {
                    onSetTimer(5 * 60);
                    this.setState({ isOpen: false });
                  }}
                >
                  5
                </button>
                <button
                  className="user-menu__with-buttons__button"
                  onClick={() => {
                    onSetTimer(10 * 60);
                    this.setState({ isOpen: false });
                  }}
                >
                  10
                </button>
              </div>
            </li>
          </>
        )}
        <li key="user-menu__about" className="user_menu__li--hidden-mobile">
          <MenuItem
            name="About"
            icon="about"
            onClick={() => {
              onOpenModal('about');
            }}
          />
        </li>
        <li key="user-menu__logout" className="user-menu__logout">
          <MenuItem name="Sign Out" icon="logout" onClick={onSignOut} />
        </li>
      </DropdownMenu>
    );
  }
}

export default UserMenu;
