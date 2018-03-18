import * as cx from 'classnames';
import * as React from 'react';

import { PhaseMenu } from '../PhaseMenu';
import { UserList } from '../UserList';
import { UserMenu } from '../UserMenu';
import { BoardUsers } from '../../types';
import Logo from './subcomponents/Logo';

import './Header.css';
import { mapStateToProps } from './Header.container';
import { connect } from 'react-redux';
import { RetroMode } from '../../constants/mode';

export interface OwnHeaderProps {
  boardId: string;
  onSignOut: () => void;
  onExport: () => void;
  onOpenSettings: () => void;
  onOpenFeedback: () => void;
  onOpenDonate: () => void;
  onOpenShareDialog: () => void;
  className?: string;
}

export interface StateHeaderProps {
  admin: boolean;
  mode: RetroMode;
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
  onSignOut: () => void;
}

export type HeaderProps = OwnHeaderProps & StateHeaderProps;

export class Header extends React.Component<HeaderProps, {}> {
  render() {
    const {
      admin,
      className,
      boardName,
      mode,
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
      onOpenShareDialog,
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
            mode={mode}
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

            {loggedIn && (
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
                onOpenShareDialog={onOpenShareDialog}
              />
            )}
          </div>
        </div>
      </header>
    );
  }
}

export default connect<StateHeaderProps, null, OwnHeaderProps>(mapStateToProps)(
  Header
);
