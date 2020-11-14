import * as cx from 'classnames';
import * as React from 'react';

import { PhaseMenu } from '../PhaseMenu';
import { UserList } from '../UserList';
import { UserMenu } from '../UserMenu';
import { BoardUsers, ModalType } from '../../types';
import Logo from './subcomponents/Logo';

import './Header.scss';
import { mapStateToProps } from './Header.container';
import { connect } from 'react-redux';
import { PhaseConfiguration } from '../../constants/Retrospective';

export interface OwnHeaderProps {
  isAdmin: boolean;
  boardId: string;
  phasesConfig: { [key: string]: PhaseConfiguration };
  onSignOut: () => void;
  onPdfExport: () => void;
  onCsvExport: () => void;
  onOpenModal: (modal: ModalType) => void;
  className?: string;
}

export interface StateHeaderProps {
  phase: number;
  sorted: boolean;
  boardName?: string;
  onPrevPhase: () => void;
  onNextPhase: () => void;
  onSetTimer: (seconds: number) => void;
  onChangeBoardName: (boardName: string) => void;
  loggedIn: boolean;
  user: string;
  users: BoardUsers;
  onToggleReadyState: () => void;
  onDeleteBoard: () => void;
  onDeleteUser: () => void;
}

export type HeaderProps = OwnHeaderProps & StateHeaderProps;

export class Header extends React.Component<HeaderProps, {}> {
  render() {
    const {
      isAdmin,
      className,
      boardName,
      boardId,
      phasesConfig,
      phase: guidedPhase,
      onPrevPhase,
      onNextPhase,
      onSetTimer,
      user,
      users,
      onToggleReadyState,
      onChangeBoardName,
      onOpenModal,
      loggedIn,
      onPdfExport,
      onCsvExport,
      onDeleteBoard,
      onDeleteUser,
      onSignOut
    } = this.props;

    const componentClassName = cx('header', className);

    return (
      <header className={componentClassName}>
        <div className="header__control">
          <Logo className="header__control-logo" />

          <PhaseMenu
            admin={isAdmin}
            phasesConfig={phasesConfig}
            guidedPhase={guidedPhase}
            onPrevPhase={onPrevPhase}
            onNextPhase={onNextPhase}
          />

          <div className="header__control-users">
            <UserList
              admin={isAdmin}
              boardUrl={boardId}
              currentUserId={user}
              users={users}
              onToggleReadyState={onToggleReadyState}
              onOpenModal={onOpenModal}
            />

            {loggedIn && (
              <UserMenu
                boardName={boardName}
                admin={isAdmin}
                onChangeBoardName={onChangeBoardName}
                onPdfExport={onPdfExport}
                onCsvExport={onCsvExport}
                onSignOut={onSignOut}
                onOpenModal={onOpenModal}
                onDeleteBoard={onDeleteBoard}
                onDeleteUser={onDeleteUser}
                onSetTimer={onSetTimer}
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
