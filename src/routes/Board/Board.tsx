import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { flattenDeep } from 'lodash';
import { firebaseConnect } from 'react-redux-firebase';
import { RouteComponentProps } from 'react-router';
const { toast } = require('react-toastify');

import './Board.css';

import {
  mapDispatchToProps,
  mapStateToProps,
  mergeProps
} from './Board.container';
import { BoardConfig, BoardCards, BoardUsers, Card } from '../../types';
import Header from '../../components/Header';
import ColumnView from '../../components/ColumnView';
import PhaseSplash from '../../components/PhaseSplash/PhaseSplash';
import { getPhaseConfiguration } from '../../constants/Retrospective';
import ReactCSSTransitionGroup = require('react-transition-group/CSSTransitionGroup');
import SettingsModal from '../../components/Modal/variant/SettingsModal';
import FeedbackModal from '../../components/Modal/variant/FeedbackModal';
import DonateModal from '../../components/Modal/variant/DonateModal';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import ShareModal from '../../components/Modal/variant/ShareModal';

export interface BoardProps extends RouteComponentProps<{ id: string }> {
  cards: BoardCards;
  boardConfig: BoardConfig;
  users: BoardUsers;
  boardSelector: string;
  boardUrl: string;
  boardPrintUrl: string;
  isBoardAdmin: boolean;
  uid: string; // ID of the current user
  setupCompleted: boolean;
  focusedCard?: Card;

  onToggleReadyState: () => void;
  onFocusCard: (cardId: string) => void;
  onChangeBoardName: (boardName: string) => void;
  onChangeUsername: (usernaame: string) => void;
  onChangeEmail: (email: string) => void;
  onSwitchPhaseIndex: (delta: number) => void;
  onSignOut: () => void;

  // Added by mergeProps
  onRegisterCurrentUser: () => void;

  username?: string;
  email?: string;
  isAnonymous: boolean;

  [key: string]: any;
}

export interface BoardState {
  showModal?: 'settings' | 'feedback' | 'donate' | 'share';
  showPhaseIntro: boolean;
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

export type ExportFormats = 'pdf' | 'csv' | 'json' | 'print';

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
    this.state = {
      showPhaseIntro: true
    };
  }

  componentDidMount() {
    const { onRegisterCurrentUser } = this.props;
    onRegisterCurrentUser();
  }

  componentDidUpdate(prevProps: BoardProps) {
    if (
      prevProps.boardConfig.guidedPhase !== this.props.boardConfig.guidedPhase
    ) {
      this.setState({ ...this.state, showPhaseIntro: true });
    }
  }

  componentWillReceiveProps(nextProps: BoardProps) {
    const { uid } = this.props;
    if (this.props.users && nextProps.users) {
      const totalUsers = Object.keys(nextProps.users).length;
      const count = countReadyUsers(nextProps.users);
      if (
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

  exportCsv = (separatorChar = String.fromCharCode(31)) => {
    const { users, cards } = this.props;

    const header = ['Type', 'Text', 'Author', 'Votes', 'Timestamp'];
    const data = Object.keys(cards)
      .map(key => cards[key])
      .map(({ text, authorUid, timestamp, type, votes }) => [
        type || '',
        text.replace('\n', '\\n') || '',
        (users[authorUid] || { name: '' }).name || '',
        votes || '',
        timestamp || ''
      ]);

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'sep=' + separatorChar + '\n';
    csvContent += `${header.join(separatorChar)}\n`;
    data.forEach(function(dataItem: string[], index: number) {
      let dataString = dataItem.join(separatorChar);
      csvContent += index < data.length ? dataString + '\n' : dataString;
    });

    return csvContent;
  };

  handleExportCsv = (separatorChar = String.fromCharCode(31)) => {
    const encodedUri = encodeURI(this.exportCsv(separatorChar));
    window.open(encodedUri);
  };

  exportJson = (): JsonExportData => {
    const { cards, users, boardConfig } = this.props;

    function getChildCards(parentCardId: string): any[] {
      return Object.keys(cards)
        .map(id => ({ id, card: cards[id] }))
        .filter(({ id, card }) => card.parent === parentCardId)
        .map(({ id, card }) => {
          return {
            ...getJsonFromCard(id, card),
            childCards: getChildCards(id)
          };
        });
    }

    function flattenCard(card: JsonExportCard): any[] {
      return [
        {
          ...card,
          childCards: []
        },
        ...card.childCards.map(flattenCard)
      ];
    }

    function getJsonFromCard(id: string, card: Card) {
      return {
        authorref: card.authorUid,
        text: card.text,
        type: card.type,
        votes: Object.keys(card.userVotes)
          .map(key => card.userVotes[key])
          .reduce((acc, sum) => acc + sum, 0),
        timestamp: card.timestamp,
        childCards: getChildCards(id)
      };
    }

    const jsonCards = Object.keys(cards)
      .map(id => ({ id, card: cards[id] }))
      .filter(({ id, card }) => !card.parent)
      .map(({ id, card }) => getJsonFromCard(id, card))
      .map(jsonCard => ({
        ...jsonCard,
        childCards: flattenDeep(jsonCard.childCards.map(flattenCard))
      }));

    return {
      title: boardConfig.name || 'Unnamed Board',
      date: boardConfig.created,
      users: Object.keys(users).map(id => ({ id, name: users[id].name })),
      cards: jsonCards
    };
  };

  handleExportPdf = () => {
    // TODO: Implement Michaels PDF backend once it's implemented.
    throw Error('PDF export is not implemented yet');
  };

  handleExportJson = () => {
    const data = this.exportJson();
    const dataStr =
      'data:application/json;charset=utf-8,' + encodeURI(JSON.stringify(data));

    // Trick to trigger download dialog in browser:
    // create anchor element, set data encoded as href and click that element, then remove it
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', 'export.json');
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  handleExportPrint = () => {
    window.location.hash = this.props.boardPrintUrl;
  };

  handleExport = (format: ExportFormats = 'print') => {
    switch (format) {
      case 'pdf':
        return this.handleExportPdf();
      case 'csv':
        return this.handleExportCsv();
      case 'json':
        return this.handleExportJson();
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

  closePhaseIntro = () => {
    this.setState({ ...this.state, showPhaseIntro: false });
  };

  render() {
    let { boardConfig, setupCompleted } = this.props;
    const configLoaded = boardConfig && Object.keys(boardConfig).length > 0;
    if (!configLoaded || !setupCompleted) {
      return <LoadingScreen />;
    }

    const showSettings = this.state.showModal === 'settings';
    const showFeedback = this.state.showModal === 'feedback';
    const showShareDialog = this.state.showModal === 'share';
    const showDonate = this.state.showModal === 'donate';
    const showIntro =
      !showSettings && !showFeedback && this.state.showPhaseIntro;

    return (
      <div className="board-page">
        <Header
          boardId={this.props.boardSelector}
          onExport={() => this.handleExport()}
          onSignOut={this.props.onSignOut}
          onOpenSettings={() => {
            this.setState({
              showModal: 'settings'
            });
          }}
          onOpenFeedback={() => {
            this.setState({
              showModal: 'feedback'
            });
          }}
          onOpenDonate={() => {
            this.setState({
              showModal: 'donate'
            });
          }}
          onOpenShareDialog={() => {
            this.setState({
              showModal: 'share'
            });
          }}
        />

        <ColumnView
          boardUrl={this.props.boardSelector}
          className="board-page__column-view"
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
            onChangeEmail={this.props.onChangeEmail}
            onClose={() => {
              this.setState({
                showModal: undefined
              });
            }}
          />
        )}

        {showShareDialog && (
          <ShareModal
            onClose={() => {
              this.setState({ showModal: undefined });
            }}
          />
        )}

        {showFeedback && (
          <FeedbackModal
            sendMail={(content: string, email?: string) => {
              /* FIXME */
            }}
            onClose={() => {
              this.setState({
                showModal: undefined
              });
            }}
          />
        )}

        {showDonate && (
          <DonateModal
            onClose={() => {
              this.setState({
                showModal: undefined
              });
            }}
          />
        )}

        <ReactCSSTransitionGroup
          transitionName="phase-splash__animation"
          transitionAppear={
            false /* TODO true breaks carousel width calculation */
          }
          transitionAppearTimeout={600}
          transitionEnterTimeout={600}
          transitionLeaveTimeout={600}
          transitionEnter={true}
          transitionLeave={true}
        >
          {showIntro && (
            <PhaseSplash
              key="phase-splash"
              phase={getPhaseConfiguration(
                boardConfig.mode,
                this.props.boardConfig.guidedPhase
              )}
              onClose={this.closePhaseIntro}
            />
          )}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

function firebaseConnector(props: RouteComponentProps<{ id: string }>) {
  return [`/boards/${props.match.params.id}`, `/presence`];
}

export default compose(
  firebaseConnect(firebaseConnector),
  connect(mapStateToProps, mapDispatchToProps, mergeProps)
)(Board) as React.ComponentClass<any>;
