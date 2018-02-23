import * as cx from 'classnames';
import * as React from 'react';

import { PhaseMenu } from '../PhaseMenu/PhaseMenu';
import { UserList } from '../UserList/UserList';
import { UserMenu } from '../UserMenu/UserMenu';
import { BoardUsers } from '../../types/index';
import { Logo } from './subcomponents/Logo';

import './Header.css';
import { connectWithProps } from '../../util/redux';
import { mapStateToProps } from './Header.container';

export interface HeaderOwnProps {
  boardId: string;
  onSignOut: () => void;
  onExport: () => void;
  onOpenSettings: () => void;
  onOpenFeedback: () => void;
  onOpenDonate: () => void;
  className?: string;
}

export interface HeaderConnectedProps {
  admin: boolean;
  phase: number;
  sorted: boolean;
  boardName?: string;
  onPrevPhase: () => void;
  onNextPhase: () => void;
  onChangeBoardName: (boardName: string) => void;
  loggedIn: boolean;
  user: string;
  users: BoardUsers;
  onToggleReadyState: () => void;
  onDeleteBoard: () => void;
}

export interface HeaderProps extends HeaderOwnProps, HeaderConnectedProps {}

export class Header extends React.Component<HeaderProps, {}> {
  render() {
    const {
      admin,
      className,
      boardName,
      phase: guidedPhase,
      onPrevPhase,
      onNextPhase,
      user,
      users,
      onToggleReadyState,
      onChangeBoardName,
      onOpenSettings,
      onOpenFeedback,
      onOpenDonate,
      loggedIn,
      onExport,
      onDeleteBoard,
      onSignOut
    } = this.props;

    const componentClassName = cx('header', className);

    return (
      <header className={componentClassName}>
        <div className="header__control">
          <Logo className="header__control-logo" />

          <PhaseMenu
            admin={admin}
            guidedPhase={guidedPhase}
            onPrevPhase={onPrevPhase}
            onNextPhase={onNextPhase}
          />

          <div className="header__control-users">
            <UserList
              currentUserId={user}
              users={users}
              onToggleReadyState={onToggleReadyState}
            />

            {loggedIn &&
              <UserMenu
                boardName={boardName}
                admin={admin}
                onChangeBoardName={onChangeBoardName}
                onExport={onExport}
                onSignOut={onSignOut}
                onOpenSettings={onOpenSettings}
                onOpenFeedback={onOpenFeedback}
                onOpenDonate={onOpenDonate}
                onDeleteBoard={onDeleteBoard}
              />}
          </div>
        </div>
      </header>
    );
  }
}

export default connectWithProps<HeaderOwnProps, HeaderConnectedProps>(
  mapStateToProps
)(Header);
