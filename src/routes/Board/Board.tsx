import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { firebaseConnect } from 'react-redux-firebase';
import { RouteComponentProps } from 'react-router';
const Div100vh: any = require('react-div-100vh').default;
const { toast } = require('react-toastify');

import './Board.scss';

import {
  mapDispatchToProps,
  mapStateToProps,
  mergeProps
} from './Board.container';
import {
  BoardConfig,
  BoardCards,
  BoardUsers,
  Card,
  ModalType
} from '../../types';
import Header from '../../components/Header';
import ColumnView from '../../components/ColumnView';
import SettingsModal from '../../components/Modal/variant/SettingsModal';
import FeedbackModal from '../../components/Modal/variant/FeedbackModal';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import ShareModal from '../../components/Modal/variant/ShareModal';
import MembershipRequestModal from '../../components/Modal/variant/MembershipRequestModal';
import { getPhaseConfiguration } from '../../constants/Retrospective';
import Timer from '../../components/Timer';

export interface BoardProps extends RouteComponentProps<{ id: string }> {
  cards: BoardCards;
  boardConfig: BoardConfig;
  users: BoardUsers;
  boardSelector: string;
  boardPrintUrl: string;
  isBoardAdmin: boolean;
  isShowAuthor: boolean;
  uid: string; // ID of the current user
  setupCompleted: boolean;
  focusedCard?: Card;

  onToggleReadyState: () => void;
  onFocusCard: (cardId: string) => void;
  onChangeBoardName: (boardName: string) => void;
  onChangeUsername: (usernaame: string) => void;
  onDeleteTimer: () => void;
  onToggleShowAuthor: () => void;
  onSwitchPhaseIndex: (delta: number) => void;

  // Added by mergeProps
  onRegisterCurrentUser: () => void;

  username?: string;
  email?: string;
  timerExpiration?: string;
  isAnonymous: boolean;

  waitingUsers: {
    uid: string;
    name: string;
    image: string;
  }[];
  acceptUser: (uid: string, accept: boolean) => void;

  [key: string]: any;
}

export interface BoardState {
  showModal?: ModalType;
}

export interface JsonExportCard {
  authorref: string;
  text: string;
  type: string;
  votes: number;
  timestamp: string;
  childCards: JsonExportCard[];
}

export interface JsonExportUser {
  id: string;
  name: string;
}

export interface JsonExportData {
  title: string;
  date: string;
  users: JsonExportUser[];
  cards: JsonExportCard[];
}

export type ExportFormats = 'print';

function countReadyUsers(boardUsers: BoardUsers) {
  const userKeys = Object.keys(boardUsers);
  const users = userKeys.map(key => boardUsers[key]);
  return users.reduce((acc, user) => {
    acc += Number(user.ready);
    return acc;
  }, 0);
}

export class Board extends React.Component<BoardProps, BoardState> {
  constructor(props: BoardProps) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { onRegisterCurrentUser } = this.props;
    onRegisterCurrentUser();
  }

  componentDidUpdate(prevProps: BoardProps) {
    if (
      prevProps.boardConfig &&
      prevProps.boardConfig.guidedPhase !== this.props.boardConfig.guidedPhase
    ) {
      if (
        prevProps.boardConfig.guidedPhase > 0 ||
        this.props.boardConfig.guidedPhase > 0
      ) {
        const phase = getPhaseConfiguration(
          this.props.boardConfig.mode,
          this.props.boardConfig.guidedPhase
        );
        toast(
          `Switched to Phase ${phase.index + 1} ${
            phase.name
          } - ${phase.activities.map(a => a.description).join(', ')}`
        );
      }
    }
  }

  componentWillReceiveProps(nextProps: BoardProps) {
    const { uid } = this.props;
    if (this.props.users && nextProps.users) {
      const totalUsers = Object.keys(nextProps.users).length;
      const count = countReadyUsers(nextProps.users);
      if (
        this.props.boardConfig.guidedPhase ===
          nextProps.boardConfig.guidedPhase && // inform only in single phase
        count === totalUsers - 1 && // inform only last user
        countReadyUsers(this.props.users) !== count && // counter must have changed
        !nextProps.users[uid].ready // current person must be last that is not ready yet
      ) {
        toast('You are the last person that is not ready yet. Hurry up!');
      }
    }
  }

  getUsername = (id: string): string | undefined => {
    const user = this.props.users[id];
    if (!user) {
      return;
    }
    return this.props.users[id].name;
  };

  handleExportPrint = () => {
    window.location.hash = this.props.boardPrintUrl;
  };

  handleExport = (format: ExportFormats = 'print') => {
    switch (format) {
      case 'print':
        return this.handleExportPrint();
    }
  };

  handleNextPhase = () => {
    return this.props.onSwitchPhaseIndex(+1);
  };

  handlePrevPhase = () => {
    return this.props.onSwitchPhaseIndex(-1);
  };

  handleCloseModal = () => {
    this.setState({
      showModal: undefined
    });
  };

  handleOpenModal = (modal: ModalType) => {
    this.setState({
      showModal: modal
    });
  };

  render() {
    const {
      isBoardAdmin,
      boardConfig,
      setupCompleted,
      waitingUsers,
      timerExpiration,
      onDeleteTimer,
      acceptUser
    } = this.props;
    const configLoaded = boardConfig && Object.keys(boardConfig).length > 0;
    if (!configLoaded || !setupCompleted) {
      return <LoadingScreen />;
    }

    let waitingUser;
    if (isBoardAdmin && waitingUsers && waitingUsers.length > 0) {
      const user = waitingUsers[0];
      waitingUser = (
        <MembershipRequestModal
          onAccept={() => {
            acceptUser(user.uid, true);
          }}
          onDeny={() => {
            acceptUser(user.uid, false);
          }}
          member={user}
        />
      );
    }

    const showSettings = !waitingUser && this.state.showModal === 'settings';
    const showFeedback = !waitingUser && this.state.showModal === 'feedback';
    const showShareDialog = !waitingUser && this.state.showModal === 'share';
    const onDeleteTimerAuthorized = isBoardAdmin ? onDeleteTimer : undefined;

    return (
      <>
        {waitingUser}
        <Div100vh className="board-page">
          <Header
            boardId={this.props.boardSelector}
            onExport={() => this.handleExport()}
            onSignOut={this.props.onSignOut}
            onOpenModal={this.handleOpenModal}
          />

          <ColumnView
            boardUrl={this.props.boardSelector}
            className="board-page__column-view"
          />

          <Timer
            timerExpiration={timerExpiration}
            onDeleteTimer={onDeleteTimerAuthorized}
          />

          {showSettings && (
            <SettingsModal
              isAdmin={this.props.isBoardAdmin}
              boardName={boardConfig.name}
              username={this.props.username}
              email={this.props.email}
              isAnonymous={this.props.isAnonymous}
              onChangeBoardName={this.props.onChangeBoardName}
              onChangeUsername={this.props.onChangeUsername}
              onClose={this.handleCloseModal}
              onToggleShowAuthor={this.props.onToggleShowAuthor}
              isShowAuthor={this.props.isShowAuthor}
            />
          )}

          {showShareDialog && <ShareModal onClose={this.handleCloseModal} />}

          {showFeedback && <FeedbackModal onClose={this.handleCloseModal} />}
        </Div100vh>
      </>
    );
  }
}

function firebaseConnector(props: RouteComponentProps<{ id: string }>) {
  return [
    `/boards/${props.match.params.id}/public`,
    `/boards/${props.match.params.id}/private`
  ];
}

export default compose<any, any, any>(
  firebaseConnect(firebaseConnector),
  connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
  )
)(Board) as React.ComponentClass<any>;
